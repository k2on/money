import { syncedQueryWithContext } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from ".";
import { type AuthData } from "./auth";
import { isLoggedIn } from "./zql";

export const queries = {
  me: syncedQueryWithContext('me', z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.users
      .where('id', '=', authData.user.id)
      .one();
  }),
  allTransactions: syncedQueryWithContext('allTransactions', z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.transaction
      .where('user_id', '=', authData.user.id)
      .orderBy('datetime', 'desc')
      .limit(50)
  }),
  getPlaidLink: syncedQueryWithContext('getPlaidLink', z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.plaidLink
      .where('user_id', '=', authData.user.id)
      .orderBy('createdAt', 'desc')
      .one();
  }),
  getBalances: syncedQueryWithContext('getBalances', z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.balance
      .where('user_id', '=', authData.user.id)
      .orderBy('name', 'asc');
  }),
  getItems: syncedQueryWithContext('getItems', z.tuple([]), (authData: AuthData | null) => {
    // isLoggedIn(authData);
    return builder.plaidAccessTokens
      // .where('userId', '=', authData.user.id)
      .orderBy('createdAt', 'desc');
  })
};
