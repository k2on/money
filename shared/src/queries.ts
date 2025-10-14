import { syncedQueryWithContext } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "@money/shared";
import { type AuthData } from "./auth";
import { isLoggedIn } from "./zql";

export const queries = {
  allTransactions: syncedQueryWithContext('allTransactions', z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.transaction
      .where('user_id', '=', authData.user.id)
      .limit(10)
  }
  ),
  me: syncedQueryWithContext('me', z.tuple([]), (authData: AuthData | null) => {
    isLoggedIn(authData);
    return builder.users
      .where('id', '=', authData.user.id)
      .one();
  })
};
