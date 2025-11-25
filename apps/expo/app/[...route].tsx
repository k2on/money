import { useLocalSearchParams } from "expo-router";
import { App, type Route } from "@money/ui";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const { route: initalRoute } = useLocalSearchParams<{ route: string[] }>();
  const [route, setRoute] = useState(
    initalRoute ? "/" + initalRoute.join("/") : "/",
  );

  const { data } = authClient.useSession();

  useEffect(() => {
    const handler = () => {
      const newRoute = window.location.pathname.slice(1);
      setRoute(newRoute);
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <App
      auth={data}
      route={route as Route}
      setRoute={(page) => {
        window.history.pushState({}, "", page);
        setRoute(page);
      }}
    />
  );
}
