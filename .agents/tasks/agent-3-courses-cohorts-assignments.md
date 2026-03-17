# Agent 3 — Assignments & Student Flow

> **You are Agent 3.** Read this entire file before writing any code. This is your complete instruction set. You do NOT need any other spec file to do your work.

---

## 1. Coordination Protocol

### Your Workspace

Your working directory is `./agent-todo/agent-3/`. Create it at startup. Maintain these files:

| File | Purpose |
|---|---|
| `data.json` | Your live status. Update every meaningful step. |
| `agent-job.md` | Written **only** on completion. Summary of what you built, what changed, what downstream agents need. |
| `locks.json` | Files you currently own. No other agent may touch these. |

### `data.json` schema

```json
{
  "agentId": 3,
  "status": "in_progress | blocked | done | error",
  "currentTask": "human-readable description of what you are doing right now",
  "filesOpen": ["list of files you are actively editing"],
  "percentComplete": 0,
  "lastUpdated": "ISO-8601 timestamp",
  "blockedOn": "agent-1 if waiting",
  "errors": []
}
```

Update `percentComplete` as you go: 0 → start, 10 → schema done, 30 → repositories done, 50 → services done, 70 → controllers done, 85 → frontend done, 95 → testing, 100 → agent-job.md written.

### `locks.json` schema

```json
{
  "lockedFiles": [
    "quiz-backend/src/repositories/assignment.repository.ts",
    "quiz-backend/src/repositories/quiz.repository.ts",
    "quiz-backend/src/services/assignment.service.ts",
    "quiz-backend/src/services/attempt.service.ts",
    "quiz-backend/src/controllers/assignment.controller.ts",
    "quiz-backend/src/controllers/attempt.controller.ts",
    "quiz-backend/src/routes/assignment.routes.ts",
    "quiz-backend/src/routes/attempt.routes.ts",
    "quiz-app/app/dashboard/courses/[id]/assignments/page.tsx",
    "quiz-app/app/dashboard/assessment/[id]/page.tsx",
    "quiz-app/app/join/[code]/page.tsx",
    "quiz-app/components/dashboard/AssignmentCard.tsx",
    "quiz-app/components/dashboard/TakeAssessment.tsx"
  ],
  "lockedAt": "ISO-8601 timestamp",
  "agentId": 3
}
```

Write `locks.json` **before** you create or edit any file. If a file is listed in another agent's `locks.json`, **stop and report a conflict**.

### Dependency Position

```
Agent 1 (foundation) → YOU (Agent 3) runs in parallel with Agent 2 → Agent 4 depends on you
```

**BLOCKING RULE**: Do NOT start until `./agent-todo/agent-1/agent-job.md` exists. While waiting, set `data.json.status` to `"blocked"` and `blockedOn` to `"agent-1"`.

Once Agent 1 is done, read its `agent-job.md` to learn:
- The `workspaces` and `workspace_members` table shapes
- The `checkEntitlement()` service API
- The `resolveWorkspace` and `requireRole` middleware exports
- Any breaking changes

**You do NOT need to wait for Agent 2.** You reference Agent 2's tables (`courses`, `student_groups`, `documents`) as plain varchar/uuid FKs without importing them. However, if Agent 2 has finished, read its `agent-job.md` for context on course/document shapes.

---

## 2. Schema Ownership (EXCLUSIVE)

**You own these tables. No other agent may create, alter, or add relations to them.**

| Table | Status |
|---|---|
| `quizzes` | Existing — modify in-place |
| `questions` | Existing — modify in-place |
| `assignments` | **New** — create |
| `assignment_members` | **New** — create |

**You do NOT own**: `users`, `workspaces`, `workspace_members`, `plans`, `billings`, `usage`, `usage_ledger`, `courses`, `student_groups`, `documents`, `document_chunks`, `results`, `quizAttempts`, or any tables owned by Agents 1/2/4.

When referencing tables you don't own, use plain `varchar`/`uuid` columns:

```typescript
// YES — plain FK
courseId: uuid("course_id").notNull(),           // courses owned by Agent 2
studentGroupId: uuid("student_group_id"),        // student_groups owned by Agent 2

// NO — cross-ownership import
courseId: uuid("course_id").references(() => courses.id),
```

