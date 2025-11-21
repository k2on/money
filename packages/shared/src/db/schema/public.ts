import { pgTable, text, boolean, timestamp, uniqueIndex, decimal } from "drizzle-orm/pg-core";

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  plaid_id: text("plaid_id").notNull().unique(),
  account_id: text("account_id").notNull(),
  name: text("name").notNull(),
  amount: decimal("amount").notNull(),
  datetime: timestamp("datetime"),
  authorized_datetime: timestamp("authorized_datetime"),
  json: text("json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const plaidLink = pgTable("plaidLink", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  link: text("link").notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const balance = pgTable("balance", {
  id: text("id").primaryKey(),
  user_id: text("userId").notNull(),
  plaid_id: text("plaidId").notNull().unique(),
  avaliable: decimal("avaliable").notNull(),
  current: decimal("current").notNull(),
  name: text("name").notNull(),
  tokenId: text("tokenId").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const plaidAccessTokens = pgTable("plaidAccessToken", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logoUrl").notNull(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
