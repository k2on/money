import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
  numeric,
} from "drizzle-orm/pg-core";

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

export const plaidLink = pgTable("plaidLink", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  link: text("link").notNull(),
  token: text("token").notNull(),
  completeAt: timestamp("complete_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const plaidAccessTokens = pgTable("plaidAccessToken", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logoUrl").notNull(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  syncCursor: text("sync_cursor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const plaidAccounts = pgTable("plaidAccounts", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  token_id: text("token_id")
    .notNull()
    .references(() => plaidAccessTokens.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  mask: text("mask").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  account_id: text("account_id")
    .notNull()
    .references(() => plaidAccounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: decimal("amount").notNull(),
  datetime: timestamp("datetime"),
  authorized_datetime: timestamp("authorized_datetime"),
  json: text("json"),
  category_id: text("category_id"),
  category_assigned_by: text("category_assigned_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accountRelations = relations(plaidAccounts, ({ many }) => ({
  transaction: many(transaction),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  account: one(plaidAccounts, {
    fields: [transaction.account_id],
    references: [plaidAccounts.id],
  }),
  category: one(category, {
    fields: [transaction.category_id],
    references: [category.id],
  }),
}));

export const budget = pgTable("budget", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  label: text("label").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  budgetId: text("budget_id").notNull(),
  amount: decimal("amount").notNull(),
  every: text("every", { enum: ["year", "month", "week"] }).notNull(),
  order: numeric("order").notNull(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  removedBy: text("removed_by"),
  removedAt: timestamp("removed_at"),
});

export const budgetRelations = relations(budget, ({ many }) => ({
  categories: many(category),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  budget: one(budget, {
    fields: [category.budgetId],
    references: [budget.id],
  }),
  transactions: many(transaction),
}));
