import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { App } from "@money/ui";
import { useEffect, useState } from "react";

export default function Page() {
  const { route: initalRoute } = useLocalSearchParams<{ route: string[] }>();
  const [route, setRoute] = useState(initalRoute[0]!);

  // detect back/forward
  useEffect(() => {
    const handler = () => {
      const newRoute = window.location.pathname.slice(1);
      // call your app’s page change logic
      setRoute(newRoute);
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <App
      page={route as any}
      onPageChange={(page) => {
        window.history.pushState({}, "", "/" + page);
      }}
    />
  );
}
