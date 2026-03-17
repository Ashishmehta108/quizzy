# Agent 2 — Content Library MVP

> **You are Agent 2.** Read this entire file before writing any code. This is your complete instruction set. You do NOT need any other spec file to do your work.

---

## 1. Coordination Protocol

### Your Workspace

Your working directory is `./agent-todo/agent-2/`. Create it at startup. Maintain these files:

| File | Purpose |
|---|---|
| `data.json` | Your live status. Update every meaningful step. |
| `agent-job.md` | Written **only** on completion. Summary of what you built, what changed, what downstream agents need. |
| `locks.json` | Files you currently own. No other agent may touch these. |

### `data.json` schema

```json
{
  "agentId": 2,
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
    "quiz-backend/src/repositories/document.repository.ts",
    "quiz-backend/src/repositories/course.repository.ts",
    "quiz-backend/src/services/ingestion.service.ts",
    "quiz-backend/src/services/library.service.ts",
    "quiz-backend/src/controllers/library.controller.ts",
    "quiz-backend/src/routes/library.routes.ts",
    "quiz-backend/src/utils/r2.ts",
    "quiz-app/app/dashboard/library/page.tsx",
    "quiz-app/app/dashboard/library/[id]/page.tsx",
    "quiz-app/components/dashboard/LibraryUpload.tsx",
    "quiz-app/components/dashboard/DocumentCard.tsx"
  ],
  "lockedAt": "ISO-8601 timestamp",
  "agentId": 2
}
```

Write `locks.json` **before** you create or edit any file. If a file is listed in another agent's `locks.json`, **stop and report a conflict** in `data.json.errors`.

### Dependency Position

```
Agent 1 (foundation) → YOU (Agent 2) → Agent 3 can run in parallel with you → Agent 4
```

**BLOCKING RULE**: Do NOT start writing code until `./agent-todo/agent-1/agent-job.md` exists. While waiting, set `data.json.status` to `"blocked"` and `blockedOn` to `"agent-1"`. Poll every 30 seconds.

Once Agent 1 is done, read its `agent-job.md` to learn:
- The `workspaces` and `workspace_members` table shapes
- The `checkEntitlement()` service API
- The `resolveWorkspace` and `requireRole` middleware exports
- Any breaking changes to existing endpoints

---

## 2. Schema Ownership (EXCLUSIVE)

**You own these tables. No other agent may create, alter, or add relations to them.**

| Table | Status |
|---|---|
| `courses` | **New** — create |
| `student_groups` | **New** — create (this is the "cohorts" concept from the plan) |
| `documents` | Existing — modify in-place |
| `document_chunks` | **New** — create |

**You do NOT own**: `users`, `workspaces`, `workspace_members`, `plans`, `billings`, `usage`, `usage_ledger`, `quizzes`, `questions`, `results`, `quizAttempts`, `assignments`, `assignment_members`, or any tables owned by Agents 1/3/4.

When referencing tables you don't own, use plain `varchar`/`uuid` columns without `.references()`:

```typescript
// YES — plain FK
workspaceId: uuid("workspace_id").notNull(),  // references workspaces.id but no import

// NO — cross-ownership import
workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
```

### Relations

Define Drizzle `relations()` **only** for tables you own:

```typescript
export const coursesRelations = relations(courses, ({ many }) => ({
  studentGroups: many(studentGroups),
  // materials linking handled via course_materials join or documents.courseId
}));

export const documentsRelations = relations(documents, ({ many }) => ({
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));
```

### Indexes

Add indexes on every foreign key and every column used in WHERE/JOIN/ORDER:

```typescript
(t) => ({
  workspaceIdx: index("idx_courses_workspace").on(t.workspaceId),
  statusIdx: index("idx_courses_status").on(t.status),
})
```

---

## 3. Exact Schema Definitions

### 3a. New table: `courses`

```typescript
export const courseStatusEnum = pgEnum("course_status", ["draft", "active", "archived"]);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(), // FK to workspaces (Agent 1 owns)
    title: varchar("title", { length: 300 }).notNull(),
    description: text("description"),
    status: courseStatusEnum("status").notNull().default("draft"),
    createdBy: varchar("created_by", { length: 36 }).notNull(), // userId
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => ({
    workspaceIdx: index("idx_courses_workspace").on(t.workspaceId),
    statusIdx: index("idx_courses_status").on(t.status),
    createdByIdx: index("idx_courses_created_by").on(t.createdBy),
  })
);
```

### 3b. New table: `student_groups`

