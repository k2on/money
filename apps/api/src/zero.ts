import {
  createMutators as createMutatorsShared,
  isLoggedIn,
  type Mutators,
  queries,
  type Schema,
  schema,
} from "@money/shared";
import type { AuthData } from "@money/shared/auth";
import {
  plaidAccessTokens,
  plaidAccounts,
  plaidLink,
  transaction,
} from "@money/shared/db";
import {
  type ReadonlyJSONValue,
  type Transaction,
  withValidation,
} from "@rocicorp/zero";
import { PostgresJSConnection } from "@rocicorp/zero/pg";
import {
  handleGetQueriesRequest,
  PushProcessor,
  ZQLDatabase,
} from "@rocicorp/zero/server";
import { randomUUID } from "crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  CountryCode,
  Products,
  SandboxItemFireWebhookRequestWebhookCodeEnum,
  WebhookType,
} from "plaid";
import postgres from "postgres";
import { db } from "./db";
import { getHono } from "./hono";
import { plaidClient } from "./plaid";
import { transactionFromPlaid } from "./plaid/tx";

const processor = new PushProcessor(
  new ZQLDatabase(
    new PostgresJSConnection(postgres(process.env.ZERO_UPSTREAM_DB! as string)),
    schema,
  ),
);

// type Tx = Transaction<Schema>;

const createMutators = (authData: AuthData | null) => {
  const mutators = createMutatorsShared(authData);
  return {
    ...mutators,
    link: {
      ...mutators.link,
      async create() {
        isLoggedIn(authData);
        const r = await plaidClient.linkTokenCreate({
          user: {
            client_user_id: authData.user.id,
          },
          client_name: "Koon Money",
          language: "en",
          products: [Products.Transactions],
          country_codes: [CountryCode.Us],
          webhook: "https://webhooks.koon.us/api/webhook_receiver",
          hosted_link: {},
        });
        const { link_token, hosted_link_url } = r.data;

        if (!hosted_link_url) throw Error("No link in response");

        await db.insert(plaidLink).values({
          id: randomUUID() as string,
          user_id: authData.user.id,
          link: hosted_link_url,
          token: link_token,
        });
      },

      async get(_, { link_token }) {
        isLoggedIn(authData);

        try {
          const token = await db.query.plaidLink.findFirst({
            where: and(
              eq(plaidLink.token, link_token),
              eq(plaidLink.user_id, authData.user.id),
            ),
          });
          if (!token) throw Error("Link not found");
          if (token.completeAt) return;

          const linkResp = await plaidClient.linkTokenGet({
            link_token,
          });
          if (!linkResp) throw Error("No link respo");

          console.log("linkResp");
          console.log(JSON.stringify(linkResp.data, null, 4));

          const item_add_result = linkResp.data.link_sessions
            ?.at(0)
            ?.results?.item_add_results.at(0);

          // We will assume its not done yet.
          if (!item_add_result) return;

          const { data } = await plaidClient.itemPublicTokenExchange({
            public_token: item_add_result.public_token,
          });

          console.log("data", data);

          const token_id = randomUUID();
          await db.insert(plaidAccessTokens).values({
            id: token_id,
            userId: authData.user.id,
            token: data.access_token,
            logoUrl: "",
            name: item_add_result.institution?.name || "Unknown",
          });

          await db
            .update(plaidLink)
            .set({
              completeAt: new Date(),
            })
            .where(eq(plaidLink.token, link_token));

          for (const account of item_add_result.accounts) {
            if (account.id == undefined) {
              console.error("account has not id", account);
              continue;
            }
            await db.insert(plaidAccounts).values({
              id: account.id,
              user_id: authData.user.id,
              token_id: token_id,
              name: account.name || "unknown",
              type: account.type || "unknown",
              mask: account.mask || "0000",
            });
          }
        } catch (e) {
          console.error(e);
          throw Error("Plaid error");
        }
      },
      async webhook() {
        isLoggedIn(authData);

        const accounts = await db.query.plaidAccessTokens.findMany({
          where: eq(plaidAccessTokens.userId, authData.user.id),
        });
        if (accounts.length == 0) {
          console.error("No accounts");
          return;
        }

        const account = accounts.at(0)!;

        const { data } = await plaidClient.sandboxItemFireWebhook({
          access_token: account.token,
          webhook_type: WebhookType.Transactions,
          webhook_code:
            SandboxItemFireWebhookRequestWebhookCodeEnum.DefaultUpdate,
        });

        console.log(data);
      },
      async sync() {
        isLoggedIn(authData);

        const accounts = await db.query.plaidAccessTokens.findMany({
          where: eq(plaidAccessTokens.userId, authData.user.id),
        });
        if (accounts.length == 0) {
          console.error("No accounts");
          return;
        }

        const account = accounts.at(0)!;

        const { data } = await plaidClient.transactionsSync({
          access_token: account.token,
          cursor: account.syncCursor || undefined,
        });

        const added = data.added.map((tx) =>
          transactionFromPlaid(authData.user.id, tx),
        );

        const updated = data.modified.map((tx) =>
          transactionFromPlaid(authData.user.id, tx),
        );

        console.log("added", added.length);
        console.log("updated", updated.length);
        console.log("removed", data.removed.length);
        console.log("next cursor", data.next_cursor);

        await db.transaction(async (tx) => {
          if (added.length) {
            await tx.insert(transaction).values(added);
          }

          if (updated.length) {
            await tx
              .insert(transaction)
              .values(updated)
              .onConflictDoUpdate({
                target: transaction.id,
                set: {
                  name: sql.raw(`excluded.${transaction.name.name}`),
                  amount: sql.raw(`excluded.${transaction.amount.name}`),
                  json: sql.raw(`excluded.${transaction.json.name}`),
                },
              });
          }

          if (data.removed.length) {
            await tx.delete(transaction).where(
              inArray(
                transaction.id,
                data.removed.map((tx) => tx.transaction_id),
              ),
            );
          }

          await tx
            .update(plaidAccessTokens)
            .set({ syncCursor: data.next_cursor })
            .where(eq(plaidAccessTokens.id, account.id));
        });
      },
    },
  } as const satisfies Mutators;
};

const zero = getHono()
  .post("/mutate", async (c) => {
    const authData = c.get("auth");

    const result = await processor.process(createMutators(authData), c.req.raw);

    return c.json(result);
  })
  .post("/get-queries", async (c) => {
    const authData = c.get("auth");

    const result = await handleGetQueriesRequest(
      (name, args) => ({ query: getQuery(authData, name, args) }),
      schema,
      c.req.raw,
    );

    return c.json(result);
  });

const validatedQueries = Object.fromEntries(
  Object.values(queries).map((q) => [q.queryName, withValidation(q)]),
);

function getQuery(
  authData: AuthData | null,
  name: string,
  args: readonly ReadonlyJSONValue[],
) {
  if (name in validatedQueries) {
    const q = validatedQueries[name];
    return q(authData, ...args);
  }
  throw new Error(`Unknown query: ${name}`);
}

export { zero };
