import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  trustedOrigins: ["money://", "http://localhost:8081"],
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