```typescript
export const studentGroups = pgTable(
  "student_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    inviteCode: varchar("invite_code", { length: 20 }).unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    courseIdx: index("idx_sg_course").on(t.courseId),
    inviteIdx: index("idx_sg_invite").on(t.inviteCode),
  })
);
```

### 3c. Modify existing: `documents`

Add these columns to the existing `documents` table:

```typescript
export const indexingStatusEnum = pgEnum("indexing_status", [
  "pending",
  "processing",
  "indexed",
  "failed",
]);

export const documents = pgTable(
  "documents",
  {
    // KEEP all existing columns (id, userId, title, content, uploadUrl, createdAt, updatedAt)
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    uploadUrl: text("upload_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    // NEW columns
    workspaceId: uuid("workspace_id"),           // nullable for migration
    courseId: uuid("course_id"),                   // nullable — can be unattached
    contentHash: varchar("content_hash", { length: 64 }),
    indexingStatus: indexingStatusEnum("indexing_status").default("pending").notNull(),
    pageCount: integer("page_count").default(0),
    extractedTextUrl: text("extracted_text_url"), // URL to full extracted text in R2
    originalBlobUrl: text("original_blob_url"),   // URL to original file in R2
    fileType: varchar("file_type", { length: 20 }), // pdf, image, txt
    fileSizeBytes: integer("file_size_bytes"),
  },
  (t) => ({
    workspaceIdx: index("idx_docs_workspace").on(t.workspaceId),
    courseIdx: index("idx_docs_course").on(t.courseId),
    statusIdx: index("idx_docs_indexing").on(t.indexingStatus),
    hashIdx: index("idx_docs_hash").on(t.contentHash),
    userIdx: index("idx_docs_user").on(t.userId),
  })
);
```

### 3d. New table: `document_chunks`

```typescript
export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    pageNumber: integer("page_number"),
    tokenCount: integer("token_count"),
    embeddingId: varchar("embedding_id", { length: 100 }), // Pinecone vector ID
    metadata: jsonb("metadata"), // { startChar, endChar, headings, etc. }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    docIdx: index("idx_chunks_doc").on(t.documentId),
    pageIdx: index("idx_chunks_page").on(t.documentId, t.pageNumber),
    embeddingIdx: index("idx_chunks_embedding").on(t.embeddingId),
  })
);
```

---

## 4. MRCS Architecture (Mandatory)

Every file you create must follow this layered architecture. Add a comment block at the top of every file:

```typescript
/**
 * @layer controller | service | repository
 * @owner agent-2
 * @tables courses, student_groups, documents, document_chunks
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
│   ├── document.repository.ts      # CRUD for documents + document_chunks
│   ├── course.repository.ts        # CRUD for courses + student_groups
├── services/
│   ├── library.service.ts          # Document upload, list, detail, delete
│   ├── ingestion.service.ts        # Full pipeline: parse → chunk → embed → index
│   ├── course.service.ts           # Course CRUD + student group management
├── controllers/
│   ├── library.controller.ts       # Express handlers for /api/library/*
│   ├── course.controller.ts        # Express handlers for /api/courses/* (basic CRUD only)
├── routes/
│   ├── library.routes.ts           # Mount under /api/library
│   ├── course.routes.ts            # Mount under /api/courses (basic CRUD; Agent 3 adds assignment routes)
├── utils/
│   ├── r2.ts                       # Cloudflare R2 upload/download/delete helpers
```

### Response Shape (ALL Controllers)

```typescript
// Success
res.status(200).json({ success: true, data: { ... } });

// Error
res.status(4xx).json({ success: false, error: "Human-readable message" });
```

---

## 5. Cloudflare R2 Integration

### `quiz-backend/src/utils/r2.ts`

Use the `@aws-sdk/client-s3` package (R2 is S3-compatible):

```typescript
/**
 * @layer utility
 * @owner agent-2
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,           // e.g., https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string>;
export async function downloadFromR2(key: string): Promise<Buffer>;
export async function deleteFromR2(key: string): Promise<void>;
export function getR2PublicUrl(key: string): string;
```

### Key naming convention

```
{workspaceId}/documents/{documentId}/original.{ext}
{workspaceId}/documents/{documentId}/extracted.json
{workspaceId}/documents/{documentId}/chunks/{chunkIndex}.txt
```

### Environment variables to add

Add to `.env.example`:
```
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=quizzy-library
```

---

## 6. Ingestion Pipeline

### Current state (what's broken)

