import type { Context } from "hono";
import { plaidClient } from "./plaid";
// import { LinkSessionFinishedWebhook, WebhookType } from "plaid";

export const webhook = async (c: Context) => {

  console.log("Got webhook");
  const b = await c.req.text();
  console.log("body:", b);
  

  return c.text("Hi");

}
