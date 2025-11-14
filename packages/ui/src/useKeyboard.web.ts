import { useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { KeyEvent } from "@opentui/core";


export function useKeyboard(handler: (key: KeyEvent) => void, deps: any[] = []) {
  useEffect(() => {
    const handlerWeb = (event: KeyboardEvent) => {
      // @ts-ignore
      handler({
        name: event.key.toLowerCase(),
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        shift: event.shiftKey,
        option: event.metaKey,
        sequence: '',
        number: false,
        raw: '',
        eventType: 'press',
        source: "raw",
        code: event.code,
        super: false,
        hyper: false,
        capsLock: false,
        numLock: false,
        baseCode: event.keyCode,
      });
    };

    // @ts-ignore
    window.addEventListener("keydown", handlerWeb);
    // @ts-ignore
    return () => window.removeEventListener("keydown", handlerWeb);
  }, deps);
}
