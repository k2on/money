import {
  type ReadonlyJSONValue,
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
  queries,
  schema,
  type Mutators,
} from "@money/shared";
import type { AuthData } from "@money/shared/auth";
import { getHono } from "./hono";
import { db } from "./db";


const processor = new PushProcessor(
  new ZQLDatabase(
    new PostgresJSConnection(postgres(process.env.ZERO_UPSTREAM_DB! as string)),
    schema,
  ),
);

const createMutators = (authData: AuthData | null) => {
  const mutators = createMutatorsShared(authData);
  return {
    ...mutators,
    link: {
      ...mutators.link,
      async create() {
        console.log("Here is my function running on the server!!!");
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
