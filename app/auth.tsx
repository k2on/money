import { Button, View } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function Auth() {
  const onLogin = () => {
    authClient.signIn.oauth2({
      providerId: "koon-family",
      callbackURL: "http://localhost:8081"
    });
  };

  return (
    <View>
      <Button onPress={onLogin} title="Login with Koon Family" />
    </View>
  )
}
