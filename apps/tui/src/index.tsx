import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App, type Route } from "@money/ui";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from '@money/shared';
import { useState } from "react";
import { AuthClient, getAuth, layer } from "./auth";
import { Effect, Layer } from "effect";
import { BunContext } from "@effect/platform-bun";
import type { AuthData } from "./schema";

const userID = "anon";
const server = "http://laptop:4848";

function Main({ auth }: { auth: AuthData }) {
  const [route, setRoute] = useState<Route>("/");

  return (
    <ZeroProvider {...{ userID, auth: auth.session.token, server, schema }}>
      <App
        auth={auth || null}
        route={route}
        setRoute={setRoute}
      />
    </ZeroProvider>
  );
}



const auth = await Effect.runPromise(
  getAuth.pipe(
    Effect.provide(BunContext.layer),
    Effect.provide(layer()),
  )
);
const renderer = await createCliRenderer();
createRoot(renderer).render(<Main auth={auth} />);
