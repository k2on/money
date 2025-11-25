import { useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { KeyEvent } from "@opentui/core";

function convertName(keyName: string): string {
  const result = keyName.toLowerCase();
  if (result == "arrowdown") return "down";
  if (result == "arrowup") return "up";
  return result;
}

export function useKeyboard(
  handler: (key: KeyEvent) => void,
  deps: any[] = [],
) {
  useEffect(() => {
    const handlerWeb = (event: KeyboardEvent) => {
      // @ts-ignore
      handler({
        name: convertName(event.key),
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        shift: event.shiftKey,
        option: event.metaKey,
        sequence: "",
        number: false,
        raw: "",
        eventType: "press",
        source: "raw",
        code: event.code,
        super: false,
        hyper: false,
        capsLock: false,
        numLock: false,
        baseCode: event.keyCode,
        preventDefault: () => event.preventDefault(),
      });
    };

    // @ts-ignore
    window.addEventListener("keydown", handlerWeb);
    return () => {
      // @ts-ignore
      window.removeEventListener("keydown", handlerWeb);
    };
  }, deps);
}
