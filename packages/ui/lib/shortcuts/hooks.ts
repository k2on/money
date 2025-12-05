import { useEffect, useRef } from "react";
import { keysStore } from "./store";

export const useShortcut = (key: string, handler: () => void) => {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    keysStore.register(key, ref);
    return () => {
      keysStore.deregister(key);
    };
  }, []);
};
