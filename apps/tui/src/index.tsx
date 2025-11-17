import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App, type Route } from "@money/ui";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from '@money/shared';
import { use, useState } from "react";
import { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { Auth } from "./auth";
import { AuthContext, type AuthType } from "./auth/context";

const userID = "anon";
const server = "http://laptop:4848";
// const auth = undefined;

const PATH = join(homedir(), ".local", "share", "money");

function Main({ auth: initalAuth }: { auth: AuthType | null }) {
  const [auth, setAuth] = useState(initalAuth);

  return (
    <AuthContext.Provider value={{ auth, setAuth: (auth) => {
      if (auth) {
        mkdirSync(PATH, { recursive: true });
        writeFileSync(PATH + "/auth.json", JSON.stringify(auth));
        setAuth(auth);
      } else {
        rmSync(PATH + "token");
      }
    } }}>
      {auth ? <Authed /> : <Auth />}
    </AuthContext.Provider>
  );
}



function Authed() {
  const { auth } = use(AuthContext);
  return (
    <ZeroProvider {...{ userID, auth: auth?.token, server, schema }}>
      <Router />
    </ZeroProvider>
  );
}

function Router() {
  const { auth } = use(AuthContext);
  const [route, setRoute] = useState<Route>("/");

  return (
    <App
      auth={auth?.auth || null}
      route={route}
      setRoute={setRoute}
    />
  );
}

const renderer = await createCliRenderer();
const auth = existsSync(PATH + "/auth.json") ? JSON.parse(readFileSync(PATH + "/auth.json", 'utf8')) as AuthType : null;
createRoot(renderer).render(<Main auth={auth} />);
