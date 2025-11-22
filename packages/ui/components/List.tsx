import { useState, type ReactNode } from "react";
import { View, Text } from "react-native";
import { useKeyboard } from "../src/useKeyboard";

export type ListProps<T> = {
  items: T[],
  renderItem: (props: { item: T, isSelected: boolean }) => ReactNode;
};
export function List<T>({ items, renderItem }: ListProps<T>) {
  const [idx, setIdx] = useState(0);

  useKeyboard((key) => {
    if (key.name == 'j') {
      setIdx((prevIdx) => prevIdx + 1 < items.length ? prevIdx + 1 : items.length - 1);
    } else if (key.name == 'k') {
      setIdx((prevIdx) => prevIdx == 0 ? 0 : prevIdx - 1);
    } else if (key.name == 'g' && key.shift) {
      setIdx(items.length - 1);
    }
  }, [items]);

  return (
    <View>
      {items.map((item, index) => <View style={{ backgroundColor: index == idx ? 'black' : undefined }}>
        {renderItem({ item, isSelected: index == idx })}
      </View>)}
    </View>
  );
}