The existing ingestion in `quiz-backend/src/controllers/quiz.controller.ts`:
- Uploads are processed inline during quiz creation
- Files are parsed, chunked, embedded, upserted to Pinecone
- **Original files are deleted after processing**
- `documents.uploadUrl` is mostly empty
- No indexing status tracking
- No caching of embeddings

### New pipeline (`quiz-backend/src/services/ingestion.service.ts`)

```
Upload file
  → Store original to R2 → save originalBlobUrl to documents
  → Extract text (PDF parse via existing doc.ts / OCR via existing ocr.ts)
  → Store extracted text to R2 → save extractedTextUrl
  → Compute contentHash (SHA-256 of extracted text)
  → Check if contentHash already exists (skip re-embedding if so)
  → Chunk text (reuse existing chunk.ts)
  → Store chunks to document_chunks table
  → Embed chunks (Gemini embeddings)
  → Upsert to Pinecone with namespace = workspaceId
  → Update document.indexingStatus = "indexed"
  → Emit progress via Socket.IO at each stage
```

### Pinecone Namespacing

**Critical change** to `quiz-backend/src/ai/pinecone.ts`:

- All vector upserts must include `namespace: workspaceId`
- All RAG queries must scope by `namespace: workspaceId`
- Vector metadata must include: `documentId`, `chunkIndex`, `pageNumber`

Do NOT change the Pinecone client initialization, only the upsert/query calls.

### Citation Metadata

When chunks are embedded, store metadata that enables citation:

```typescript
// Pinecone vector metadata
{
  documentId: "...",
  documentTitle: "...",
  chunkIndex: 0,
  pageNumber: 3,
  excerpt: "first 200 chars of chunk...",
  workspaceId: "..."
}
```

### Cost Controls

