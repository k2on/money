import type { AuthData } from "@money/shared/auth";
import { createContext, type ReactNode, use } from "react";
import { View } from "react-native";
import {
  type KeyName,
  ShortcutDebug,
  ShortcutProvider,
  useShortcut,
} from "../lib/shortcuts";
import { Budget } from "./budget";
import { Settings } from "./settings";
import { Transactions } from "./transactions";

const PAGES = {
  "/": {
    screen: <Transactions />,
    key: "1",
  },
  "/budget": {
    screen: <Budget />,
    key: "2",
  },
  "/settings": {
    screen: <Settings />,
    key: "3",
    children: {
      "/accounts": {},
      "/family": {},
    },
  },
} satisfies Record<
  string,
  { screen: ReactNode; key: KeyName; children?: Record<string, unknown> }
>;

type Join<A extends string, B extends string> = `${A}${B}` extends `${infer X}`
  ? X
  : never;

type ChildRoutes<Parent extends string, Children> = {
  [K in keyof Children & string]: K extends `/${string}`
  ? Join<Parent, K>
  : never;
}[keyof Children & string];

type Routes<T> = {
  [K in keyof T & string]:
  | K
  | (T[K] extends { children: infer C } ? ChildRoutes<K, C> : never);
}[keyof T & string];

export type Route = Routes<typeof PAGES>;

interface RouterContextType {
  auth: AuthData | null;
  route: Route;
  setRoute: (route: Route) => void;
}

export const RouterContext = createContext<RouterContextType>({
  auth: null,
  route: "/",
  setRoute: () => { },
});

type AppProps = {
  auth: AuthData | null;
  route: Route;
  setRoute: (page: Route) => void;
};

export function App({ auth, route, setRoute }: AppProps) {
  return (
    <RouterContext.Provider value={{ auth, route, setRoute }}>
      <ShortcutProvider>
        <ShortcutDebug />
        <Main />
      </ShortcutProvider>
    </RouterContext.Provider>
  );
}

function Main() {
  const { route, setRoute } = use(RouterContext);

  for (const [route, page] of Object.entries(PAGES)) {
    useShortcut(page.key, () => setRoute(route as Route));
  }

  const match =
    route in PAGES
      ? (route as keyof typeof PAGES)
      : (Object.keys(PAGES)
        .sort((a, b) => b.length - a.length)
        .find((p) => route.startsWith(p)) as keyof typeof PAGES);

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      {PAGES[match].screen}
    </View>
  );
}
