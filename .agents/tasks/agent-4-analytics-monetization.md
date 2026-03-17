# Agent 4 — Analytics & Monetization

> **You are Agent 4.** Read this entire file before writing any code. This is your complete instruction set. You do NOT need any other spec file to do your work.

---

## 1. Coordination Protocol

### Your Workspace

Your working directory is `./agent-todo/agent-4/`. Create it at startup. Maintain these files:

| File | Purpose |
|---|---|
| `data.json` | Your live status. Update every meaningful step. |
| `agent-job.md` | Written **only** on completion. Summary of what you built, what changed, what downstream agents need. |
| `locks.json` | Files you currently own. No other agent may touch these. |

### `data.json` schema

```json
{
  "agentId": 4,
  "status": "in_progress | blocked | done | error",
  "currentTask": "human-readable description of what you are doing right now",
  "filesOpen": ["list of files you are actively editing"],
  "percentComplete": 0,
  "lastUpdated": "ISO-8601 timestamp",
  "blockedOn": "agent-3 if waiting",
  "errors": []
}
```

Update `percentComplete` as you go: 0 → start, 10 → schema done, 30 → repositories done, 50 → services done, 70 → controllers done, 85 → frontend done, 95 → testing, 100 → agent-job.md written.

### `locks.json` schema

```json
{
  "lockedFiles": [
    "quiz-backend/src/repositories/analytics.repository.ts",
    "quiz-backend/src/repositories/attempt.repository.ts",
    "quiz-backend/src/services/analytics.service.ts",
    "quiz-backend/src/services/export.service.ts",
    "quiz-backend/src/controllers/analytics.controller.ts",
    "quiz-backend/src/controllers/export.controller.ts",
    "quiz-backend/src/routes/analytics.routes.ts",
    "quiz-backend/src/routes/export.routes.ts",
    "quiz-app/app/dashboard/courses/[id]/analytics/page.tsx",
    "quiz-app/app/dashboard/assignments/[id]/results/page.tsx",
    "quiz-app/app/dashboard/attempts/[id]/page.tsx",
    "quiz-app/app/pricing/page.tsx",
    "quiz-app/components/dashboard/UpgradeModal.tsx",
    "quiz-app/components/dashboard/ScoreChart.tsx",
    "quiz-app/components/dashboard/AnalyticsCard.tsx"
  ],
  "lockedAt": "ISO-8601 timestamp",
  "agentId": 4
}
```

Write `locks.json` **before** you create or edit any file. If a file is listed in another agent's `locks.json`, **stop and report a conflict**.

### Dependency Position

```
Agent 1 → Agent 2 + Agent 3 → YOU (Agent 4)
```

**BLOCKING RULE**: Do NOT start until **both** exist:
1. `./agent-todo/agent-1/agent-job.md`
2. `./agent-todo/agent-3/agent-job.md`

Agent 2's `agent-job.md` is **optional** — if it exists, read it for library/document context, but you can proceed without it.

