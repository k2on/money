import { authClient } from "@/lib/auth-client";
import { queries } from "@/shared/src";
import { useQuery } from "@rocicorp/zero/react";
import { Link, usePathname, useRouter, type LinkProps } from "expo-router";
import { useEffect } from "react";
import { View, Text, Platform } from "react-native";

type Page = { name: string, href: LinkProps['href'] };
const PAGES: Page[] = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Settings",
    href: "/settings",
  },
];


export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [user] = useQuery(queries.me(session));

  useEffect(() => {
    if (Platform.OS != 'web') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1" && event.ctrlKey) {
        router.push(PAGES.at(0)!.href);
      } else if (event.key === "2" && event.ctrlKey) {
        router.push(PAGES.at(1)!.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#efe" }}>
      <View style={{ flexDirection: "row" }}>
        {PAGES.map(page => <Page
          key={page.name}
          name={page.name}
          href={page.href}
          />)}
      </View>

      <Link href={"#" as any}>
        <Text style={{ fontFamily: 'mono' }}>{user?.name}  </Text>
      </Link>
    </View>
  );
}

function Page({ name, href }: Page) {
  const path = usePathname();

  return (
    <Link href={href }>
      <Text style={{ fontFamily: 'mono' }}>{path == href ? `[ ${name} ]` : `  ${name}  `}</Text>
    </Link>
  )

}
