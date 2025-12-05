import { type RefObject } from "react";

// internal map
const keys = new Map<string, RefObject<() => void>>();

// cached snapshot (stable reference)
let snapshot: [string, RefObject<() => void>][] = [];

let listeners = new Set<() => void>();

function emit() {
  // refresh snapshot ONLY when keys actually change
  snapshot = Array.from(keys.entries());
  for (const fn of listeners) fn();
}

export const keysStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getSnapshot() {
    return snapshot; // stable unless emit() ran
  },

  register(key: string, ref: RefObject<() => void>) {
    keys.set(key, ref);
    emit();
  },

  deregister(key: string) {
    keys.delete(key);
    emit();
  },

  getHandler(key: string) {
    return keys.get(key)?.current;
  },
};
