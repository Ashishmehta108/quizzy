import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
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

// Cohorts for grouping students
export const cohorts = pgTable("cohorts", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  courseIdx: index("idx_cohorts_course").on(t.courseId),
}));

export const cohortMembers = pgTable("cohort_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  cohortId: uuid("cohort_id").notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 50 }).default("learner").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  cohortIdx: index("idx_cohort_members_cohort").on(t.cohortId),
  userIdx: index("idx_cohort_members_user").on(t.userId),
  uniqueMember: index("idx_cohort_members_unique").on(t.cohortId, t.userId),
}));

export const indexingStatusEnum = pgEnum("indexing_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

// Course Materials - links documents to courses (Library-first workflow)
export const courseMaterials = pgTable("course_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull(),
  documentId: varchar("document_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  materialType: varchar("material_type", { length: 50 }).default("document").notNull(), // document, link, video, etc.
  externalUrl: text("external_url"),
  orderIndex: integer("order_index").default(0).notNull(),
  indexingStatus: indexingStatusEnum("indexing_status").default("completed").notNull(),
  version: integer("version").default(1).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  courseIdx: index("idx_course_materials_course").on(t.courseId),
  documentIdx: index("idx_course_materials_document").on(t.documentId),
  courseDocIdx: index("idx_course_materials_unique").on(t.courseId, t.documentId),
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
  quizCreatedIdx: index("idx_questions_quiz_created").on(t.quizId, t.createdAt),
}));

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
    userQuizIdx: index("idx_results_user_quiz").on(t.userId, t.quizId),
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
    sessionCreatedIdx: index("idx_messages_session_created").on(t.sessionId, t.createdAt),
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

// Student assignment submissions/attempts
export const assignmentAttempts = pgTable("assignment_attempts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assignmentId: uuid("assignment_id").notNull(),
  userId: varchar("user_id", { length: 36 }), // null for public submissions
  studentEmail: varchar("student_email", { length: 255 }), // for public submissions
  studentName: varchar("student_name", { length: 255 }), // for public submissions
  quizId: varchar("quiz_id", { length: 36 }).notNull(),
  answers: jsonb("answers").notNull(), // { questionId: selectedOptionIndex }
  score: integer("score").default(0).notNull(),
  totalQuestions: integer("total_questions").default(0).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).default("0").notNull(),
  timeTakenSeconds: integer("time_taken_seconds").default(0).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  status: varchar("status", { length: 50 }).default("in_progress").notNull(), // in_progress, submitted, graded
  attemptNumber: integer("attempt_number").default(1).notNull(),
  gradedBy: varchar("graded_by", { length: 36 }),
  gradedAt: timestamp("graded_at"),
  feedback: text("feedback"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  assignmentIdx: index("idx_assignment_attempts_assignment").on(t.assignmentId),
  userIdx: index("idx_assignment_attempts_user").on(t.userId),
  quizIdx: index("idx_assignment_attempts_quiz").on(t.quizId),
  statusIdx: index("idx_assignment_attempts_status").on(t.status),
  submittedIdx: index("idx_assignment_attempts_submitted").on(t.submittedAt),
  assignmentStatusIdx: index("idx_assign_attempts_assign_status").on(t.assignmentId, t.status),
}));

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  workspaceMembers: many(workspaceMembers),
  billings: many(billings),
  quizzes: many(quizzes),
  documents: many(documents),
  results: many(results),
  quizAttempts: many(quizAttempts),
  notionIntegrations: many(NotionIntegration),
  aiRequests: many(aiRequests),
  events: many(events, { relationName: "actorUser" }),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  workspaceMembers: many(workspaceMembers),
  billings: many(billings),
  courses: many(courses),
  studentGroups: many(studentGroups),
  quizzes: many(quizzes),
  documents: many(documents),
  results: many(results),
  quizAttempts: many(quizAttempts),
  usageLedger: many(usageLedger),
  events: many(events),
  aiRequests: many(aiRequests),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  billings: many(billings),
}));

