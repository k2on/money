import { RGBA, TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App, type Route } from "@money/ui";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from '@money/shared';
import { useState } from "react";

const userID = "anon";
const server = "http://laptop:4848";
const auth = undefined;

function Main() {
  return (
    <ZeroProvider {...{ userID, auth, server, schema }}>
      <Router />
    </ZeroProvider>
  );
}

function Router() {
  const [route, setRoute] = useState<Route>("/");

  return (
    <App
      auth={null}
      route={route}
      setRoute={setRoute}
    />
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<Main />);
