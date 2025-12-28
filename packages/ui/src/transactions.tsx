import {
  type Mutators,
  type PlaidAccount,
  queries,
  type Schema,
  type Transaction,
} from "@money/shared";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { use } from "react";
import { Text, View } from "react-native";
import * as Table from "../components/Table";
import { RouterContext } from ".";

const FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type Account = {
  name: string;
  createdAt: number;
};

const COLUMNS: Table.Column[] = [
  {
    name: "createdAt",
    label: "Date",
    render: (n) => new Date(n).toDateString(),
  },
  { name: "amount", label: "Amount" },
  { name: "name", label: "Name" },
  // @ts-ignore
  { name: "category", label: "Category", render: (category) => category.label },
  // @ts-ignore
  { name: "account", label: "Account", render: (account) => account.name },
];

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

export function Transactions() {
  const { auth } = use(RouterContext);
  const [transactions] = useQuery(queries.allTransactions(auth));
  const items = transactions.filter(
    (tx) => tx.account?.name == "Plaid Checking",
  );
  const [accounts] = useQuery(queries.getAccounts(auth));

  const z = useZero<Schema, Mutators>();

  const balances = getBalances(accounts, transactions);

  const [[budget]] = useQuery(queries.getBudgets(auth));

  return (
    <>
      <View>
        <Text style={{ fontFamily: "mono" }}>
          {balances.map((bal) => bal.name + ": " + bal.balance).join(" ")}
        </Text>
      </View>
      <View>
        <Text style={{ fontFamily: "mono" }}>
          {budget?.categories
            .map((category) => `[${category.label}: 0/${category.amount}]`)
            .join(" ")}
        </Text>
      </View>
      <Table.Provider
        data={items}
        columns={COLUMNS}
        shortcuts={[{ key: "r", handler: () => z.mutate.link.sync() }]}
      >
        <View style={{ padding: 10, flex: 1 }}>
          <View style={{ flexShrink: 0 }}>
            <Table.Body />
          </View>
        </View>
        <View style={{ flexShrink: 0 }}>
          <Selected />
        </View>
      </Table.Provider>
    </>
  );
}

function Selected() {
  const { data, selectedIdx } = use(Table.Context);

  if (selectedIdx.size == 0)
    return (
      <View style={{ backgroundColor: "#ddd" }}>
        <Text style={{ fontFamily: "mono" }}>No items selected</Text>
      </View>
    );

  const selected = data.filter((_, i) => selectedIdx.has(i)) as Transaction[];
  const count = selected.length;
  const sum = selected.reduce((prev, curr) => prev + curr.amount, 0);

  return (
    <View style={{ backgroundColor: "#9f9" }}>
      <Text style={{ fontFamily: "mono" }}>
        {count} transaction{count == 1 ? "" : "s"} selected | $
        {FORMAT.format(sum)}
      </Text>
    </View>
  );
}
