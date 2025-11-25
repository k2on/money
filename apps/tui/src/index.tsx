import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { App, type Route } from "@money/ui";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from "@money/shared";
import { useState } from "react";
import { AuthClientLayer, getAuth } from "./auth";
import { Effect } from "effect";
import { BunContext } from "@effect/platform-bun";
import type { AuthData } from "./schema";
import { kvStore } from "./store";
import { config } from "./config";

function Main({ auth }: { auth: AuthData }) {
  const [route, setRoute] = useState<Route>("/");

  useKeyboard((key) => {
    if (key.name == "c" && key.ctrl) process.exit(0);
  });

  return (
    <ZeroProvider
      {...{
        userID: auth.user.id,
        auth: auth.session.token,
        server: config.zeroUrl,
        schema,
        kvStore,
      }}
    >
      <App auth={auth} route={route} setRoute={setRoute} />
    </ZeroProvider>
  );
}

const auth = await Effect.runPromise(
  getAuth.pipe(
    Effect.provide(BunContext.layer),
    Effect.provide(AuthClientLayer),
  ),
);
const renderer = await createCliRenderer({ exitOnCtrlC: false });
createRoot(renderer).render(<Main auth={auth} />);
