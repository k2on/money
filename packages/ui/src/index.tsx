import { Text } from "react-native";
import { List } from "./list";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from '@money/shared';

export function Settings() {
  const [items] = useQuery(queries.getItems(null));

  return <List
    items={items}
    renderItem={({ item, isSelected }) => <Text style={{ color: isSelected ? 'white' : 'black' }}>{item.name}</Text>}
  />
}


