import { syncedQueryWithContext } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "./zero-schema.gen";
import { type AuthData } from "./auth";
import { isLoggedIn } from "./zql";

export const queries = {
  me: syncedQueryWithContext("me", z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.users.where("id", "=", authData.user.id).one();
  }),
  allTransactions: syncedQueryWithContext(
    "allTransactions",
    z.tuple([]),
    (authData: AuthData | null) => {
      isLoggedIn(authData);
      return builder.transaction
        .where("user_id", "=", authData.user.id)
        .related("account")
        .related("category")
        .orderBy("datetime", "desc");
    },
  ),
  getPlaidLink: syncedQueryWithContext(
    "getPlaidLink",
    z.tuple([]),
    (authData: AuthData | null) => {
      isLoggedIn(authData);
      return builder.plaidLink
        .where(({ cmp, and, or }) =>
          and(
            cmp("user_id", "=", authData.user.id),
            cmp("createdAt", ">", new Date().getTime() - 1000 * 60 * 60 * 4),
            or(
              cmp("completeAt", ">", new Date().getTime() - 1000 * 5),
              cmp("completeAt", "IS", null),
            ),
          ),
        )
        .orderBy("createdAt", "desc")
        .one();
    },
  ),
  getAccounts: syncedQueryWithContext(
    "getAccounts",
    z.tuple([]),
    (authData: AuthData | null) => {
      isLoggedIn(authData);
      return builder.plaidAccounts
        .where("user_id", "=", authData.user.id)
        .orderBy("name", "asc");
    },
  ),
  getItems: syncedQueryWithContext(
    "getItems",
    z.tuple([]),
    (authData: AuthData | null) => {
      isLoggedIn(authData);
      return builder.plaidAccessTokens
        .where("userId", "=", authData.user.id)
        .orderBy("createdAt", "desc");
    },
  ),
  getBudgets: syncedQueryWithContext(
    "getBudgets",
    z.tuple([]),
    (authData: AuthData | null) => {
      isLoggedIn(authData);
      return builder.budget
        .related("categories", (q) =>
          q.where("removedAt", "IS", null).orderBy("order", "asc"),
        )
        .limit(10);
    },
  ),
  getBudgetCategories: syncedQueryWithContext(
    "getBudgetCategories",
    z.tuple([]),
    (authData: AuthData | null) => {
      isLoggedIn(authData);
      return builder.category.orderBy("order", "desc");
    },
  ),
};
