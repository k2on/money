import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { App, type Route } from "@money/ui";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema, createMutators } from "@money/shared";
import { useState } from "react";
import { AuthClientLayer, getAuth } from "./auth";
import { Effect } from "effect";
import { BunContext } from "@effect/platform-bun";
import type { AuthData } from "./schema";
import { kvStore } from "./store";
import { config } from "./config";

function Main({ auth }: { auth: AuthData }) {
  const [route, setRoute] = useState<Route>("/");
  const renderer = useRenderer();

  useKeyboard((key) => {
    if (key.name == "c" && key.ctrl) process.exit(0);
    if (key.name == "i" && key.meta) renderer.console.toggle();
  });

  return <App auth={auth} route={route} setRoute={setRoute} />;
}

const auth = await Effect.runPromise(
  getAuth.pipe(
    Effect.provide(BunContext.layer),
    Effect.provide(AuthClientLayer),
  ),
);
const renderer = await createCliRenderer({ exitOnCtrlC: false });
createRoot(renderer).render(
  <ZeroProvider
    {...{
      userID: auth.user.id,
      auth: auth.session.token,
      server: config.zeroUrl,
      schema,
      mutators: createMutators(auth),
      kvStore,
    }}
  >
    <Main auth={auth} />
  </ZeroProvider>,
);
