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

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "instructor",
  "learner",
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull().default("learner"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("idx_wm_workspace").on(t.workspaceId),
    userIdx: index("idx_wm_user").on(t.userId),
    uniqueMember: index("idx_wm_unique").on(t.workspaceId, t.userId),
  })
);

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  interval: varchar("interval", { length: 20 }).default("monthly").notNull(), // monthly | yearly
  // Structured entitlements
  maxCourses: integer("max_courses").default(1).notNull(),
  maxCohorts: integer("max_cohorts").default(1).notNull(),
  maxMaterialPages: integer("max_material_pages").default(50).notNull(),
  maxAssignmentsPerMonth: integer("max_assignments_per_month").default(1).notNull(),
  maxAttemptsPerMonth: integer("max_attempts_per_month").default(30).notNull(),
  maxInstructorSeats: integer("max_instructor_seats").default(1).notNull(),
  maxStudentSeats: integer("max_student_seats").default(25).notNull(),
  maxAiGenerations: integer("max_ai_generations").default(5).notNull(),
  maxWebsearches: integer("max_websearches").default(10).notNull(),
  exportTypes: jsonb("export_types").default(["none"]).notNull(), // ["none"] | ["csv"] | ["csv","pdf"]
  analyticsLevel: varchar("analytics_level", { length: 20 }).default("basic").notNull(), // basic | full | api
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billings = pgTable(
  "billings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull(), // active, cancelled, expired, trialing
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    workspaceIdx: index("idx_billings_workspace").on(t.workspaceId),
    userIdx: index("idx_billings_user").on(t.userId),
    statusIdx: index("idx_billings_status").on(t.status),
  })
);

export const usageLedgerEventEnum = pgEnum("usage_ledger_event", [
  "assignment_created",
  "attempt_submitted",
  "ai_generation",
  "material_ingested",
  "export_downloaded",
  "websearch_used",
]);

export const usageLedger = pgTable(
  "usage_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    eventType: usageLedgerEventEnum("event_type").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("idx_ledger_workspace").on(t.workspaceId),
    eventIdx: index("idx_ledger_event").on(t.eventType),
    createdIdx: index("idx_ledger_created").on(t.createdAt),
    workspaceEventIdx: index("idx_ledger_ws_event").on(t.workspaceId, t.eventType),
  })
);

export const usage = pgTable("usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id"), // nullable for migration
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

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  workspaceIdx: index("idx_courses_workspace").on(t.workspaceId),
}));

export const studentGroups = pgTable("student_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index("idx_sg_workspace").on(t.workspaceId),
}));

export const quizzes = pgTable("quizzes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: uuid("workspace_id"),
  courseId: uuid("course_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 36 }),
  sourceType: varchar("source_type", { length: 50 }).default("ai").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  submitted: boolean("submitted").default(false).notNull(),
}, (t) => ({
  workspaceIdx: index("idx_quizzes_workspace").on(t.workspaceId),
  courseIdx: index("idx_quizzes_course").on(t.courseId),
}));

export type GetQuiz = InferSelectModel<typeof quizzes>;
export type NewQuiz = InferInsertModel<typeof quizzes>;

export const questions = pgTable("questions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  quizId: varchar("quiz_id", { length: 36 }),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  answer: integer("answer").notNull(),
  explanation: text("explanation"),
  sourceDocumentId: varchar("source_document_id", { length: 36 }),
  sourcePage: integer("source_page"),
  sourceExcerpt: text("source_excerpt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (t) => ({
  quizIdx: index("idx_questions_quiz").on(t.quizId),
}));

export const indexingStatusEnum = pgEnum("indexing_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const documents = pgTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: uuid("workspace_id"),
  courseId: uuid("course_id"),
  userId: varchar("user_id", { length: 36 }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  uploadUrl: text("upload_url").notNull(),
  indexingStatus: indexingStatusEnum("indexing_status").default("completed").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  workspaceIdx: index("idx_docs_workspace").on(t.workspaceId),
  courseIdx: index("idx_docs_course").on(t.courseId),
}));

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: varchar("document_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  pageNumber: integer("page_number"),
  chunkIndex: integer("chunk_index").notNull(),
  vectorId: varchar("vector_id", { length: 255 }),
  metadata: jsonb("metadata"),
}, (t) => ({
  docIdx: index("idx_chunks_doc").on(t.documentId),
}));

