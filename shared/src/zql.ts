import type { AuthData } from "./auth";

export function isLoggedIn(
  authData: AuthData | null,
): asserts authData is AuthData {
  console.log("AUTHDATA", authData);
  if (!authData?.user.id) {
    throw new Error("User is not logged in");
  }
}
