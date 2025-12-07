import { use, useRef, useState } from "react";
import { View, Text, TextInput } from "react-native";
import { RouterContext } from ".";
import {
  queries,
  type Category,
  type Mutators,
  type Schema,
} from "@money/shared";
import { useQuery, useZero } from "@rocicorp/zero/react";
import * as Table from "../components/Table";
import { Button } from "../components/Button";
import * as Dialog from "../components/Dialog";

const COLUMNS: Table.Column[] = [
  { name: "label", label: "Name" },
  { name: "week", label: "Week" },
  { name: "month", label: "Month" },
  { name: "year", label: "Year" },
  { name: "order", label: "Order" },
];

export function Budget() {
  const { auth } = use(RouterContext);
  const [budgets] = useQuery(queries.getBudgets(auth));
  const [renaming, setRenaming] = useState<Category>();

  const z = useZero<Schema, Mutators>();
  const refText = useRef("");

  const newBudget = () => {
    const id = new Date().getTime().toString();
    const categoryId = new Date().getTime().toString();
    z.mutate.budget.create({
      id,
      categoryId,
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

  const data = budget.categories.slice().map((category) => {
    const { amount } = category;
    const week = amount;
    const month = amount * 4;
    const year = amount * 12;

    return {
      ...category,
      ...{
        week,
        month,
        year,
      },
    };
  });

  const newCategory = ({ index }: { index: number }) => {
    const id = new Date().getTime().toString();
    z.mutate.budget.createCategory({
      id,
      budgetId: budget.id,
      order: index - 1,
    });
  };

  const deleteCategory = ({ selected }: { selected: { id: string }[] }) => {
    for (const { id } of selected) {
      z.mutate.budget.deleteCategory({ id });
    }
  };

  const renameCategory = ({ selected }: { selected: Category[] }) => {
    for (const category of selected) {
      setRenaming(category);
    }
  };

  return (
    <>
      <Dialog.Provider
        visible={renaming != undefined}
        close={() => setRenaming(undefined)}
      >
        <Dialog.Content>
          <Text style={{ fontFamily: "mono" }}>Edit Category</Text>

          <TextInput
            style={{ fontFamily: "mono" }}
            autoFocus
            selectTextOnFocus
            defaultValue={renaming?.label}
            onChangeText={(t) => {
              refText.current = t;
            }}
            onKeyPress={(e) => {
              if (!renaming) return;
              if (e.nativeEvent.key == "Enter") {
                z.mutate.budget.updateCategory({
                  id: renaming.id,
                  label: refText.current,
                });
                setRenaming(undefined);
              } else if (e.nativeEvent.key == "Escape") {
                setRenaming(undefined);
              }
            }}
          />
        </Dialog.Content>
      </Dialog.Provider>

      <View style={{ alignItems: "flex-start" }}>
        <Text style={{ fontFamily: "mono", textAlign: "left" }}>
          Selected Budget: {budget.label}
        </Text>
      </View>
      <Table.Provider
        data={data}
        columns={COLUMNS}
        shortcuts={[
          { key: "i", handler: newCategory },
          { key: "d", handler: deleteCategory },
          { key: "r", handler: renameCategory },
        ]}
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
