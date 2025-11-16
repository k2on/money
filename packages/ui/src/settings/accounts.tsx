import { useQuery } from "@rocicorp/zero/react";
import { queries } from '@money/shared';
import * as Table from "../table";
import { use } from "react";
import { RouterContext } from "..";

const COLUMNS: Table.Column[] = [
  { name: 'name', label: 'Name' },
  { name: 'createdAt', label: 'Added At', render: (n) => new Date(n).toLocaleString() },
];

export function Accounts() {
  const { auth } = use(RouterContext);
  const [items] = useQuery(queries.getItems(auth));

  return (
    <Table.Provider columns={COLUMNS} data={items}>
      <Table.Body />
    </Table.Provider>
  );
}


