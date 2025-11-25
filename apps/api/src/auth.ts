import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, deviceAuthorization, genericOAuth } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { drizzleSchema } from "@money/shared/db";
import { db } from "./db";
import { BASE_URL, HOST } from "@money/shared";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: drizzleSchema,
    provider: "pg",
    usePlural: true,
  }),
  trustedOrigins: [
    "http://localhost:8081",
    `exp://${HOST}:8081`,
    `${BASE_URL}:8081`,
    "https://money.koon.us",
    "money://",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV == "production",
      domain: "koon.us",
    },
  },
  plugins: [
    expo(),
    genericOAuth({
      config: [
        {
          providerId: "koon-family",
          clientId: process.env.OAUTH_CLIENT_ID!,
          clientSecret: process.env.OAUTH_CLIENT_SECRET!,
          discoveryUrl: process.env.OAUTH_DISCOVERY_URL!,
          scopes: ["profile", "email"],
        },
      ],
    }),
    deviceAuthorization(),
    bearer(),
  ],
});
