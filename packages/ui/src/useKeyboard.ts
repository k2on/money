import { useKeyboard as useOpentuiKeyboard } from "@opentui/react";

export function useKeyboard(
  handler: Parameters<typeof useOpentuiKeyboard>[0],
  _deps: any[] = [],
) {
  return useOpentuiKeyboard(handler);
}
