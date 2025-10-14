import type { Transaction } from "@rocicorp/zero";
import type { AuthData } from "./auth";
import type { Schema } from "./schema";
import { isLoggedIn } from "./zql";

type Tx = Transaction<Schema>;

export function createMutators(authData: AuthData | null) {
  return {
    transaction: {
      async create(tx: Tx, { name, amount }: { name: string, amount: number }) {
        isLoggedIn(authData);
        await tx.mutate.transaction.insert({
          id: 'id-' + Math.random().toString(),
          user_id: authData.user.id,
          name,
          amount,
        })
      }
    }
  } as const;
}

export type Mutators = ReturnType<typeof createMutators>;
