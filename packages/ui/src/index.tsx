import { createContext, use, useState } from "react";
import { Transactions } from "./transactions";
import { View, Text } from "react-native";
import { Settings } from "./settings";
import { useKeyboard } from "./useKeyboard";


const PAGES = {
  '/': {
    screen: <Transactions />,
    key: "1",
  },
  '/settings': {
    screen: <Settings />,
    key: "2",
    children: {
      "/accounts": {},
      "/family": {},
    }
  },
};

type Join<A extends string, B extends string> =
  `${A}${B}` extends `${infer X}` ? X : never;

type ChildRoutes<Parent extends string, Children> =
  {
    [K in keyof Children & string]:
      K extends `/${string}`
        ? Join<Parent, K>
        : never;
  }[keyof Children & string];

type Routes<T> = {
  [K in keyof T & string]:
    | K
    | (T[K] extends { children: infer C }
        ? ChildRoutes<K, C>
        : never)
}[keyof T & string];

export type Route = Routes<typeof PAGES>;

type Auth = any;

interface RouterContextType {
  auth: Auth;
  route: Route;
  setRoute: (route: Route) => void;
}


export const RouterContext = createContext<RouterContextType>({
  auth: null,
  route: '/',
  setRoute: () => {}
});


type AppProps = {
  auth: Auth;
  route: Route;
  setRoute: (page: Route) => void;
}

export function App({ auth, route, setRoute }: AppProps) {
  return <RouterContext.Provider value={{ auth, route, setRoute }}>
    <Main />
  </RouterContext.Provider>
}

function Main() {
  const { route, setRoute } = use(RouterContext);

  useKeyboard((key) => {
    const screen = Object.entries(PAGES)
      .find(([, screen]) => screen.key == key.name);

    if (!screen) return;

    const [route] = screen as [Route, never];

    setRoute(route);
  });

  const match =
    route in PAGES
      ? (route as keyof typeof PAGES)
      : (Object.keys(PAGES).sort((a, b) => b.length - a.length).find(p => route.startsWith(p)) as
          keyof typeof PAGES);

  return PAGES[match].screen;
}


