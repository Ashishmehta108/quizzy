# Agent 1 — Domain & Tenancy Foundation

> **You are Agent 1.** Read this entire file before writing any code. This is your complete instruction set. You do NOT need any other spec file to do your work.

---

## 1. Coordination Protocol

### Your Workspace

Your working directory is `./agent-todo/agent-1/`. Create it at startup. Maintain these files:

| File | Purpose |
|---|---|
| `data.json` | Your live status. Update every meaningful step. |
| `agent-job.md` | Written **only** on completion. Summary of what you built, what changed, what downstream agents need. |
| `locks.json` | Files you currently own. No other agent may touch these. |

### `data.json` schema

```json
{
  "agentId": 1,
  "status": "in_progress | done | error",
  "currentTask": "human-readable description of what you are doing right now",
  "filesOpen": ["list of files you are actively editing"],
  "percentComplete": 0,
  "lastUpdated": "ISO-8601 timestamp",
  "errors": []
}
```

Update `percentComplete` as you go: 0 → start, 10 → schema done, 30 → repositories done, 50 → services done, 70 → controllers done, 85 → frontend done, 95 → testing, 100 → agent-job.md written.

### `locks.json` schema

```json
{
  "lockedFiles": [
    "quiz-backend/src/config/db/schema.ts",
    "quiz-backend/src/repositories/workspace.repository.ts",
    "quiz-backend/src/services/workspace.service.ts",
    "quiz-backend/src/services/entitlements.service.ts",
    "quiz-backend/src/controllers/workspace.controller.ts",
    "quiz-backend/src/routes/workspace.routes.ts",
    "quiz-backend/src/middlewares/workspace.middleware.ts",
    "quiz-backend/src/middlewares/role.middleware.ts",
    "quiz-app/components/dashboard/WorkspaceSwitcher.tsx",
    "quiz-app/app/dashboard/layout.tsx"
  ],
  "lockedAt": "ISO-8601 timestamp",
  "agentId": 1
}
```

Write `locks.json` **before** you create or edit any file. If a file on this list exists in another agent's `locks.json`, **stop and report a conflict** in `data.json.errors`.

### Dependency Position

You are the **first agent**. No dependencies. Agents 2, 3, and 4 depend on your `agent-job.md` existing before they can start. Complete fully and write `agent-job.md` before considering yourself done.

---

## 2. Schema Ownership (EXCLUSIVE)

**You own these tables. No other agent may create, alter, or add relations to them.**

| Table | Status |
|---|---|
| `users` | Existing — modify in-place |
| `workspaces` | **New** — create |
| `workspace_members` | **New** — create |
| `plans` | Existing — modify in-place |
| `billings` | Existing — modify in-place |
| `usage` | Existing — modify in-place |
| `usage_ledger` | **New** — create |

**You do NOT own**: `quizzes`, `questions`, `documents`, `results`, `quizAttempts`, `chatSessions`, `chatMessages`, `NotionIntegration`, or any tables created by Agents 2/3/4.

When you need to reference a table owned by another agent, use a plain `varchar`/`uuid` column — **do not import the table object** from schema. Example: `workspaceId: varchar("workspace_id", { length: 36 })` — no `.references()` call to a table you don't own.

### Relations

Define Drizzle `relations()` for every table you own. Example:

```typescript
import { relations } from "drizzle-orm";

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  billings: many(billings),
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
```

### Indexes

Add indexes on every foreign key and every column used in WHERE/JOIN:

```typescript
(t) => ({
  workspaceIdx: index("idx_wm_workspace").on(t.workspaceId),
  userIdx: index("idx_wm_user").on(t.userId),
  roleIdx: index("idx_wm_role").on(t.role),
})
```

---

## 3. Exact Schema Definitions

### 3a. New table: `workspaces`

```typescript
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
```

### 3b. New table: `workspace_members`

```typescript
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
```

### 3c. Modify existing: `plans`

Replace the `monthlyLimit` JSON blob with structured entitlement columns:

```typescript
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
```

### 3d. Modify existing: `billings`

Add workspace scoping and provider fields:

```typescript
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
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => ({
    workspaceIdx: index("idx_billings_workspace").on(t.workspaceId),
    userIdx: index("idx_billings_user").on(t.userId),
    statusIdx: index("idx_billings_status").on(t.status),
  })
);
```

### 3e. New table: `usage_ledger`

```typescript
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
```

### 3f. Modify existing: `usage`

Add `workspaceId`:

```typescript
// Add to existing usage table:
workspaceId: uuid("workspace_id"), // nullable for migration
```

---

## 4. MRCS Architecture (Mandatory)

Every file you create must follow this layered architecture. Add a comment block at the top of every file:

```typescript
/**
 * @layer controller | service | repository
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
```

### Import rules (ENFORCED — NEVER VIOLATE)

| Layer | Can import from | Cannot import from |
|---|---|---|
| **Controller** | Service only | Repository, Drizzle/db, other controllers |
| **Service** | Repository only | Drizzle/db, Express Request/Response types |
| **Repository** | `db` instance + schema only | Services, controllers, Express types |

### File structure to create

