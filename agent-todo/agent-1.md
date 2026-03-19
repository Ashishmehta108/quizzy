# agent-1: Backend RBAC and Quiz Guarding

## Mission
Harden backend authorization for quiz and workspace management flows. Own RBAC changes and role-aware route protection.

## Primary ownership
- `quiz-backend/src/middlewares/role.middleware.ts`
- `quiz-backend/src/routes/quiz.routes.ts`
- `quiz-backend/src/controllers/quiz.controller.ts`
- `quiz-backend/src/routes/workspace.routes.ts`
- `quiz-backend/src/repositories/workspace.repository.ts`
- `quiz-backend/src/services/workspace.service.ts`

## Shared files (lock required)
- `quiz-backend/src/config/db/schema.ts` (shared with agent-2)

## Parallel-safe task queue
1. Add/extend custom workspace roles in backend role checks.
2. Enforce `resolveUser` + `resolveWorkspace` + role gate on quiz routes.
3. Ensure quiz create/list/get operations validate workspace membership.
4. Add workspace role-management endpoints if missing (service/repository already present).
5. Align error responses for permission failures.

## Lock workflow
1. Read `agent-todo/locks.json`.
2. Set your agent state to `running` and add `currentTask`.
3. Lock one file at a time before editing.
4. Save and release immediately after edit is complete.
5. If blocked, move to next unblocked task.

## Done criteria
- All quiz and workspace-sensitive routes enforce workspace role checks.
- No edits to files owned by other agents without lock acquisition.
- Update your state in `locks.json` to `done`.
