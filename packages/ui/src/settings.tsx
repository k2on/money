import { Text, View, Pressable } from "react-native";
import { use, useState, type ReactNode } from "react";
import { RouterContext, type Route } from ".";
import { General } from "./settings/general";
import { Accounts } from "./settings/accounts";
import { Family } from "./settings/family";
import { useShortcut } from "../lib/shortcuts";

type SettingsRoute = Extract<Route, `/settings${string}`>;

const TABS = {
  "/settings": {
    label: "💽 General",
    screen: <General />,
  },
  "/settings/accounts": {
    label: "🏦 Bank Accounts",
    screen: <Accounts />,
  },
  "/settings/family": {
    label: "👑 Family",
    screen: <Family />,
  },
} as const satisfies Record<
  SettingsRoute,
  { label: string; screen: ReactNode }
>;

type Tab = keyof typeof TABS;

export function Settings() {
  const { route, setRoute } = use(RouterContext);

  useShortcut("h", () => {
    const currentIdx = Object.entries(TABS).findIndex(
      ([tabRoute, _]) => tabRoute == route,
    );
    const routes = Object.keys(TABS) as SettingsRoute[];
    const last = routes[currentIdx - 1];
    if (!last) return;
    setRoute(last);
  });
  useShortcut("l", () => {
    const currentIdx = Object.entries(TABS).findIndex(
      ([tabRoute, _]) => tabRoute == route,
    );
    const routes = Object.keys(TABS) as SettingsRoute[];
    const next = routes[currentIdx + 1];
    if (!next) return;
    setRoute(next);
  });

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ padding: 10 }}>
        {Object.entries(TABS).map(([tabRoute, tab]) => {
          const isSelected = tabRoute == route;

          return (
            <Pressable
              key={tab.label}
              style={{ backgroundColor: isSelected ? "black" : undefined }}
              onPress={() => setRoute(tabRoute as SettingsRoute)}
            >
              <Text
                style={{
                  fontFamily: "mono",
                  color: isSelected ? "white" : "black",
                }}
              >
                {" "}
                {tab.label}{" "}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View>{TABS[route as Tab].screen}</View>
    </View>
  );
}
