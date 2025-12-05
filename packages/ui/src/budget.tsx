import { use } from "react";
import { View, Text } from "react-native";
import { RouterContext } from ".";
import { queries, type Mutators, type Schema } from "@money/shared";
import { useQuery, useZero } from "@rocicorp/zero/react";
import * as Table from "../components/Table";
import { Button } from "../components/Button";

const COLUMNS: Table.Column[] = [{ name: "label", label: "Name" }];

export function Budget() {
  const { auth } = use(RouterContext);
  const [budgets] = useQuery(queries.getBudgets(auth));
  // const [items] = useQuery(queries.getBudgetCategories(auth));

  const items: any[] = [];

  const z = useZero<Schema, Mutators>();

  const newBudget = () => {
    const id = new Date().getTime().toString();
    z.mutate.budget.create({
      id,
    });
  };

  if (budgets.length == 0)
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          gap: 10,
        }}
      >
        <Text style={{ fontFamily: "mono" }}>
          No budgets, please create a new budget
        </Text>
        <Button onPress={newBudget} shortcut="n">
          New budget
        </Button>
      </View>
    );

  const budget = budgets[0]!;

  return (
    <>
      <View>
        <Text style={{ fontFamily: "mono" }}>
          Selected Budget: {budget.label}
        </Text>
      </View>
      <Table.Provider
        data={items}
        columns={COLUMNS}
        onKey={(event) => {
          if (event.name == "n" && event.shift) {
            newBudget();
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexShrink: 0 }}>
            <Table.Body />
          </View>
        </View>
      </Table.Provider>
    </>
  );
}
