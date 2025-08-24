import { pgTable, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
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
})




export const userIntegrations = pgTable("user_integrations", {
    id: varchar("id", { length: 36 }).primaryKey(),
    
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    integrationId: varchar("integration_id", { length: 36 }).references(() => test.name, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})