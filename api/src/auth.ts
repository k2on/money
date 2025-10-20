import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { drizzleSchema } from "@money/shared/db";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: drizzleSchema,
    provider: "pg",
    usePlural: true,
  }),
  trustedOrigins: ["money://", "http://localhost:8081", "https://money.koon.us"],
  advanced: {
      crossSubDomainCookies: {
          enabled: true,
          domain: "koon.us",
      },
  },
  plugins: [
    expo(),
    genericOAuth({
      config: [
        {
          providerId: 'koon-family',
          clientId: process.env.OAUTH_CLIENT_ID!,
          clientSecret: process.env.OAUTH_CLIENT_SECRET!,
          discoveryUrl: process.env.OAUTH_DISCOVERY_URL!,
          scopes: ["profile", "email"],
        }
      ]
    })
  ]
});
