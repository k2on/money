import * as Table from "./table";
import { useQuery } from "@rocicorp/zero/react";
import { queries, type Transaction } from '@money/shared';
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
}

const COLUMNS: Table.Column[] = [
  { name: 'createdAt', label: 'Date', render: (n) => new Date(n).toDateString() },
  { name: 'amount', label: 'Amount' },
  { name: 'name', label: 'Name' },
];


export function Transactions() {
  const { auth } = use(RouterContext);
  const [items] = useQuery(queries.allTransactions(auth));

  return (
    <Table.Provider
      data={items}
      columns={COLUMNS} >
        <Table.Body />
        {/* Spacer */}
        <View style={{ flex: 1 }} />
      <Selected />
    </Table.Provider>
  )
}

function Selected() {
  const { data, idx, selectedFrom } = use(Table.Context);

  if (selectedFrom == undefined)
  return (
    <View style={{ backgroundColor: '#ddd' }}>
      <Text style={{ fontFamily: 'mono' }}>No items selected</Text>
    </View>
  );

  const from = Math.min(idx, selectedFrom);
  const to = Math.max(idx, selectedFrom);
  const selected = data.slice(from, to + 1) as Transaction[];
  const count = selected.length;
  const sum = selected.reduce((prev, curr) => prev + curr.amount, 0);

  return (
    <View style={{ backgroundColor: '#9f9' }}>
      <Text style={{ fontFamily: 'mono' }}>{count} transaction{count == 1 ? "" : "s"} selected | ${FORMAT.format(sum)}</Text>
    </View>
  );
}