While waiting, set `data.json.status` to `"blocked"` and `blockedOn` to `"agent-1,agent-3"` (or whichever hasn't finished). Poll every 30 seconds.

Once dependencies are done, read their `agent-job.md` files to learn:
- **From Agent 1**: `checkEntitlement()` API, `workspaces` shape, `usage_ledger` shape, middleware exports
- **From Agent 3**: `assignments`, `assignment_members` table shapes, attempt data contract (`./agent-todo/agent-3/attempt-contract.json`), auto-grading logic
- **From Agent 2** (if available): `courses`, `documents`, `document_chunks` table shapes

---

## 2. Schema Ownership (EXCLUSIVE)

**You own these tables. No other agent may create, alter, or add relations to them.**

| Table | Status |
|---|---|
| `results` | Existing — modify in-place |
| `quiz_attempts` | Existing — modify in-place (extend per Agent 3's data contract) |
| `events` | **New** — create (analytics event log) |
| `ai_requests` | **New** — create (AI usage tracking) |

**You do NOT own**: `users`, `workspaces`, `workspace_members`, `plans`, `billings`, `usage`, `usage_ledger`, `courses`, `student_groups`, `documents`, `document_chunks`, `quizzes`, `questions`, `assignments`, `assignment_members`, or any tables owned by Agents 1/2/3.

When referencing tables you don't own, use plain `varchar`/`uuid` columns without `.references()`:

```typescript
// YES — plain FK
assignmentId: uuid("assignment_id"),   // assignments owned by Agent 3
workspaceId: uuid("workspace_id"),     // workspaces owned by Agent 1

// NO — cross-ownership import
assignmentId: uuid("assignment_id").references(() => assignments.id),
```

### Relations

Define Drizzle `relations()` only for tables you own:

```typescript
export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  result: one(results, {
    fields: [quizAttempts.id],
    references: [results.attemptId],  // if you add this FK
  }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [results.attemptId],
    references: [quizAttempts.id],
  }),
}));
```

### Indexes

Add indexes on every FK and column used in WHERE/JOIN/ORDER/GROUP.

---

## 3. Exact Schema Definitions

### 3a. Modify existing: `quiz_attempts`

**Read Agent 3's data contract** from `./agent-todo/agent-3/attempt-contract.json` and add the columns it specifies. Expected additions:

```typescript
export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "graded",
]);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    // KEEP existing columns
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
    quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
    score: integer("score"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
    // NEW columns per Agent 3's contract
    assignmentId: uuid("assignment_id"),              // FK to assignments (Agent 3)
    workspaceId: uuid("workspace_id"),                // FK to workspaces (Agent 1)
    answers: jsonb("answers"),                         // { questionId: selectedOptionIndex }[]
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
```

### 3b. Modify existing: `results`

Add workspace scoping and assignment linking:

```typescript
export const results = pgTable(
  "results",
  {
    // KEEP existing columns
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    quizId: varchar("quiz_id", { length: 36 }),  // remove .references to quizzes (Agent 3 owns it)
    score: integer("score").notNull(),
    optionsReview: text("quiz_review").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    // NEW columns
    workspaceId: uuid("workspace_id"),                // nullable for migration
    assignmentId: uuid("assignment_id"),              // nullable — standalone quizzes have no assignment
    attemptId: varchar("attempt_id", { length: 36 }), // FK to quiz_attempts
    overrideScore: integer("override_score"),          // teacher override
    instructorComments: text("instructor_comments"),
    gradedBy: varchar("graded_by", { length: 36 }),   // userId of grading instructor
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
```

### 3c. New table: `events`

General-purpose analytics event log:

```typescript
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(), // e.g. "assignment_published", "attempt_started", "attempt_submitted", "quiz_generated"
    actorUserId: varchar("actor_user_id", { length: 36 }),
    entityType: varchar("entity_type", { length: 50 }),          // e.g. "assignment", "quiz", "attempt"
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
```

### 3d. New table: `ai_requests`

Track AI API calls for cost analysis:

```typescript
export const aiRequests = pgTable(
  "ai_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    requestType: varchar("request_type", { length: 50 }).notNull(), // "quiz_generation", "chat", "embedding"
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
```

---

## 4. MRCS Architecture (Mandatory)

Every file you create must follow layered architecture. Add comment block at top:

```typescript
/**
 * @layer controller | service | repository
 * @owner agent-4
 * @tables results, quiz_attempts, events, ai_requests
 */
```

### Import rules (ENFORCED — NEVER VIOLATE)

| Layer | Can import from | Cannot import from |
|---|---|---|
| **Controller** | Service only | Repository, Drizzle/db, other controllers |
| **Service** | Repository only + `checkEntitlement` from Agent 1 | Drizzle/db, Express Request/Response types |
| **Repository** | `db` instance + schema only | Services, controllers, Express types |

### File structure to create

```
quiz-backend/src/
├── repositories/
│   ├── analytics.repository.ts     # Complex queries: aggregations, distributions, question stats
│   ├── attempt.repository.ts        # CRUD for quiz_attempts + results (teacher grading)
│   ├── event.repository.ts          # Insert/query events + ai_requests
├── services/
│   ├── analytics.service.ts         # Compute all analytics metrics
│   ├── export.service.ts            # CSV generation + streaming
│   ├── grading.service.ts           # Teacher override, comments
│   ├── pricing.service.ts           # Plan comparison, upgrade trigger logic
├── controllers/
│   ├── analytics.controller.ts      # Express handlers for analytics
│   ├── export.controller.ts         # CSV download handler
│   ├── grading.controller.ts        # Teacher grading handler
│   ├── pricing.controller.ts        # Pricing info + upgrade trigger
├── routes/
│   ├── analytics.routes.ts          # /api/assignments/:id/analytics, /api/courses/:id/analytics
│   ├── export.routes.ts             # /api/assignments/:id/export
│   ├── grading.routes.ts            # /api/attempts/:id/grade
│   ├── pricing.routes.ts            # /api/pricing
```

### Response Shape (ALL Controllers)

```typescript
// Success
res.status(200).json({ success: true, data: { ... } });

// Error
res.status(4xx).json({ success: false, error: "Human-readable message" });
```

---

## 5. Analytics Computations

### Assignment-Level Analytics

`GET /api/assignments/:id/analytics` should return:

```typescript
interface AssignmentAnalytics {
  assignmentId: string;
  totalAssigned: number;        // count of assignment_members
  totalSubmitted: number;       // count of attempts with status=submitted
  completionRate: number;       // (submitted / assigned) * 100
  averageScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;             // % above passing score
  failRate: number;
  averageTimeTaken: number;     // in seconds
  scoreDistribution: {
    range: string;              // "0-20", "21-40", "41-60", "61-80", "81-100"
    count: number;
    percentage: number;
  }[];
  questionAnalysis: {
    questionId: string;
    questionText: string;
    correctRate: number;        // % who got it right
    averageTime: number;        // avg time spent on this question (if tracked)
    difficulty: "easy" | "medium" | "hard"; // computed from correctRate
    distractorAnalysis: {
      optionIndex: number;
      optionText: string;
      selectedCount: number;
      selectedPercentage: number;
      isCorrect: boolean;
    }[];
  }[];
}
```

### Course-Level Analytics

`GET /api/courses/:id/analytics` should return:

```typescript
interface CourseAnalytics {
  courseId: string;
  totalStudents: number;
  totalAssignments: number;
  averageCompletion: number;    // across all assignments
  performanceTrend: {           // scores over time
    assignmentId: string;
    title: string;
    publishedAt: string;
    averageScore: number;
    completionRate: number;
  }[];
  topPerformers: {
    userId: string;
    name: string;
    averageScore: number;
    assignmentsCompleted: number;
  }[];
  bottomPerformers: {
    userId: string;
    name: string;
    averageScore: number;
    assignmentsCompleted: number;
  }[];
  weakAreas: {
    topic: string;              // derived from question.learningObjective
    averageScore: number;
    questionCount: number;
  }[];
}
```

### Repository Query Strategy

Use Drizzle's SQL builder for aggregations:

```typescript
/**
 * @layer repository
 * @owner agent-4
 */
import { sql, eq, and, count, avg, desc } from "drizzle-orm";

// Example: Score distribution
async function getScoreDistribution(assignmentId: string) {
  return db.execute(sql`
    SELECT
      CASE
        WHEN score BETWEEN 0 AND 20 THEN '0-20'
        WHEN score BETWEEN 21 AND 40 THEN '21-40'
        WHEN score BETWEEN 41 AND 60 THEN '41-60'
        WHEN score BETWEEN 61 AND 80 THEN '61-80'
        WHEN score BETWEEN 81 AND 100 THEN '81-100'
      END as range,
      COUNT(*) as count
    FROM quiz_attempts
    WHERE assignment_id = ${assignmentId}
      AND status = 'submitted'
    GROUP BY range
    ORDER BY range
  `);
}
```

---

## 6. Teacher Grading

### Attempt Review & Override

`PATCH /api/attempts/:id/grade` — Instructor can:
- View student's answers vs correct answers per question
- Override the auto-graded score
- Add comments per attempt
- Mark as "graded"

```typescript
// Request body
{
  overrideScore: 85,              // optional — overrides auto-graded score
  instructorComments: "Good effort on section 2, review chapter 5",
}
```

Updates: `results.overrideScore`, `results.instructorComments`, `results.gradedBy`, `results.gradedAt`, `quiz_attempts.status = "graded"`.

---

## 7. CSV Export

### `GET /api/assignments/:id/export`

Returns a streaming CSV download.

**Entitlement check**: `checkEntitlement(workspaceId, "export_downloaded")` — free tier returns 403 with upgrade prompt.

### CSV columns for assignment results:

```csv
Student Name,Email,Score (%),Override Score,Pass/Fail,Time Taken (min),Attempts Used,Status,Submitted At
```

### CSV columns for question analysis:

```csv
Question,Correct Answer,Correct Rate (%),Difficulty,Most Selected Wrong Answer,Wrong Answer Selection Rate (%)
```

### Implementation

```typescript
/**
 * @layer service
 * @owner agent-4
 */
import { stringify } from "csv-stringify";

async function exportAssignmentResults(assignmentId: string, workspaceId: string): Promise<ReadableStream> {
  const entitlement = await checkEntitlement(workspaceId, "export_downloaded");
  if (!entitlement.allowed) throw new EntitlementError(entitlement);

  // Stream rows from database through csv-stringify to response
}
```

---

## 8. Upgrade Triggers & Pricing

### Upgrade Trigger Points

Create a reusable function that checks and returns upgrade prompts:

```typescript
/**
 * @layer service
 * @owner agent-4
 */
interface UpgradePrompt {
  triggered: boolean;
  triggerAction: string;
  currentLimit: number;
  currentUsage: number;
  upgradePlan: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
}

async function checkUpgradeTrigger(
  workspaceId: string,
  action: string,
): Promise<UpgradePrompt | null>;
```

### Trigger table

| Trigger Moment | Action | Message |
|---|---|---|
| Publish 2nd assignment | `assignment_created` | "Upgrade to Educator Pro for unlimited assignments" |
| Invite >25 students | `student_seats` | "Your plan supports 25 students. Upgrade to add more." |
| Export results | `export_downloaded` | "Upgrade to Pro to export your results as CSV" |
| Ingest >50 pages | `material_ingested` | "You've reached the free plan's material limit" |
| Generate >5 quizzes | `ai_generation` | "Upgrade for more AI-generated assessments" |
| View detailed analytics | (frontend check) | Shows blurred/locked advanced metrics |

### Pricing API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/pricing` | Public | Return all plans with features comparison |
| `GET` | `/api/pricing/current` | Required | Return current workspace plan + usage summary |
| `POST` | `/api/pricing/checkout` | Required | Create checkout session (placeholder for Stripe) |

---

## 9. API Endpoints Summary

### Analytics

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/assignments/:id/results` | Required | Instructor+ | All attempts with student details |
| `GET` | `/api/assignments/:id/analytics` | Required | Instructor+ | Aggregated analytics |
| `GET` | `/api/courses/:id/analytics` | Required | Instructor+ | Course-level analytics |

### Export

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/assignments/:id/export` | Required | Instructor+ | CSV download |
| `GET` | `/api/assignments/:id/export/questions` | Required | Instructor+ | Question analysis CSV |

### Grading

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/attempts/:id/review` | Required | Instructor+ or Owner | Full attempt review data |
| `PATCH` | `/api/attempts/:id/grade` | Required | Instructor+ | Override score + comments |

### Pricing

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/pricing` | None | Any | Plans comparison |
| `GET` | `/api/pricing/current` | Required | Admin/Owner | Current plan + usage |
| `POST` | `/api/pricing/checkout` | Required | Admin/Owner | Checkout session |

---

## 10. Frontend

### Tech constraints (MANDATORY)

- **No inline styles**. All styling via Tailwind + CVA (class-variance-authority).
- **Loading states**: Skeleton loaders (not spinners) on every async action.
- **Error boundaries**: On every page component.
- **Optimistic updates**: React Query `useMutation` with `onMutate`.
- **No `any` types**. Fully typed.
- **Transitions**: `transition-all duration-150` on all interactive elements.
- **Focus rings**: `focus-visible:ring-2 focus-visible:ring-offset-2` on all inputs/buttons.
- **Empty states**: Actionable CTAs.
- **Toasts**: All async success/error feedback.

### Pages to Build

#### Assignment Results (`/dashboard/assignments/[id]/results`)

- **Summary row** (4 cards): Total Attempts, Completion Rate, Average Score, Pass Rate
  - CVA variants for positive/negative trends (green/red)
- **Score Distribution Chart**: Bar chart with 5 buckets (use `recharts` or `chart.js`)
  - Gradient bars, animated on load
- **Student Results Table**: Sortable columns
  - Name, Score (with override indicator), Status badge, Time Taken, Submitted At
  - Click row → navigate to attempt review
  - Empty state: "No submissions yet. Share the assignment link with your students."
- **Question Analysis** (expandable accordions):
  - Per question: question text, correct %, difficulty badge, distractor bars
  - Distractor bars: horizontal bar chart showing % who selected each option (highlight correct in green)
- **Export Button**: "Download CSV" with entitlement check → upgrade modal if free tier
- **Analytics Level Gating**: If plan's `analyticsLevel === "basic"`, blur question analysis and distractor sections with overlay "Upgrade to see detailed question analysis"

#### Course Analytics (`/dashboard/courses/[id]/analytics`)

- **Overview Cards**: Total Students, Assignments Published, Avg Completion, Avg Score
- **Performance Trend Line Chart**: Average score per assignment over time
- **Top/Bottom Performers Table**: Top 5, Bottom 5, with name + avg score
- **Weak Areas Section**: Cards showing topics with lowest scores, "Needs attention" badges
- Empty state: "Publish your first assignment to see analytics here."

#### Attempt Review (`/dashboard/attempts/[id]`)

- **Student Info**: Name, attempt number, timestamp, time taken
- **Score Section**: Auto-graded score, override score (if set), pass/fail badge
- **Question-by-Question Review**:
  - Question text
  - Options list: student's selection marked (green circle if correct, red if wrong)
  - Correct answer highlighted
  - Explanation text
  - Citation badge (if source document exists): "Source: [Document Title], Page [N]"
- **Teacher Actions** (if instructor role):
  - Override score input
  - Comments textarea
  - "Save Grade" button with loading state

#### Pricing Page (`/pricing`)

This is a **public page** (no auth required).

- **Three columns**: Free, Educator Pro, Corporate
- **Feature comparison table**: checkmarks and values for each feature
- **Toggle**: Monthly / Annual (annual shows 20% discount)
- **CTAs**: "Get Started Free" / "Start Pro Trial" / "Contact Sales"
- **Current plan badge**: If user is logged in, highlight their current plan
- **FAQ Accordion**: 5-6 educator-specific questions
  - "Can I try Educator Pro for free?"
  - "How do student seats work?"
  - "Can I switch plans later?"
  - "What payment methods do you accept?"
  - "Is there a discount for schools?"
  - "What happens when I hit my plan limit?"

#### Upgrade Modal Component (`UpgradeModal.tsx`)

Reusable modal triggered at upgrade moments:

- **Header**: "You've reached your plan limit" or contextual message
- **Body**: Current plan, what they're hitting (e.g., "1 of 1 assignments used"), what they'd unlock
- **Feature highlight**: 3 key features of the next tier
- **CTAs**: "Upgrade Now" → pricing page, "Maybe Later" → dismiss
- **Animation**: Slide in from bottom, 150ms transition

### Existing Page Modifications

#### Dashboard Home (`/dashboard/page.tsx`)

Add analytics summary widgets for instructors:
- "Recent Activity" feed (from `events` table)
- Quick stats: Quizzes Created, Assignments Active, Avg Student Score
- Upgrade CTA banner if approaching plan limits

---

## 11. Acceptance Criteria

Complete this checklist before writing `agent-job.md`:

- [ ] **Schema migrated and relations verified** — `events`, `ai_requests` created; `quiz_attempts`, `results` modified per Agent 3's contract; all relations defined; all indexes created
- [ ] **Repository functions tested** — at least one raw query log per function (score distribution, completion rate, question analysis aggregation)
- [ ] **Service functions have input validation** — override score range (0-100), comments length, valid assignmentId/attemptId
- [ ] **Controller returns consistent `{ success, data, error }` shape** — every endpoint
- [ ] **Assignment analytics correct** — completion rate, score distribution, question analysis, distractor analysis all return expected data
- [ ] **Course analytics correct** — performance trends, top/bottom performers, weak areas
- [ ] **Teacher grading works** — override score saves, comments save, status updates to "graded"
- [ ] **CSV export streams correctly** — download works, correct columns, entitlement checked
- [ ] **Upgrade triggers fire** — at each of the 5 defined moments
- [ ] **Pricing page renders** — 3 plans, toggle, CTAs, FAQ, current plan badge
- [ ] **Upgrade modal renders** — triggered correctly, contextual messaging, dismissable
- [ ] **Analytics pages render** — charts load, tables sort, cards display
- [ ] **Attempt review renders** — question-by-question, citations, grading form
- [ ] **Frontend: No console errors, skeletons on load, error boundaries, toasts**
- [ ] **Analytics gating works** — basic plan sees blurred advanced sections
- [ ] **`locks.json` released**
- [ ] **`data.json` set to `status: "done"` and `percentComplete: 100`**
- [ ] **`agent-job.md` written**

---

## 12. `agent-job.md` Template

When done, write `./agent-todo/agent-4/agent-job.md`:

```markdown
# Agent 4 — Completion Report

## Status: DONE
## Completed At: [ISO timestamp]

## What Was Built
- [list of tables, services, controllers, pages]

## Schema Changes
- quiz_attempts: added assignmentId, workspaceId, answers, status, startedAt, submittedAt, timeTakenSeconds
- results: added workspaceId, assignmentId, attemptId, overrideScore, instructorComments, gradedBy, gradedAt
- events: new table for analytics event log
- ai_requests: new table for AI usage tracking

## Analytics Capabilities
- Assignment-level: completion, scores, question analysis, distractor analysis
- Course-level: trends, performers, weak areas
- Teacher grading with override
- CSV export with entitlement gating

## Monetization
- 3 pricing tiers seeded
- Upgrade triggers at 5 key moments
- Pricing page, upgrade modal

## New Routes Registered
- /api/assignments/:id/analytics → analytics.routes.ts
- /api/assignments/:id/results → analytics.routes.ts
- /api/assignments/:id/export → export.routes.ts
- /api/courses/:id/analytics → analytics.routes.ts
- /api/attempts/:id/review → grading.routes.ts
- /api/attempts/:id/grade → grading.routes.ts
- /api/pricing → pricing.routes.ts

## Integration Notes
- All analytics queries read from quiz_attempts, results, assignments, assignment_members, questions
- Events table can be used for activity feeds and audit logs
- ai_requests table can be used for cost tracking dashboards
```
