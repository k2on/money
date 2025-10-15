import type { Transaction } from "@rocicorp/zero";
import type { AuthData } from "./auth";
import type { Schema } from ".";
import { isLoggedIn } from "./zql";

type Tx = Transaction<Schema>;

export function createMutators(authData: AuthData | null) {
  return {
    transaction: {
      async create(tx: Tx, { id, name, amount }: { id: string, name: string, amount: number }) {
        isLoggedIn(authData);
        await tx.mutate.transaction.insert({
          id,
          user_id: authData.user.id,
          name,
          amount,
        })
      },
      async deleteAll(tx: Tx) {
        const t = await tx.query.transaction.limit(10);
        for (const i of t) {
          await tx.mutate.transaction.delete({ id: i.id });
        }
      },
    },
    link: {
      async create() {}
    }
  } as const;
}

export type Mutators = ReturnType<typeof createMutators>;
