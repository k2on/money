import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://laptop:3000",
  plugins: [
    deviceAuthorizationClient(),
  ]
});


