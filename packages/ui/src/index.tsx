import { Table, type Column } from "./table";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from '@money/shared';


export type Account = {
  name: string;
  createdAt: number;
}

const COLUMNS: Column[] = [
  { name: 'createdAt', label: 'Created At', render: (n) => new Date(n).toDateString() },
  { name: 'amount', label: 'Amount' },
  { name: 'name', label: 'Name' },
];


export function Settings() {
  const [items] = useQuery(queries.allTransactions(null));

  return (
    <Table
      data={items}
      columns={COLUMNS}
    />
  )
}


