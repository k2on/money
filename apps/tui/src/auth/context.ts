import { type AuthData } from "@money/shared/auth";
import { createContext } from "react";

export type AuthType = {
  auth: AuthData;
  token: string;
};

export type AuthContextType = {
  auth: AuthType | null;
  setAuth: (auth: AuthContextType['auth']) => void;
};

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => {}
});


