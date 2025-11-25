import { authClient } from "@/lib/auth-client";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

export default function Page() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { isPending, data } = authClient.useSession();
  if (isPending) return <Text>Loading...</Text>;
  if (!isPending && !data) return <Text>Please log in</Text>;

  useEffect(() => {
    authClient.device.approve({
      userCode: code,
    });
  }, []);

  return <Text>Approving: {code}</Text>;
}
