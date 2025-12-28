import type { transaction } from "@money/shared/db";
import type { Transaction } from "plaid";
import { type InferInsertModel } from "drizzle-orm";
import { randomUUID } from "crypto";

export function transactionFromPlaid(
  userId: string,
  tx: Transaction,
): InferInsertModel<typeof transaction> {
  return {
    id: tx.transaction_id,
    user_id: userId,
    account_id: tx.account_id,
    name: tx.name,
    amount: tx.amount as any,
    datetime: tx.datetime ? new Date(tx.datetime) : new Date(tx.date),
    authorized_datetime: tx.authorized_datetime
      ? new Date(tx.authorized_datetime)
      : undefined,
    json: JSON.stringify(tx),
  };
}
