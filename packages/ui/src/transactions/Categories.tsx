import { type Category, queries } from "@money/shared";
import { useQuery } from "@rocicorp/zero/react";
import { use } from "react";
import { Text, View } from "react-native";
import { formatMoney } from "../../lib/format";
import { RouterContext } from "..";

export function Categories() {
  const { auth } = use(RouterContext);
  const [[budget]] = useQuery(queries.getBudgets(auth));

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {budget?.categories.map((category) => (
        <Category key={category.id} category={category} />
      ))}
    </View>
  );
}

function Category({ category }: { category: Category }) {
  const { auth } = use(RouterContext);
  const [allTransactions] = useQuery(queries.allTransactions(auth));
  const filtered = allTransactions.filter(
    (tx) => tx.category_id == category.id,
  );

  const sum = filtered.reduce((prev, curr) => prev + curr.amount, 0);

  const amount =
    category.every == "week"
      ? category.amount / 4
      : category.every == "month"
        ? category.amount
        : category.amount * 12;

  return (
    <Text
      style={{ fontFamily: "mono" }}
    >{`[${category.label}: ${formatMoney(sum)}/${amount}]`}</Text>
  );
}