export const billingsRelations = relations(billings, ({ one, many }) => ({
  user: one(users, {
    fields: [billings.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [billings.workspaceId],
    references: [workspaces.id],
  }),
  plan: one(plans, {
    fields: [billings.planId],
    references: [plans.id],
  }),
  usage: many(usage),
}));

export const usageLedgerRelations = relations(usageLedger, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [usageLedger.workspaceId],
    references: [workspaces.id],
  }),
}));

export const usageRelations = relations(usage, ({ one }) => ({
  billing: one(billings, {
    fields: [usage.billingId],
    references: [billings.id],
  }),
  workspace: one(workspaces, {
    fields: [usage.workspaceId],
    references: [workspaces.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [courses.workspaceId],
    references: [workspaces.id],
  }),
  quizzes: many(quizzes),
  documents: many(documents),
  cohorts: many(cohorts),
  courseMaterials: many(courseMaterials),
}));

export const cohortsRelations = relations(cohorts, ({ one, many }) => ({
  course: one(courses, {
    fields: [cohorts.courseId],
    references: [courses.id],
  }),
  members: many(cohortMembers),
}));

export const cohortMembersRelations = relations(cohortMembers, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortMembers.cohortId],
    references: [cohorts.id],
  }),
  user: one(users, {
    fields: [cohortMembers.userId],
    references: [users.id],
  }),
}));

export const courseMaterialsRelations = relations(courseMaterials, ({ one }) => ({
  course: one(courses, {
    fields: [courseMaterials.courseId],
    references: [courses.id],
  }),
  document: one(documents, {
    fields: [courseMaterials.documentId],
    references: [documents.id],
  }),
}));

export const studentGroupsRelations = relations(studentGroups, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [studentGroups.workspaceId],
    references: [workspaces.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [quizzes.workspaceId],
    references: [workspaces.id],
  }),
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [quizzes.userId],
    references: [users.id],
  }),
  questions: many(questions),
  results: many(results),
  quizAttempts: many(quizAttempts),
  assignments: many(assignments),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  document: one(documents, {
    fields: [questions.sourceDocumentId],
    references: [documents.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [documents.workspaceId],
    references: [workspaces.id],
  }),
  course: one(courses, {
    fields: [documents.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  chunks: many(documentChunks),
  questions: many(questions, { relationName: "sourceDocument" }),
  courseMaterials: many(courseMaterials),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  user: one(users, {
    fields: [results.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [results.quizId],
    references: [quizzes.id],
  }),
  workspace: one(workspaces, {
    fields: [results.workspaceId],
    references: [workspaces.id],
  }),
}));

export const notionIntegrationRelations = relations(NotionIntegration, ({ one }) => ({
  user: one(users, {
    fields: [NotionIntegration.userId],
    references: [users.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  workspace: one(workspaces, {
    fields: [quizAttempts.workspaceId],
    references: [workspaces.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [events.workspaceId],
    references: [workspaces.id],
  }),
  actorUser: one(users, {
    fields: [events.actorUserId],
    references: [users.id],
  }),
}));

export const aiRequestsRelations = relations(aiRequests, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [aiRequests.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [aiRequests.userId],
    references: [users.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [assignments.workspaceId],
    references: [workspaces.id],
  }),
  quiz: one(quizzes, {
    fields: [assignments.quizId],
    references: [quizzes.id],
  }),
  members: many(assignmentMembers),
  attempts: many(assignmentAttempts),
}));

export const assignmentAttemptsRelations = relations(assignmentAttempts, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentAttempts.assignmentId],
    references: [assignments.id],
  }),
  user: one(users, {
    fields: [assignmentAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [assignmentAttempts.quizId],
    references: [quizzes.id],
  }),
}));

export const assignmentMembersRelations = relations(assignmentMembers, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentMembers.assignmentId],
    references: [assignments.id],
  }),
  user: one(users, {
    fields: [assignmentMembers.userId],
    references: [users.id],
  }),
}));
