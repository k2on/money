import type { ReactNode } from "react";
import { keysStore } from "./store";

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    const fn = keysStore.getHandler(e.key);
    fn?.();
  });
}

export function ShortcutProvider({ children }: { children: ReactNode }) {
  return children;
}
