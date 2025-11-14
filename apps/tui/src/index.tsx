import { RGBA, TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Settings } from "@money/ui";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from '@money/shared';

const userID = "anon";
const server = "http://laptop:4848";
const auth = undefined;

function Main() {
  return (
    <ZeroProvider {...{ userID, auth, server, schema }}>
      <Settings />
    </ZeroProvider>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<Main />);