- **Content hash caching**: Before embedding, check `documents.contentHash` — if identical, skip embedding, reuse existing vectors
- **Entitlements**: Before ingestion, call `checkEntitlement(workspaceId, "material_ingested", pageCount)` — if not allowed, return 403 with upgrade prompt data
- **Queue**: Use BullMQ + Redis for ingestion jobs (don't block the request). Return `202 Accepted` with a document ID, client polls status.

---

## 7. API Endpoints

### Library

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/library/upload` | Required | Instructor+ | Upload 1+ documents (multipart/form-data) |
| `GET` | `/api/library` | Required | Member | List documents in workspace (paginated) |
| `GET` | `/api/library/:id` | Required | Member | Document detail + chunks + status |
| `DELETE` | `/api/library/:id` | Required | Instructor+ | Delete document + R2 blobs + Pinecone vectors |
| `POST` | `/api/library/:id/reindex` | Required | Instructor+ | Re-run ingestion pipeline |
| `GET` | `/api/library/:id/status` | Required | Member | Polling endpoint for indexing progress |

### Courses (basic CRUD only — Agent 3 adds assignment logic)

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/courses` | Required | Instructor+ | Create course |
| `GET` | `/api/courses` | Required | Member | List courses in workspace |
| `GET` | `/api/courses/:id` | Required | Member | Course detail + materials + student groups |
| `PATCH` | `/api/courses/:id` | Required | Instructor+ | Update course title/desc/status |
| `DELETE` | `/api/courses/:id` | Required | Instructor+ | Archive course |
| `POST` | `/api/courses/:courseId/materials` | Required | Instructor+ | Link document(s) to course |
| `DELETE` | `/api/courses/:courseId/materials/:docId` | Required | Instructor+ | Unlink document from course |

### Student Groups (basic CRUD only — Agent 3 adds invite/join logic)

| Method | Route | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/courses/:courseId/groups` | Required | Instructor+ | Create student group |
| `GET` | `/api/courses/:courseId/groups` | Required | Member | List groups in course |
| `DELETE` | `/api/groups/:id` | Required | Instructor+ | Delete group |

---

## 8. Frontend

### Tech constraints (MANDATORY)

- **No inline styles**. All styling via Tailwind + CVA (class-variance-authority).
- **Loading states**: Skeleton loaders (not spinners) on every async action.
- **Error boundaries**: On every page component.
- **Optimistic updates**: Use React Query `useMutation` with `onMutate` for create/update/delete.
- **No `any` types**. Fully typed props, API responses, state.
- **Transitions**: `transition-all duration-150` on all interactive elements.
- **Focus rings**: `focus-visible:ring-2 focus-visible:ring-offset-2` on all inputs/buttons.
- **Empty states**: Actionable CTAs (e.g., "Upload your first document" with upload icon).
- **Toasts**: Sonner or react-hot-toast for all async success/error feedback.

### Pages to Build

#### Library Page (`/dashboard/library`)

- Grid view of documents with cards showing: title, file type icon, page count, indexing status badge, uploaded date
- Upload button → opens `LibraryUpload` component
- Search/filter by title, status, file type
- Bulk select + delete
- Empty state: "No documents yet. Upload your course materials to get started."

#### Document Detail (`/dashboard/library/[id]`)

- Header: title, status badge, file type, page count, uploaded date
- Tabs: Preview | Chunks | Citations
  - Preview: rendered text or iframe of original
  - Chunks: list of chunks with page numbers
  - Citations: where this document has been cited in quizzes
- Actions: Re-index, Delete, Link to Course
- Indexing progress bar if status is "processing"

#### Library Upload Component (`LibraryUpload.tsx`)

- Drag-and-drop zone + file browser
- Supported formats: PDF, PNG/JPG (OCR), TXT
- Upload progress bar per file
- Socket.IO listener for ingestion progress (reuse existing pattern from `createQuizForm.tsx`)
- Max file size indicator based on plan limits
- Files are sent as multipart/form-data

#### Course Pages (basic — Agent 3 extends with assignment tabs)

##### Course List (`/dashboard/courses`)

- Card grid: title, status badge (Draft/Active/Archived), material count, student count, created date
- Create course button → modal
- Empty state: "Create your first course to organize materials and assessments."

##### Course Detail (`/dashboard/courses/[id]`)

- Header: title, status, actions (Edit, Archive)
- Tabs: Materials | Student Groups | (Assignments tab added by Agent 3)
  - Materials tab: linked documents from library, "Add from Library" button
  - Student Groups tab: list groups, create group, copy invite code

### Quiz Creation Integration

Modify `quiz-app/components/dashboard/createQuizForm.tsx`:
- Add a "Select from Library" option alongside direct file upload
- When selected, show a document picker modal listing indexed library documents
- Pass selected `documentId(s)` to the quiz creation API instead of uploading files

---

## 9. Acceptance Criteria

Complete this checklist. Every item must be true before you write `agent-job.md`.

- [ ] **Schema migrated and relations verified** — `courses`, `student_groups`, `document_chunks` created; `documents` modified with new columns; all relations defined; all indexes created
- [ ] **Repository functions tested** — at least one raw query log per repository function (document CRUD, chunk insert/query, course CRUD, student group CRUD)
- [ ] **Service functions have input validation** — file type validation, size limits, title length, course title uniqueness per workspace
- [ ] **Controller returns consistent `{ success, data, error }` shape** — every endpoint, every code path
- [ ] **R2 integration works** — upload, download, delete; key naming follows convention
- [ ] **Ingestion pipeline runs end-to-end** — upload → R2 store → parse → chunk → embed → Pinecone upsert → status update
- [ ] **Pinecone namespaced by workspace** — verified with a test query scoped to namespace
- [ ] **Content hash caching works** — re-upload of same file skips embedding
- [ ] **Entitlements checked** — `checkEntitlement("material_ingested", pageCount)` called before ingestion
- [ ] **Frontend: Library page renders** — document grid, upload, search, empty state
- [ ] **Frontend: Document detail renders** — tabs, status, chunks, progress bar
- [ ] **Frontend: No console errors** — clean render on all pages
- [ ] **Frontend: Loading + error states visible** — skeletons, error boundaries, toasts
- [ ] **Quiz creation updated** — "Select from Library" option works
- [ ] **`locks.json` released** — clear all locks
- [ ] **`data.json` set to `status: "done"` and `percentComplete: 100`**
- [ ] **`agent-job.md` written**

---

## 10. `agent-job.md` Template

When done, write `./agent-todo/agent-2/agent-job.md`:

```markdown
# Agent 2 — Completion Report

## Status: DONE
## Completed At: [ISO timestamp]

## What Was Built
- [list of tables, services, controllers, pages]

## Schema Changes
- [exact table names and columns added/modified]

## Exports for Other Agents
- Course CRUD repository/service for Agent 3 to extend with assignment logic
- `documents` table shape (Agent 3 needs documentId for citation display)
- `studentGroups` table shape (Agent 3 adds member management)
- Ingestion service for Agent 4 to track in usage ledger
- Pinecone namespace convention: `workspaceId`

## R2 Setup
- [bucket name, key convention, environment variables needed]

## New Routes Registered
- [list routes added to app.ts]

## What Downstream Agents Need to Know
- [instructions for Agents 3 and 4]
```
