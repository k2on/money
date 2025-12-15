import type { Transaction } from "@rocicorp/zero";
import { authDataSchema, type AuthData } from "./auth";
import { type Category, type Schema } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

type Tx = Transaction<Schema>;

export function createMutators(authData: AuthData | null) {
  return {
    link: {
      async create() {},
      async get(tx: Tx, { link_token }: { link_token: string }) {},
      async webhook() {},
      async sync() {},
      // async updateTransactions() {},
      // async updateBalences() {},
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
        }: { id: string; budgetId: string; order: number },
      ) {
        isLoggedIn(authData);

        if (order != undefined) {
          const after = await tx.query.category
            .where("budgetId", "=", budgetId)
            .where("order", ">", order);

          after.forEach((item) => {
            tx.mutate.category.update({
              id: item.id,
              order: item.order + 1,
            });
          });
        }

        tx.mutate.category.insert({
          id,
          budgetId,
          amount: 0,
          every: "week",
          order: order + 1,
          label: "My category",
          color: "#f06",
          createdBy: authData.user.id,
        });
      },
      async deleteCategory(tx: Tx, { id }: { id: string }) {
        isLoggedIn(authData);
        const item = await tx.query.category.where("id", "=", id).one();
        if (!item) throw Error("Item does not exist");
        tx.mutate.category.update({
          id,
          removedAt: new Date().getTime(),
          removedBy: authData.user.id,
        });
        const after = await tx.query.category
          .where("budgetId", "=", item.budgetId)
          .where("order", ">", item.order)
          .run();
        for (const item of after) {
          tx.mutate.category.update({ id: item.id, order: item.order - 1 });
        }
        // after.forEach((item) => {
        // });
      },
      async updateCategory(
        tx: Tx,
        {
          id,
          label,
          order,
          amount,
          every,
        }: {
          id: string;
          label?: string;
          order?: number;
          amount?: number;
          every?: Category["every"];
        },
      ) {
        isLoggedIn(authData);
        tx.mutate.category.update({
          id,
          label,
          order,
          amount,
          every,
        });
      },
    },
  } as const;
}

export type Mutators = ReturnType<typeof createMutators>;
