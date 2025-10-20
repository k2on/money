import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV == 'production' ? 'https://money-api.koon.us' : "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "money",
      storagePrefix: "money",
      storage: SecureStore,
    }),
    genericOAuthClient(),
  ]
});
