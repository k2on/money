import { useSyncExternalStore } from "react";
import { View, Text } from "react-native";
import { keysStore, type ScopeKeys } from "./store";

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
      <Text style={{ color: "red", fontFamily: "mono" }}>Scopes:</Text>
      {entries.map(([scope, keys]) => (
        <ScopeView key={scope} scope={scope} keys={keys} />
      ))}
    </View>
  );
}

function ScopeView({ scope, keys }: { scope: string; keys: ScopeKeys }) {
  return (
    <Text style={{ color: "red", fontFamily: "mono", textAlign: "right" }}>
      {scope}:
      {keys
        .entries()
        .map(([key, _]) => key)
        .toArray()
        .join(",")}
    </Text>
  );
}
