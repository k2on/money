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
        padding: 10,
      }}
    >
      <Text style={{ color: "red", fontFamily: "mono" }}>Registered:</Text>
      <Text style={{ color: "red", fontFamily: "mono", textAlign: "right" }}>
        {entries
          .values()
          .map(([key, _]) => key)
          .toArray()
          .join(",")}
      </Text>
    </View>
  );
}
