import { type PlaidAccount, queries, type Transaction } from "@money/shared";
import { useQuery } from "@rocicorp/zero/react";
import { use } from "react";
import { Text, View } from "react-native";
import { RouterContext } from "..";

function getBalances(accounts: PlaidAccount[], items: Transaction[]) {
  return accounts.map((account) => {
    const transactions = items.filter((item) => item.account_id == account.id);

    return {
      ...account,
      ...{
        balance: transactions
          .map((tx) => tx.amount)
          .reduce((prev, curr) => prev + curr, 0),
      },
    };
  });
}

export function Balances() {
  const { auth } = use(RouterContext);
  const [accounts] = useQuery(queries.getAccounts(auth));
  const [transactions] = useQuery(queries.allTransactions(auth));
  const balances = getBalances(accounts, transactions);

  return (
    <View>
      <Text style={{ fontFamily: "mono" }}>
        {balances.map((bal) => bal.name + ": " + bal.balance).join(" ")}
      </Text>
    </View>
  );
}
