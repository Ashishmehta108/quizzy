# agent-2: Backend Contest Domain

## Mission
Implement contest as a first-class backend feature with clean, isolated modules so other agents can work in parallel.

## Primary ownership
- `quiz-backend/src/routes/contest.routes.ts` (new)
- `quiz-backend/src/controllers/contest.controller.ts` (new)
- `quiz-backend/src/services/contest.service.ts` (new)
- `quiz-backend/src/repositories/contest.repository.ts` (new)

## Shared files (lock required)
- `quiz-backend/src/config/db/schema.ts` (shared with agent-1)
- `quiz-backend/src/app.ts` (shared with other agents for route mounting)

## Parallel-safe task queue
1. Design contest tables and relations in schema (contest, participants, statuses, schedule).
2. Build repository/service/controller/route stack for CRUD + join/register + start/end.
3. Add workspace role checks on contest management endpoints.
4. Mount contest router in app bootstrap.
5. Document API contract briefly in code comments where needed.

## Lock workflow
1. Read `agent-todo/locks.json`.
2. Mark `agent-2` as `running` with active task.
3. Acquire lock for each shared file before touching it.
4. Release shared locks quickly to avoid blocking.
5. If a lock is busy, continue with isolated contest module work.

## Done criteria
- Contest routes compile and are mounted.
- Schema changes are complete and migration-ready.
- Lock entries and agent state are updated in `locks.json`.
