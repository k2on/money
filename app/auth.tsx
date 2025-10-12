import { Button, View } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function Auth() {
  const onLogin = () => {
    authClient.signIn.oauth2({
      providerId: "koon-family",
    });
  };

  return (
    <View>
      <Button onPress={onLogin} title="Login with Koon Family" />
    </View>
  )
}
