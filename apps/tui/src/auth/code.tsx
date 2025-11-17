import { QR } from "@/util/qr";
import type { ReactNode } from "react";

function CodeDisplay({ children }: { children: ReactNode }) {
  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box flexDirection="row" gap={2}>
        {children}
      </box>
    </box>
  );
}


export function Display({ code }: { code: string }) {
  const URL = `https://money.koon.us/approve?code=${code}`;

  return <CodeDisplay>
    <text fg="black">{QR(URL)}</text>
    <box justifyContent="center" gap={1}>
      <text fg="black">Welcome to Koon Money</text>
      <text fg="black">Go to: {URL}</text>
      <text fg="black">Code: {code}</text>
    </box>
  </CodeDisplay>
}

export function Loading() {
  return <CodeDisplay>
    <box width={29} height={15} backgroundColor="gray" /> 
    <box justifyContent="center" gap={1}>
      <text fg="black">Welcome to Koon Money</text>
      <text fg="black">You need to login first</text>
      <text fg="black">Loading login information</text>
    </box>
  </CodeDisplay>
}

export function Error({ msg }: { msg: string }) {
  return <CodeDisplay>
    <box justifyContent="center" alignItems="center" gap={1}>
      <text fg="red">Could not login</text>
      <text fg="red">{msg}</text>
    </box>
  </CodeDisplay>
}


