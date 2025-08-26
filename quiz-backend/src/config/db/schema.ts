import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    varchar,
    text,
    integer,
    timestamp,
    boolean,
    type PgTableWithColumns,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id", { length: 36 }).primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 100 }),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GetUser = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const quizzes = pgTable("quizzes", {
    id: varchar("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    submitted: boolean("submitted").notNull().default(false),
});

export type GetQuiz = InferSelectModel<typeof quizzes>;
export type NewQuiz = InferInsertModel<typeof quizzes>;

export const questions = pgTable("questions", {
    id: varchar("id", { length: 36 }).primaryKey(),
    quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    options: text("options").notNull(),
    answer: integer("answer").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    explanation: text("explanation").notNull(),
});

export type GetQuestion = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;

export const results = pgTable("results", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    optionsReview: text("quiz_review").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export type GetResult = InferSelectModel<typeof results>;
export type NewResult = InferInsertModel<typeof results>;

export const test = pgTable("test", {
    name: varchar("name", { length: 100 }).notNull().primaryKey(),
});

export type GetTest = InferSelectModel<typeof test>;
export type NewTest = InferInsertModel<typeof test>;




export const NotionIntegration = pgTable("NotionIntegration", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "cascade" }),
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