```
quiz-backend/src/
├── repositories/
│   ├── workspace.repository.ts     # CRUD for workspaces + workspace_members
│   ├── billing.repository.ts       # CRUD for billings + plans + usage + usage_ledger
├── services/
│   ├── workspace.service.ts        # Business logic for workspace management
│   ├── entitlements.service.ts     # checkEntitlement(workspaceId, action, qty?)
│   ├── billing.service.ts          # Plan management, billing lifecycle
├── controllers/
│   ├── workspace.controller.ts     # Express handlers (overwrite existing if needed)
├── routes/
│   ├── workspace.routes.ts         # Mount under /api/workspaces
├── middlewares/
│   ├── workspace.middleware.ts     # resolveWorkspace: attach workspace + role to req
│   ├── role.middleware.ts          # requireRole('instructor', 'admin', ...)
```

### Response Shape (ALL Controllers)

Every controller response must use this shape:

```typescript
// Success
res.status(200).json({ success: true, data: { ... } });

// Error
res.status(4xx).json({ success: false, error: "Human-readable message" });
```

Never return raw data or inconsistent shapes.

---

## 5. API Endpoints

### Workspace CRUD

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/workspaces` | Required | Any | Create workspace (creator becomes owner) |
| `GET` | `/api/workspaces` | Required | Any | List user's workspaces |
| `GET` | `/api/workspaces/:id` | Required | Member | Get workspace detail |
| `PATCH` | `/api/workspaces/:id` | Required | Owner/Admin | Update workspace name/logo |
| `DELETE` | `/api/workspaces/:id` | Required | Owner | Delete workspace |

### Member Management

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/workspaces/:id/members` | Required | Member | List members |
| `POST` | `/api/workspaces/:id/members` | Required | Owner/Admin/Instructor | Add member by email |
| `PATCH` | `/api/workspaces/:id/members/:memberId` | Required | Owner/Admin | Update role |
| `DELETE` | `/api/workspaces/:id/members/:memberId` | Required | Owner/Admin | Remove member |

### Entitlements

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `GET` | `/api/workspaces/:id/entitlements` | Required | Member | Current plan limits + usage |
| `GET` | `/api/workspaces/:id/usage` | Required | Admin/Owner | Usage ledger summary |

### Entitlements Service Contract

Other agents will call this service. Export this function:

```typescript
// quiz-backend/src/services/entitlements.service.ts
export async function checkEntitlement(
  workspaceId: string,
  action: "assignment_created" | "attempt_submitted" | "ai_generation" | "material_ingested" | "export_downloaded" | "websearch_used",
  quantity?: number
): Promise<{
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
}>;
```

Other agents import **only this function** — they never import your repositories or schema tables.

---

## 6. Auth Hardening

### Audit and fix existing endpoints

The current codebase has endpoints that accept `userId` from query params or request body. **Fix every one**:

| File | Issue | Fix |
|---|---|---|
| `quiz-backend/src/routes/chat.routes.ts` | `userId` from body/query | Derive from Clerk `req.auth.userId` |
| `quiz-backend/src/controllers/quiz.controller.ts` | `userId` from body | Derive from Clerk |
| `quiz-backend/src/controllers/result.controller.ts` | `userId` from body/query | Derive from Clerk |
| `quiz-backend/src/routes/utility.routes.ts` | `userId` from query | Derive from Clerk |

### Workspace Resolution Middleware

```typescript
// quiz-backend/src/middlewares/workspace.middleware.ts
// Reads workspaceId from header 'x-workspace-id' or query param
// Looks up workspace_members for (userId, workspaceId)
// Attaches to req: req.workspace = { id, name, role }
// Returns 403 if user is not a member
```

### Role Guard Middleware

```typescript
// quiz-backend/src/middlewares/role.middleware.ts
export function requireRole(...roles: string[]) {
  return (req, res, next) => {
    if (!roles.includes(req.workspace.role)) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" });
    }
    next();
  };
}
```

---

## 7. Frontend

### Tech constraints

- **No inline styles**. All styling via Tailwind + CVA (class-variance-authority).
- **Loading states**: Skeleton loaders (not spinners) on every async action.
- **Error boundaries**: On every page component.
- **Optimistic updates**: Use React Query `useMutation` with `onMutate` for create/update.
- **No `any` types**. Fully typed props, API responses, state.
- **Transitions**: 150ms `transition-all` on all interactive elements.
- **Focus rings**: `focus-visible:ring-2 focus-visible:ring-offset-2` on all inputs/buttons.
- **Empty states**: Actionable CTAs, not "no data found".
- **Toasts**: `sonner` or `react-hot-toast` for all async success/error feedback.

### Components to Build

#### `WorkspaceSwitcher.tsx`

- Dropdown in the dashboard nav showing current workspace
- Lists all user's workspaces
- "Create new workspace" option at bottom
- Shows role badge next to each workspace name

#### `CreateWorkspaceModal.tsx`

- Modal form: workspace name, optional logo URL
- Validates name length (3-200 chars)
- On success: switches to new workspace, shows toast
- Loading/error states

#### `WorkspaceMembersPage.tsx` (route: `/dashboard/settings/members`)

