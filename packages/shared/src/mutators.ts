import type { Transaction } from "@rocicorp/zero";
import { authDataSchema, type AuthData } from "./auth";
import { type Schema } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

type Tx = Transaction<Schema>;

export function createMutators(authData: AuthData | null) {
  return {
    link: {
      async create() { },
      async get(tx: Tx, { link_token }: { link_token: string }) { },
      async updateTransactions() { },
      async updateBalences() { },
      async deleteAccounts(tx: Tx, { accountIds }: { accountIds: string[] }) {
        isLoggedIn(authData);
        for (const id of accountIds) {
          const token = await tx.query.plaidAccessTokens
            .where("userId", "=", authData.user.id)
            .one();
          if (!token) continue;
          await tx.mutate.plaidAccessTokens.delete({ id });

          const balances = await tx.query.balance
            .where("user_id", "=", authData.user.id)
            .where("tokenId", "=", token.id)
            .run();

          for (const bal of balances) {
            await tx.mutate.balance.delete({ id: bal.id });
            const txs = await tx.query.transaction
              .where("user_id", "=", authData.user.id)
              .where("account_id", "=", bal.tokenId)
              .run();
            for (const transaction of txs) {
              await tx.mutate.transaction.delete({ id: transaction.id });
            }
          }
        }
      },
    },
    budget: {
      async create(
        tx: Tx,
        { id, categoryId }: { id: string; categoryId: string },
      ) {
        isLoggedIn(authData);
        await tx.mutate.budget.insert({
          id,
          orgId: authData.user.id,
          label: "New Budget",
          createdBy: authData.user.id,
        });
        await tx.mutate.category.insert({
          id: categoryId,
          budgetId: id,
          amount: 0,
          every: "week",
          order: 1000,
          label: "My category",
          color: "#f06",
          createdBy: authData.user.id,
        });
      },
      async delete(tx: Tx, { id }: { id: string }) {
        isLoggedIn(authData);
        await tx.mutate.budget.delete({
          id,
        });
      },
      async createCategory(
        tx: Tx,
        {
          id,
          budgetId,
          order,
        }: { id: string; budgetId: string; order?: number },
      ) {
        isLoggedIn(authData);
        tx.mutate.category.insert({
          id,
          budgetId,
          amount: 0,
          every: "week",
          order: order || 0,
          label: "My category",
          color: "#f06",
          createdBy: authData.user.id,
        });
      },
      async deleteCategory(tx: Tx, { id }: { id: string }) {
        isLoggedIn(authData);
        tx.mutate.category.update({
          id,
          removedAt: new Date().getTime(),
          removedBy: authData.user.id,
        });
      },
      async updateCategory(
        tx: Tx,
        { id, label }: { id: string; label: string },
      ) {
        isLoggedIn(authData);
        tx.mutate.category.update({
          id,
          label,
        });
      },
    },
  } as const;
}

export type Mutators = ReturnType<typeof createMutators>;