### Relations

Define Drizzle `relations()` only for tables you own:

```typescript
export const assignmentsRelations = relations(assignments, ({ many }) => ({
  members: many(assignmentMembers),
}));

export const assignmentMembersRelations = relations(assignmentMembers, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentMembers.assignmentId],
    references: [assignments.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  assignments: many(assignments),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));
```

### Indexes

Add indexes on every foreign key and column used in WHERE/JOIN/ORDER.

---

## 3. Exact Schema Definitions

### 3a. Modify existing: `quizzes`

Add workspace and course scoping:

```typescript
export const quizzes = pgTable(
  "quizzes",
  {
    // KEEP existing columns
    id: varchar("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 200 }).notNull().unique(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    description: text("description").notNull().default(""),
    submitted: boolean("submitted").notNull().default(false),
    // NEW columns
    workspaceId: uuid("workspace_id"),    // nullable for migration
    courseId: uuid("course_id"),            // nullable — can be standalone
  },
  (t) => ({
    userIdx: index("idx_quizzes_user").on(t.userId),
    workspaceIdx: index("idx_quizzes_workspace").on(t.workspaceId),
    courseIdx: index("idx_quizzes_course").on(t.courseId),
  })
);
```

### 3b. Modify existing: `questions`

Add citation metadata:

```typescript
export const questions = pgTable(
  "questions",
  {
    // KEEP existing columns
    id: varchar("id", { length: 36 }).primaryKey(),
    quizId: varchar("quiz_id", { length: 36 }).references(() => quizzes.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    options: text("options").notNull(),
    answer: integer("answer").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    explanation: text("explanation").notNull(),
    // NEW columns — citation metadata
    sourceDocumentId: varchar("source_document_id", { length: 36 }),
    sourcePage: integer("source_page"),
    sourceExcerpt: text("source_excerpt"),
    difficulty: varchar("difficulty", { length: 20 }), // easy, medium, hard
    learningObjective: text("learning_objective"),
  },
  (t) => ({
    quizIdx: index("idx_questions_quiz").on(t.quizId),
    docIdx: index("idx_questions_source_doc").on(t.sourceDocumentId),
    difficultyIdx: index("idx_questions_difficulty").on(t.difficulty),
  })
);
```

### 3c. New table: `assignments`

```typescript
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "draft",
  "published",
  "closed",
]);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").notNull(),           // FK to courses (Agent 2)
    quizId: varchar("quiz_id", { length: 36 }).notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    studentGroupId: uuid("student_group_id"),        // nullable = all groups; FK to student_groups (Agent 2)
    workspaceId: uuid("workspace_id").notNull(),     // FK to workspaces (Agent 1)
    title: varchar("title", { length: 300 }).notNull(),
    status: assignmentStatusEnum("status").notNull().default("draft"),
    // Settings
    attemptsAllowed: integer("attempts_allowed").default(1).notNull(),
    timeLimitMinutes: integer("time_limit_minutes"),  // null = no limit
    shuffleQuestions: boolean("shuffle_questions").default(true).notNull(),
    shuffleOptions: boolean("shuffle_options").default(true).notNull(),
    showResultsImmediately: boolean("show_results_immediately").default(false).notNull(),
    passingScore: integer("passing_score").default(60).notNull(), // percentage
    dueAt: timestamp("due_at"),
    publishedAt: timestamp("published_at"),
    closedAt: timestamp("closed_at"),
    createdBy: varchar("created_by", { length: 36 }).notNull(), // userId
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => ({
    courseIdx: index("idx_assign_course").on(t.courseId),
    quizIdx: index("idx_assign_quiz").on(t.quizId),
    groupIdx: index("idx_assign_group").on(t.studentGroupId),
    workspaceIdx: index("idx_assign_workspace").on(t.workspaceId),
    statusIdx: index("idx_assign_status").on(t.status),
    dueIdx: index("idx_assign_due").on(t.dueAt),
  })
);
```

### 3d. New table: `assignment_members`

Tracks which students are assigned and their join/access status:

