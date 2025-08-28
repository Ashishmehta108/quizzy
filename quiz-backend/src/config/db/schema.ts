import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  bannedReason: text("banned_reason"),
  apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
  apiKeyLastRotatedAt: timestamp("api_key_last_rotated_at").defaultNow(),
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  razorpayPlanId: varchar("razorpay_plan_id", { length: 255 }).notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const billings = pgTable("billings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  razorpaySubscriptionId: varchar("razorpay_subscription_id", {
    length: 255,
  }).notNull(),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  status: varchar("status", {
    length: 50,
  }).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type GetUser = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const quizzes = pgTable("quizzes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  submitted: boolean("submitted").notNull().default(false),
});

export type GetQuiz = InferSelectModel<typeof quizzes>;
export type NewQuiz = InferInsertModel<typeof quizzes>;

export const questions = pgTable("questions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, {
    onDelete: "cascade",
  }),
  question: text("question").notNull(),
  options: text("options").notNull(),
  answer: integer("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  explanation: text("explanation").notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  uploadUrl: text("upload_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GetQuestion = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;

export const results = pgTable("results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, {
    onDelete: "cascade",
  }),
  score: integer("score").notNull(),
  optionsReview: text("quiz_review").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export type GetResult = InferSelectModel<typeof results>;
export type NewResult = InferInsertModel<typeof results>;

export const NotionIntegration = pgTable("NotionIntegration", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  notionAccessTokenHash: varchar("notion_access_token_hash", { length: 255 }),
  notionRefreshTokenHash: varchar("notion_refresh_token_hash", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  notionWorkspaceId: varchar("notion_workspace_id", { length: 255 }),
  notionWorkspaceName: varchar("notion_workspace_name", { length: 255 }),
  notionWorkspaceIcon: text("notion_workspace_icon"),
  notionBotId: varchar("notion_bot_id", { length: 255 }),
  notionOwner: boolean("notion_owner").default(false),
});

export type GetNotionIntegration = InferSelectModel<typeof NotionIntegration>;
export type NewNotionIntegration = InferInsertModel<typeof NotionIntegration>;

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  quizId: varchar("quiz_id", { length: 36 })
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: text("steps").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
