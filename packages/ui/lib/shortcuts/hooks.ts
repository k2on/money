import { useEffect, useRef } from "react";
import { keysStore } from "./store";
import type { Key } from "./types";
import { enforceKeyOptions } from "./util";

export const useShortcut = (
  key: Key,
  handler: () => void,
  scope: string = "global",
) => {
  const keyOptions = enforceKeyOptions(key);
  const keyName = keyOptions.name;
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    keysStore.register(keyName, ref, scope);
    return () => {
      keysStore.deregister(keyName, scope);
    };
  }, []);
};