export type GetQuestion = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;

export const results = pgTable(
  "results",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    quizId: varchar("quiz_id", { length: 36 }), 
    score: integer("score").notNull(),
    optionsReview: text("quiz_review").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    workspaceId: uuid("workspace_id"),
    assignmentId: uuid("assignment_id"),
    attemptId: varchar("attempt_id", { length: 36 }),
    overrideScore: integer("override_score"),
    instructorComments: text("instructor_comments"),
    gradedBy: varchar("graded_by", { length: 36 }),
    gradedAt: timestamp("graded_at"),
  },
  (t) => ({
    userIdx: index("idx_results_user").on(t.userId),
    quizIdx: index("idx_results_quiz").on(t.quizId),
    workspaceIdx: index("idx_results_workspace").on(t.workspaceId),
    assignmentIdx: index("idx_results_assignment").on(t.assignmentId),
    attemptIdx: index("idx_results_attempt").on(t.attemptId),
  })
);

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

export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "graded",
]);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    quizId: varchar("quiz_id", { length: 36 })
      .references(() => quizzes.id, { onDelete: "cascade" })
      .notNull(),
    score: integer("score"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
    assignmentId: uuid("assignment_id"),
    workspaceId: uuid("workspace_id"),
    answers: jsonb("answers"),
    status: attemptStatusEnum("status").default("in_progress").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    timeTakenSeconds: integer("time_taken_seconds"),
  },
  (t) => ({
    userIdx: index("idx_attempts_user").on(t.userId),
    quizIdx: index("idx_attempts_quiz").on(t.quizId),
    assignmentIdx: index("idx_attempts_assignment").on(t.assignmentId),
    workspaceIdx: index("idx_attempts_workspace").on(t.workspaceId),
    statusIdx: index("idx_attempts_status").on(t.status),
    submittedIdx: index("idx_attempts_submitted").on(t.submittedAt),
  })
);

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

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    actorUserId: varchar("actor_user_id", { length: 36 }),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: varchar("entity_id", { length: 36 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("idx_events_workspace").on(t.workspaceId),
    typeIdx: index("idx_events_type").on(t.eventType),
    entityIdx: index("idx_events_entity").on(t.entityType, t.entityId),
    actorIdx: index("idx_events_actor").on(t.actorUserId),
    createdIdx: index("idx_events_created").on(t.createdAt),
    workspaceTypeIdx: index("idx_events_ws_type").on(t.workspaceId, t.eventType),
  })
);

export const aiRequests = pgTable(
  "ai_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    requestType: varchar("request_type", { length: 50 }).notNull(),
    model: varchar("model", { length: 100 }),
    tokensIn: integer("tokens_in").default(0).notNull(),
    tokensOut: integer("tokens_out").default(0).notNull(),
    latencyMs: integer("latency_ms"),
    costEstimate: numeric("cost_estimate", { precision: 10, scale: 6 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("idx_air_workspace").on(t.workspaceId),
    userIdx: index("idx_air_user").on(t.userId),
    typeIdx: index("idx_air_type").on(t.requestType),
    createdIdx: index("idx_air_created").on(t.createdAt),
  })
);

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  quizId: varchar("quiz_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  publishedAt: timestamp("published_at"),
  maxAttempts: integer("max_attempts").default(1).notNull(),
  timeLimitMinutes: integer("time_limit_minutes"),
  isPublic: boolean("is_public").default(false).notNull(),
  shareToken: varchar("share_token", { length: 100 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index("idx_assignments_workspace").on(t.workspaceId),
  quizIdx: index("idx_assignments_quiz").on(t.quizId),
}));

export const assignmentMembers = pgTable("assignment_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id").notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  status: varchar("status", { length: 50 }).default("assigned").notNull(),
  attemptsUsed: integer("attempts_used").default(0).notNull(),
  lastAttemptAt: timestamp("last_attempt_at"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  assignmentIdx: index("idx_am_assignment").on(t.assignmentId),
  userIdx: index("idx_am_user").on(t.userId),
  uniqueMember: index("idx_am_unique").on(t.assignmentId, t.userId),
}));
