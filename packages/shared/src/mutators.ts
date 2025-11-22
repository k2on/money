import type { Transaction } from "@rocicorp/zero";
import type { AuthData } from "./auth";
import { type Schema } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

type Tx = Transaction<Schema>;

export function createMutators(authData: AuthData | null) {
  return {
    link: {
      async create() {},
      async get(tx: Tx, { link_token }: { link_token: string }) {},
      async updateTransactions() {},
      async updateBalences() {},
      async deleteAccounts(tx: Tx, { accountIds }: { accountIds: string[]  }) {
        isLoggedIn(authData);
        for (const id of accountIds) {
          const token = await tx.query.plaidAccessTokens.where("userId", '=', authData.user.id).one();
          if (!token) continue;
          await tx.mutate.plaidAccessTokens.delete({ id });

          const balances = await tx.query.balance
            .where('user_id', '=', authData.user.id)
            .where("tokenId", '=', token.id)
            .run();

          for (const bal of balances) {
            await tx.mutate.balance.delete({ id: bal.id });
            const txs = await tx.query.transaction
              .where('user_id', '=', authData.user.id)
              .where('account_id', '=', bal.tokenId)
              .run();
            for (const transaction of txs) {
              await tx.mutate.transaction.delete({ id: transaction.id });
            }
          }

        }
      },
    }
  } as const;
}

export type Mutators = ReturnType<typeof createMutators>;