```typescript
export const assignmentMembers = pgTable(
  "assignment_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).notNull(), // FK to users (Agent 1)
    workspaceMemberId: uuid("workspace_member_id"),        // FK to workspace_members (Agent 1)
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => ({
    assignIdx: index("idx_am_assignment").on(t.assignmentId),
    userIdx: index("idx_am_user").on(t.userId),
    uniqueMember: index("idx_am_unique").on(t.assignmentId, t.userId),
  })
);
```

---

## 4. MRCS Architecture (Mandatory)

Every file you create must follow this layered architecture. Add a comment block at the top:

```typescript
/**
 * @layer controller | service | repository
 * @owner agent-3
 * @tables quizzes, questions, assignments, assignment_members
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
│   ├── assignment.repository.ts    # CRUD for assignments + assignment_members
│   ├── quiz.repository.ts          # Extended CRUD for quizzes + questions (workspace-scoped)
├── services/
│   ├── assignment.service.ts       # Assignment lifecycle: create → publish → close
│   ├── attempt.service.ts          # Attempt eligibility, start, save, submit, auto-grade
├── controllers/
│   ├── assignment.controller.ts    # Express handlers for assignments
│   ├── attempt.controller.ts       # Express handlers for attempts
├── routes/
│   ├── assignment.routes.ts        # /api/courses/:courseId/assignments/*
│   ├── attempt.routes.ts           # /api/assignments/:id/attempts/*
```

### Response Shape (ALL Controllers)

```typescript
// Success
res.status(200).json({ success: true, data: { ... } });

// Error
res.status(4xx).json({ success: false, error: "Human-readable message" });
```

---

## 5. Assignment Lifecycle

### State machine

```
DRAFT → PUBLISHED → CLOSED
```

- **Draft**: Assignment created, settings configured, not visible to students.
- **Published**: `publishedAt` set, students can access via link. `checkEntitlement("assignment_created")` called on publish.
- **Closed**: `closedAt` set (manually or when `dueAt` passes), no new attempts allowed.

### Publish logic

```typescript
async function publishAssignment(assignmentId: string, workspaceId: string) {
  // 1. Check entitlement
  const entitlement = await checkEntitlement(workspaceId, "assignment_created");
  if (!entitlement.allowed) throw new EntitlementError(entitlement);

  // 2. Update status to published, set publishedAt
  // 3. If studentGroupId set, populate assignment_members from student_groups membership
  //    (query workspace_members with role=learner in that group)
  //    If null, all learners in workspace get access
  // 4. Log usage ledger event
}
```

---

## 6. Attempt Flow

### Eligibility checks (all must pass)

Before starting an attempt:

1. Assignment `status === "published"`
2. Current time is before `dueAt` (if set)
3. User is an `assignment_member` (or all learners if no group scoping)
4. User's attempt count < `attemptsAllowed`
5. `checkEntitlement(workspaceId, "attempt_submitted")` returns `allowed: true`

### Attempt lifecycle

```
START → IN_PROGRESS → SUBMITTED → (optionally GRADED by teacher)
```

**Start**: Create row in `quiz_attempts` (Agent 4 owns this table, so you write to it via Agent 4's repository pattern — but since Agent 4 hasn't run yet, you define the data contract here and Agent 4 creates the table).

