import { pgTable, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id", { length: 36 }).primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 100 }),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const quizzes = pgTable("quizzes", {
    id: varchar("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    submitted: boolean("submitted").notNull().default(false),
});

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

export const results = pgTable("results", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    optionsReview: text("quiz_review").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const test = pgTable("test", {
    name: varchar("name", { length: 100 }).notNull().primaryKey(),
});

export const NotionIntegration = pgTable("NotionIntegration", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "cascade" }),
    notionAccessTokenHash: varchar("notion_access_token_hash", { length: 255 }),
    notionRefreshTokenHash: varchar("notion_refresh_token_hash", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leaderboard = pgTable("leaderboard", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    totalScore: integer("total_score").notNull().default(0),
    highestScore: integer("highest_score").notNull().default(0),
    quizzesPlayed: integer("quizzes_played").notNull().default(0),
    rank: integer("rank"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
