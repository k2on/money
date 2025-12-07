import { useEffect, useRef } from "react";
import { keysStore } from "./store";
import type { Key } from "./types";
import { enforceKeyOptions } from "./util";

export const useShortcut = (key: Key, handler: () => void) => {
  const keyOptions = enforceKeyOptions(key);
  const keyName = keyOptions.name;
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    keysStore.register(keyName, ref);
    return () => {
      keysStore.deregister(keyName);
    };
  }, []);
};
