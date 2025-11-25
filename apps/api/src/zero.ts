import {
  type ReadonlyJSONValue,
  type Transaction,
  withValidation,
} from "@rocicorp/zero";
import {
  handleGetQueriesRequest,
  PushProcessor,
  ZQLDatabase,
} from "@rocicorp/zero/server";
import { PostgresJSConnection } from "@rocicorp/zero/pg";
import postgres from "postgres";
import {
  createMutators as createMutatorsShared,
  isLoggedIn,
  queries,
  schema,
  type Mutators,
  type Schema,
} from "@money/shared";
import type { AuthData } from "@money/shared/auth";
import { getHono } from "./hono";
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
import { randomUUID } from "crypto";
import { db } from "./db";
import {
  balance,
  plaidAccessTokens,
  plaidLink,
  transaction,
} from "@money/shared/db";
import { and, eq, inArray, sql, type InferInsertModel } from "drizzle-orm";
import { plaidClient } from "./plaid";

const processor = new PushProcessor(
  new ZQLDatabase(
    new PostgresJSConnection(postgres(process.env.ZERO_UPSTREAM_DB! as string)),
    schema,
  ),
);

type Tx = Transaction<Schema>;

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

          console.log(JSON.stringify(linkResp.data, null, 4));

          const item_add_result = linkResp.data.link_sessions
            ?.at(0)
            ?.results?.item_add_results.at(0);

          // We will assume its not done yet.
          if (!item_add_result) return;

          const { data } = await plaidClient.itemPublicTokenExchange({
            public_token: item_add_result.public_token,
          });

          await db.insert(plaidAccessTokens).values({
            id: randomUUID(),
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
        } catch (e) {
          console.error(e);
          throw Error("Plaid error");
        }
      },

      async updateTransactions() {
        isLoggedIn(authData);
        const accounts = await db.query.plaidAccessTokens.findMany({
          where: eq(plaidAccessTokens.userId, authData.user.id),
        });
        if (accounts.length == 0) {
          console.error("No accounts");
          return;
        }

        for (const account of accounts) {
          const { data } = await plaidClient.transactionsGet({
            access_token: account.token,
            start_date: "2025-10-01",
            end_date: new Date().toISOString().split("T")[0],
          });

          const transactions = data.transactions.map(
            (tx) =>
              ({
                id: randomUUID(),
                user_id: authData.user.id,
                plaid_id: tx.transaction_id,
                account_id: tx.account_id,
                name: tx.name,
                amount: tx.amount as any,
                datetime: tx.datetime
                  ? new Date(tx.datetime)
                  : new Date(tx.date),
                authorized_datetime: tx.authorized_datetime
                  ? new Date(tx.authorized_datetime)
                  : undefined,
                json: JSON.stringify(tx),
              }) satisfies InferInsertModel<typeof transaction>,
          );

          await db
            .insert(transaction)
            .values(transactions)
            .onConflictDoNothing({
              target: transaction.plaid_id,
            });

          const txReplacingPendingIds = data.transactions
            .filter((t) => t.pending_transaction_id)
            .map((t) => t.pending_transaction_id!);

          await db
            .delete(transaction)
            .where(inArray(transaction.plaid_id, txReplacingPendingIds));
        }
      },

      async updateBalences() {
        isLoggedIn(authData);
        const accounts = await db.query.plaidAccessTokens.findMany({
          where: eq(plaidAccessTokens.userId, authData.user.id),
        });
        if (accounts.length == 0) {
          console.error("No accounts");
          return;
        }

        for (const account of accounts) {
          const { data } = await plaidClient.accountsBalanceGet({
            access_token: account.token,
          });
          await db
            .insert(balance)
            .values(
              data.accounts.map((bal) => ({
                id: randomUUID(),
                user_id: authData.user.id,
                plaid_id: bal.account_id,
                avaliable: bal.balances.available as any,
                current: bal.balances.current as any,
                name: bal.name,
                tokenId: account.id,
              })),
            )
            .onConflictDoUpdate({
              target: balance.plaid_id,
              set: {
                current: sql.raw(`excluded.${balance.current.name}`),
                avaliable: sql.raw(`excluded.${balance.avaliable.name}`),
              },
            });
        }
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
