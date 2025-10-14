import { syncedQuery } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "@money/shared";

export const queries = {
  allTransactions: syncedQuery('allTransactions', z.tuple([]), () =>
    builder.transaction.limit(10)
  ),
};