- Table of members: name, email, role, joined date
- Add member form (email + role dropdown)
- Edit role inline
- Remove member with confirmation dialog
- Empty state: "Invite your first team member"

#### `WorkspaceSettingsPage.tsx` (route: `/dashboard/settings/workspace`)

- Edit workspace name, logo
- View current plan + usage summary
- "Upgrade Plan" CTA if on free tier

#### Dashboard Layout Changes (`quiz-app/app/dashboard/layout.tsx`)

- Add `WorkspaceSwitcher` to the sidebar/nav
- Wrap all dashboard routes in workspace context provider
- Show different nav items based on role:
  - **Instructor/Admin/Owner**: Library, Courses, Analytics, Settings
  - **Learner**: My Assessments, Results

---

## 8. Seed Data Update

Update `quiz-backend/src/plan.ts` (or create `quiz-backend/src/seed.ts`) to seed the new plan structure:

```typescript
const planSeeds = [
  {
    name: "Free",
    description: "Get started with basic assessment creation",
    price: "0",
    maxCourses: 1, maxCohorts: 1, maxMaterialPages: 50,
    maxAssignmentsPerMonth: 1, maxAttemptsPerMonth: 30,
    maxInstructorSeats: 1, maxStudentSeats: 25,
    maxAiGenerations: 5, maxWebsearches: 10,
    exportTypes: ["none"], analyticsLevel: "basic",
  },
  {
    name: "Educator Pro",
    description: "For educators who run real classes",
    price: "999",
    maxCourses: -1, maxCohorts: -1, maxMaterialPages: 2000,
    maxAssignmentsPerMonth: -1, maxAttemptsPerMonth: 1000,
    maxInstructorSeats: 5, maxStudentSeats: 200,
    maxAiGenerations: 50, maxWebsearches: 100,
    exportTypes: ["csv"], analyticsLevel: "full",
  },
  {
    name: "Corporate",
    description: "For teams and organizations",
    price: "4999",
    maxCourses: -1, maxCohorts: -1, maxMaterialPages: -1,
    maxAssignmentsPerMonth: -1, maxAttemptsPerMonth: -1,
    maxInstructorSeats: -1, maxStudentSeats: -1,
    maxAiGenerations: -1, maxWebsearches: -1,
    exportTypes: ["csv", "pdf"], analyticsLevel: "api",
  },
];
// -1 means unlimited
```

---

## 9. Acceptance Criteria

Complete this checklist. Every item must be true before you write `agent-job.md`.

- [ ] **Schema migrated and relations verified** — `workspaces`, `workspace_members`, `usage_ledger` tables created; `plans`, `billings`, `usage` modified; all relations defined; all indexes added
- [ ] **Repository functions tested** — at least one raw query log per repository function confirming it works (`console.log` the SQL via Drizzle `.toSQL()` or query result)
- [ ] **Service functions have input validation** — workspace name length, email format for invites, role enum validation, entitlement checks
- [ ] **Controller returns consistent `{ success, data, error }` shape** — every endpoint, every code path (success and error)
- [ ] **Auth hardened** — every existing endpoint that accepted `userId` from query/body now derives from Clerk `req.auth`
- [ ] **Workspace middleware works** — `req.workspace.id` and `req.workspace.role` available on all workspace-scoped routes
- [ ] **Role guard works** — `requireRole('instructor')` returns 403 for learners
- [ ] **Frontend page renders without console errors** — WorkspaceSwitcher, CreateWorkspaceModal, MembersPage, SettingsPage
- [ ] **Loading and error states are visible** — skeleton loaders, error boundaries, toast notifications
- [ ] **Entitlements service exported and usable** — `checkEntitlement()` function callable by other agents' services
- [ ] **Plan seed data updated** — Free / Educator Pro / Corporate with structured columns
- [ ] **`locks.json` released** — clear all locks
- [ ] **`data.json` set to `status: "done"` and `percentComplete: 100`**
- [ ] **`agent-job.md` written** — contains: tables created, middleware exported, entitlements service API, breaking changes to existing endpoints, what Agents 2/3/4 need to know

---

## 10. `agent-job.md` Template

When done, write `./agent-todo/agent-1/agent-job.md` with this structure:

```markdown
# Agent 1 — Completion Report

## Status: DONE
## Completed At: [ISO timestamp]

## What Was Built
- [list of tables, services, controllers, middleware, frontend pages]

## Schema Changes
- [exact table names and key columns]

## Exports for Other Agents
- `checkEntitlement(workspaceId, action, quantity?)` from `quiz-backend/src/services/entitlements.service.ts`
- `resolveWorkspace` middleware from `quiz-backend/src/middlewares/workspace.middleware.ts`
- `requireRole(...roles)` middleware from `quiz-backend/src/middlewares/role.middleware.ts`
- `workspaceRoleEnum` from `quiz-backend/src/config/db/schema.ts`

## Breaking Changes
- [list any changes to existing API contracts]
- [e.g., "userId is no longer accepted from query params on /api/quizzes routes"]

## What Downstream Agents Need to Know
- [instructions for Agents 2, 3, 4]
```