> **IMPORTANT**: Agent 4 owns the `quiz_attempts` and `results` tables. You must define the **data contract** (what fields you'll write) but Agent 4 creates the actual schema. In your service, write to these tables using raw SQL or a shared utility that Agent 4 will verify.

**Data contract for `quiz_attempts` (Agent 4 creates the table):**

```typescript
// Fields Agent 3 needs to write:
{
  id: string,
  assignmentId: string,         // NEW field (Agent 4 adds this)
  userId: string,
  quizId: string,
  score: number | null,
  startedAt: Date,
  submittedAt: Date | null,
  completedAt: Date | null,
  answers: JSON,                // NEW field: { questionId: selectedOptionIndex }[]
  status: "in_progress" | "submitted" | "graded",  // NEW field
  timeTakenSeconds: number | null, // NEW field
}
```

Write this contract to `./agent-todo/agent-3/attempt-contract.json` so Agent 4 can read it.

### Auto-grading

On submit:
1. Compare `answers` to `questions.answer` for each question
2. Calculate score as percentage: `(correct / total) * 100`
3. Determine pass/fail based on `assignments.passingScore`
4. Update `quiz_attempts.score`, `submittedAt`, `status = "submitted"`
5. Log usage: `checkEntitlement(workspaceId, "attempt_submitted")`

### Timer logic

If `timeLimitMinutes` is set:
- Frontend starts a countdown timer on attempt start
- Frontend auto-submits when timer reaches 0
- Backend validates: `submittedAt - startedAt <= timeLimitMinutes * 60 + 30s grace`
- If exceeded, backend still accepts but flags in metadata

---

## 7. Student Onboarding (Invite/Join)

### Invite code flow

Agent 2 creates `student_groups` with `inviteCode`. You build the join flow:

1. Instructor generates invite link: `{FRONTEND_URL}/join/{inviteCode}`
2. Student visits link → if not logged in, redirect to Clerk sign-in with `?redirect_uri=/join/{code}`
3. After auth, backend:
   a. Find `student_groups` by `inviteCode`
   b. Find the `course` for that group
   c. Find the `workspace` for that course
   d. Add user to `workspace_members` as `learner` (if not already)
   e. Add user to `student_groups` membership (you'll need a join table or use `assignment_members`)
   f. Redirect to student dashboard

### API Endpoints for Join

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/join/:inviteCode` | Required | Validate code, return group/course info |
| `POST` | `/api/join/:inviteCode` | Required | Execute join: add to workspace + group |

---

## 8. API Endpoints

### Assignments

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/courses/:courseId/assignments` | Required | Instructor+ | Create assignment (link to quiz) |
| `GET` | `/api/courses/:courseId/assignments` | Required | Member | List assignments in course |
| `GET` | `/api/assignments/:id` | Required | Member | Assignment detail + settings |
| `PATCH` | `/api/assignments/:id` | Required | Instructor+ | Update settings (only in draft) |
| `POST` | `/api/assignments/:id/publish` | Required | Instructor+ | Publish assignment |
| `POST` | `/api/assignments/:id/close` | Required | Instructor+ | Close assignment |
| `DELETE` | `/api/assignments/:id` | Required | Instructor+ | Delete assignment (only if draft) |

### Attempts (Student-facing)

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/assignments/:id/attempts` | Required | Learner | Start attempt (returns questions) |
| `GET` | `/api/attempts/:id` | Required | Owner | Get attempt (current answers, time remaining) |
| `PATCH` | `/api/attempts/:id` | Required | Owner | Save progress (partial answers) |
| `POST` | `/api/attempts/:id/submit` | Required | Owner | Submit attempt (triggers auto-grade) |

### Student Dashboard

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/my/assignments` | Required | Learner | List assignments assigned to user across workspaces |
| `GET` | `/api/my/attempts` | Required | Learner | List all attempts by user |

---

## 9. Frontend

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

### Instructor Pages

#### Assignment Management (`/dashboard/courses/[id]/assignments`)

This is a **tab** within the course detail page (Agent 2 builds the page shell, you add this tab):

- List of assignments: title, quiz name, status badge (Draft/Published/Closed), due date, attempt count
- "Create Assignment" button → modal/drawer:
  - Select quiz (from workspace quizzes)
  - Configure: attempts allowed, time limit, shuffle, passing score, due date
  - Assign to: specific student group or "All students"
- Assignment row expands to show: student completion progress bar, quick stats
- Actions: Publish (with confirmation), Close, Edit (if draft), Delete (if draft)

#### Assignment Detail (`/dashboard/assignments/[id]`)

- Header: title, status, quiz link, due date, created by
- Settings summary: attempts, time limit, passing score, shuffle
- Student progress table:
  - Name, status (Not started / In progress / Submitted), score, time taken, submitted at
  - Click → links to attempt review (Agent 4 builds the review page)
- Publish/Close buttons (based on current status)

### Student Pages

#### Student Dashboard (`/dashboard` for learner role)

**This modifies the existing dashboard page** (`quiz-app/app/dashboard/page.tsx`). When user's workspace role is `learner`, show:

- "My Assignments" section:
  - Cards with: assignment title, course name, status (Not started / In progress / Submitted / Graded), due date countdown, score (if submitted)
  - Sort by: due date, status
  - Filter: active / completed / overdue

#### Take Assessment (`/dashboard/assessment/[assignmentId]`)

- **Pre-start screen**: Assignment title, instructions, time limit warning, attempt number ("Attempt 2 of 3")
- **Start button**: calls `POST /api/assignments/:id/attempts`
- **Assessment view**: Reuse and adapt existing quiz-taking components from `quiz-app/app/dashboard/quizzes/`
  - Question navigator sidebar
  - Timer countdown (if time limit set, prominent top-right)
  - Auto-save progress every 30 seconds (`PATCH /api/attempts/:id`)
  - "Submit" button with confirmation dialog
  - Auto-submit when timer expires
- **Results view** (if `showResultsImmediately` is true):
  - Score, pass/fail badge
  - Question-by-question review with correct/incorrect indicators

#### Join Page (`/join/[code]`)

- Public page (requires auth, redirects to sign-in if needed)
- Shows: course name, student group name, instructor name
- "Join" button
- Success: redirect to student dashboard with toast "You've joined [course name]"
- Error states: invalid code, already a member, code expired

---

## 10. Acceptance Criteria

Complete this checklist before writing `agent-job.md`:

- [ ] **Schema migrated and relations verified** — `assignments`, `assignment_members` created; `quizzes`, `questions` modified; all relations defined; all indexes created
- [ ] **Repository functions tested** — at least one raw query log per function (assignment CRUD, member management, quiz query with workspace scope)
- [ ] **Service functions have input validation** — assignment settings validation (attemptsAllowed >= 1, passingScore 0-100, timeLimitMinutes > 0), eligibility checks on attempt start
- [ ] **Controller returns consistent `{ success, data, error }` shape** — every endpoint, every code path
- [ ] **Assignment lifecycle works** — Draft → Published → Closed with correct state transitions
- [ ] **Attempt eligibility enforced** — max attempts, due date, membership, entitlement
- [ ] **Auto-grading works** — correct score calculation on submit
- [ ] **Timer logic works** — countdown, auto-submit, backend grace period validation
- [ ] **Join flow works** — invite code → sign up → join group → student dashboard
- [ ] **Frontend: Assignment list/detail pages render** — create, configure, publish, close
- [ ] **Frontend: Student dashboard renders** — assignment cards, status, due dates
- [ ] **Frontend: Take Assessment renders** — pre-start, questions, timer, submit, results
- [ ] **Frontend: Join page renders** — code validation, join button, success/error states
- [ ] **Frontend: No console errors, loading states visible, toasts on actions**
- [ ] **Attempt data contract written** to `./agent-todo/agent-3/attempt-contract.json`
- [ ] **`locks.json` released**
- [ ] **`data.json` set to `status: "done"` and `percentComplete: 100`**
- [ ] **`agent-job.md` written**

---

## 11. `agent-job.md` Template

When done, write `./agent-todo/agent-3/agent-job.md`:

```markdown
# Agent 3 — Completion Report

## Status: DONE
## Completed At: [ISO timestamp]

## What Was Built
- [list of tables, services, controllers, pages]

## Schema Changes
- [exact table names and columns added/modified]
- quizzes: added workspaceId, courseId columns
- questions: added sourceDocumentId, sourcePage, sourceExcerpt, difficulty, learningObjective

## Attempt Data Contract
- See `./agent-todo/agent-3/attempt-contract.json`
- Agent 4 must create `quiz_attempts` with the fields listed there
- Agent 4 must add `assignmentId`, `answers`, `status`, `timeTakenSeconds`, `startedAt` columns

## New Routes Registered
- /api/courses/:courseId/assignments/* → assignment.routes.ts
- /api/assignments/:id/* → assignment.routes.ts
- /api/assignments/:id/attempts/* → attempt.routes.ts
- /api/my/assignments → attempt.routes.ts
- /api/my/attempts → attempt.routes.ts
- /api/join/:inviteCode → assignment.routes.ts

## What Agent 4 Needs to Know
- `assignments` table shape and how to query it for analytics
- `assignment_members` table shape for completion rate calculation
- Attempt data writes to `quiz_attempts` — Agent 4 adds the table columns
- Auto-grading already calculates score; Agent 4 builds analytics on top
```
