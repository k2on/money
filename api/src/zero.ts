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
import { PostgresJSConnection } from '@rocicorp/zero/pg';
import postgres from 'postgres';
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
import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from "plaid";
import { randomUUID } from "crypto";
import { db } from "./db";
import { plaidAccessTokens, plaidLink, transaction } from "@money/shared/db";
import { eq } from "drizzle-orm";


const configuration = new Configuration({
  basePath: PlaidEnvironments.production,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    }
  }
});
const plaidClient = new PlaidApi(configuration);


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
        console.log("Creating Link token");
        const r = await plaidClient.linkTokenCreate({
          user: {
            client_user_id: authData.user.id,
          },
          client_name: "Koon Money",
          language: "en",
          products: [Products.Transactions],
          country_codes: [CountryCode.Us],
          hosted_link: {}
        });
        console.log("Result", r);
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

        const linkResp = await plaidClient.linkTokenGet({
          link_token,
        });
        if (!linkResp) throw Error("No link respo");
        console.log(JSON.stringify(linkResp.data, null, 4));
        const publicToken = linkResp.data.link_sessions?.at(0)?.results?.item_add_results.at(0)?.public_token;

        if (!publicToken) throw Error("No public token");
        const { data } = await plaidClient.itemPublicTokenExchange({
          public_token: publicToken,
        })

        await db.insert(plaidAccessTokens).values({
          id: randomUUID(),
          userId: authData.user.id,
          token: data.access_token,
        });
      },
      async updateTransactions() {
        isLoggedIn(authData);
        const accessToken = await db.query.plaidAccessTokens.findFirst({
          where: eq(plaidAccessTokens.userId, authData.user.id)
        });
        if (!accessToken) throw Error("No plaid account");

        const { data } = await plaidClient.transactionsGet({
          access_token: accessToken.token,
          start_date: "2025-10-01",
          end_date: "2025-10-15",
        });

        for (const t of data.transactions) {
          await db.insert(transaction).values({
            id: randomUUID(),
            user_id: authData.user.id,
            name: t.name,
            amount: t.amount,
          });
        }

      }
    }
  } as const satisfies Mutators;
}

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
