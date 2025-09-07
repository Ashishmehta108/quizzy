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
  jsonb,
  pgEnum,
  index,
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
  apiKey: varchar("api_key", { length: 64 }).unique(),
  apiKeyLastRotatedAt: timestamp("api_key_last_rotated_at").defaultNow(),
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  // razorpayPlanId: varchar("razorpay_plan_id", { length: 255 })
  //   .notNull()
  //   .default(""),
  monthlyLimit: jsonb("monthly_limit").notNull().default({
    websearches: 10,
    quizzesGenerated: 30,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billings = pgTable("billings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  // razorpaySubscriptionId: varchar("razorpay_subscription_id", {
  //   length: 255,
  // }).notNull().default(""),
  // razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(), // active, cancelled, expired
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usage = pgTable("usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  billingId: uuid("billing_id")
    .notNull()
    .references(() => billings.id, { onDelete: "cascade" }),
  websearchesUsed: integer("websearches_used").default(0).notNull(),
  quizzesGeneratedUsed: integer("quizzes_generated_used").default(0).notNull(),
  periodStart: timestamp("period_start").defaultNow().notNull(),
  periodEnd: timestamp("period_end"),
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
  title: varchar("title", { length: 200 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  description: text("description").notNull().default(""),
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

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);
export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "received",
  "error",
]);

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: text("quiz_id").notNull(),
    userId: text("user_id").notNull(), // adapt to your auth (Clerk)
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    quizIdx: index("idx_sessions_quiz").on(t.quizId),
    userQuizIdx: index("idx_sessions_user_quiz").on(t.userId, t.quizId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    quizId: text("quiz_id").notNull(),
    role: messageRoleEnum("role").notNull(),
    status: messageStatusEnum("status").notNull(),
    content: text("content").notNull(),
    tokensIn: integer("tokens_in").default(0).notNull(),
    tokensOut: integer("tokens_out").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    sessionIdx: index("idx_messages_session").on(t.sessionId),
    quizIdx: index("idx_messages_quiz").on(t.quizId),
    createdIdx: index("idx_messages_created").on(t.createdAt),
  })
);
