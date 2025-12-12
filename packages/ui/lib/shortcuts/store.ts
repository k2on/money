import { type RefObject } from "react";

export type ScopeKeys = Map<string, RefObject<() => void>>;

// outer reactive container
const scopes = new Map<string, ScopeKeys>();

// stable snapshot for subscribers
let snapshot: [string, ScopeKeys][] = [];

const listeners = new Set<() => void>();

function emit() {
  // replace identity so subscribers re-render
  snapshot = Array.from(scopes.entries());
  for (const fn of listeners) fn();
}

export const keysStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getSnapshot() {
    return snapshot;
  },

  register(key: string, ref: RefObject<() => void>, scope: string) {
    const prev = scopes.get(scope);
    const next = new Map(prev); // <-- important: new identity
    next.set(key, ref);

    scopes.set(scope, next); // <-- outer identity also changes
    emit();
  },

  deregister(key: string, scope: string) {
    const prev = scopes.get(scope);
    if (!prev) return;

    const next = new Map(prev);
    next.delete(key);

    if (next.size === 0) {
      scopes.delete(scope);
    } else {
      scopes.set(scope, next);
    }
    emit();
  },

  getHandler(key: string) {
    // last scope wins — clarify this logic as needed
    const last = Array.from(scopes.values()).at(-1);
    return last?.get(key)?.current;
  },
};
