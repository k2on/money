import type { ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { keysStore } from "./store";

export function ShortcutProvider({ children }: { children: ReactNode }) {
  useKeyboard((e) => {
    const fn = keysStore.getHandler(e.name);
    fn?.();
  });

  return children;
}
