import { serve } from "@hono/node-server";
import { authDataSchema } from "@money/shared/auth";
import { BASE_URL } from "@money/shared";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { getHono } from "./hono";
import { zero } from "./zero";
import { webhook } from "./webhook";

const app = getHono();

app.use(
  "/api/*",
  cors({
    origin: ['https://money.koon.us', `${BASE_URL}:8081`],
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("*", async (c, next) => {
  const authHeader = c.req.raw.headers.get("Authorization");
  const cookie = authHeader?.split("Bearer ")[1];

  const newHeaders = new Headers(c.req.raw.headers);

  if (cookie) {
    newHeaders.set("Cookie", cookie);
  }

  const session = await auth.api.getSession({ headers: newHeaders });

  if (!session) {
    c.set("auth", null);
    return next();
  }
  c.set("auth", authDataSchema.parse(session));
  return next();
});

app.route("/api/zero", zero);

app.get("/api", (c) => c.text("OK"));
app.get("/api/webhook_receiver", webhook);
app.get("/", (c) => c.text("OK"));

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  (info) => {
    console.log(`Server is running on ${info.address}:${info.port}`);
  },
);
