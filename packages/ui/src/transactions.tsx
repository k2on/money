import {
  type Category,
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
import { formatMoney } from "../lib/format";
import { RouterContext } from ".";
import { Balances } from "./transactions/Budgets";
import { Categories } from "./transactions/Categories";

const COLUMNS: Table.Column[] = [
  {
    name: "createdAt",
    label: "Date",
    render: (n) => new Date(n as number).toDateString(),
  },
  { name: "amount", label: "Amount" },
  { name: "name", label: "Name" },
  {
    name: "category",
    label: "Category",
    render: (category) => (category as Category).label,
  },
  {
    name: "account",
    label: "Account",
    render: (account) => (account as PlaidAccount).name,
  },
];

export function Transactions() {
  const { auth } = use(RouterContext);
  const [transactions] = useQuery(queries.allTransactions(auth));
  const items = transactions.filter(
    (tx) => tx.account?.name == "Plaid Checking",
  );

  const z = useZero<Schema, Mutators>();

  return (
    <>
      <Balances />
      <Categories />
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
        {formatMoney(sum)}
      </Text>
    </View>
  );
}
