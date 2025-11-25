import { createAuthClient } from "better-auth/react";
import {
  deviceAuthorizationClient,
  genericOAuthClient,
} from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@money/shared";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV == "production"
      ? "https://money-api.koon.us"
      : `${BASE_URL}:3000`,
  plugins: [
    expoClient({
      scheme: "money",
      storagePrefix: "money",
      storage: SecureStore,
    }),
    genericOAuthClient(),
    deviceAuthorizationClient(),
  ],
});
