import type { ReactNode } from "react";
import { keysStore } from "./store";
import type { KeyName } from "./types";

const KEY_MAP: { [k: string]: KeyName } = {
  Escape: "escape",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    const key = Object.hasOwn(KEY_MAP, e.key) ? KEY_MAP[e.key]! : e.key;
    const fn = keysStore.getHandler(key);
    // console.log(e.key);
    if (!fn) return;
    e.preventDefault();
    fn();
  });
}

export function ShortcutProvider({ children }: { children: ReactNode }) {
  return children;
}
