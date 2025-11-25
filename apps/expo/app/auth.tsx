import { Button, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { BASE_URL } from "@money/shared";

export default function Auth() {
  const onLogin = () => {
    authClient.signIn.oauth2({
      providerId: "koon-family",
      callbackURL:
        process.env.NODE_ENV == "production"
          ? "https://money.koon.us"
          : `${BASE_URL}:8081`,
    });
  };

  return (
    <View>
      <Button onPress={onLogin} title="Login with Koon Family" />
    </View>
  );
}
