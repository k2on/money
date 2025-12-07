import type { Key, KeyOptions } from "./types";

export function enforceKeyOptions(key: Key): KeyOptions {
  return typeof key == "string"
    ? {
        name: key,
      }
    : key;
}
