import { useSyncExternalStore } from "react";
import { View, Text } from "react-native";
import { keysStore } from "./store";

export function ShortcutDebug() {
  const entries = useSyncExternalStore(
    keysStore.subscribe,
    keysStore.getSnapshot,
  );

  return (
    <View
      style={{
        position: "absolute",
        zIndex: 100,
        bottom: 0,
        right: 0,
        backgroundColor: "black",
      }}
    >
      <Text style={{ color: "red", fontFamily: "mono" }}>
        {entries
          .values()
          .map(([key, _]) => key)
          .toArray()
          .join(",")}
      </Text>
    </View>
  );
}
