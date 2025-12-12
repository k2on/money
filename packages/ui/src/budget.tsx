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
import { RenameCategoryDialog } from "./budget/RenameCategoryDialog";
import {
  UpdateCategoryAmountDialog,
  type CategoryWithComputed,
  type Updating,
} from "./budget/UpdateCategoryAmountDialog";

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
  const [editCategoryAmount, setEditCategoryAmount] = useState<Updating>();

  const z = useZero<Schema, Mutators>();

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
    const week = amount / 4;
    const month = amount;
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
      order: index,
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

  const onEditCategoryYearly = ({
    selected,
  }: { selected: CategoryWithComputed[] }) => {
    for (const category of selected) {
      setEditCategoryAmount({ category, every: "year" });
    }
  };

  const onEditCategoryMonthly = ({
    selected,
  }: { selected: CategoryWithComputed[] }) => {
    for (const category of selected) {
      setEditCategoryAmount({ category, every: "month" });
    }
  };

  const onEditCategoryWeekly = ({
    selected,
  }: { selected: CategoryWithComputed[] }) => {
    for (const category of selected) {
      setEditCategoryAmount({ category, every: "week" });
    }
  };

  return (
    <>
      <RenameCategoryDialog renaming={renaming} setRenaming={setRenaming} />
      <UpdateCategoryAmountDialog
        updating={editCategoryAmount}
        setUpdating={setEditCategoryAmount}
      />

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
          { key: "y", handler: onEditCategoryYearly },
          { key: "m", handler: onEditCategoryMonthly },
          { key: "w", handler: onEditCategoryWeekly },
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
