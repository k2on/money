import * as Table from "../components/Table";
import { useQuery, useZero } from "@rocicorp/zero/react";
import {
  queries,
  type Mutators,
  type Schema,
  type Transaction,
} from "@money/shared";
import { use } from "react";
import { View, Text } from "react-native";
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
];

export function Transactions() {
  const { auth } = use(RouterContext);
  const [items] = useQuery(queries.allTransactions(auth));

  const z = useZero<Schema, Mutators>();

  return (
    <Table.Provider
      data={items}
      columns={COLUMNS}
      shortcuts={[
        { key: "r", handler: () => z.mutate.link.updateTransactions() },
      ]}
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
