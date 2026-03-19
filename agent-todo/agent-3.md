# agent-3: Backend Leaderboards and Attempt Consistency

## Mission
Build reliable leaderboard data by fixing attempt/result consistency and adding ranking endpoints.

## Primary ownership
- `quiz-backend/src/repositories/analytics.repository.ts`
- `quiz-backend/src/services/analytics.service.ts`
- `quiz-backend/src/controllers/analytics.controller.ts`
- `quiz-backend/src/routes/analytics.routes.ts`
- `quiz-backend/src/controllers/result.controller.ts`
- `quiz-backend/src/repositories/attempt.repository.ts`

## Shared files (lock required)
- `quiz-app/app/dashboard/analytics/page.tsx` (shared API contract touchpoint with agent-4)

## Parallel-safe task queue
1. Ensure submission flow writes/links attempts and results consistently.
2. Add leaderboard queries for workspace/quiz/contest scopes.
3. Expose leaderboard endpoints with workspace checks.
4. Remove or reduce mocked analytics fields where real data is available.
5. Provide stable response shapes for frontend consumption.

## Lock workflow
1. Read `agent-todo/locks.json`.
2. Update your status to `running`.
3. Lock each file before edits; release immediately after save.
4. Coordinate shared frontend contract changes through lock notes.
5. Set status to `done` once backend contract is stable.

## Done criteria
- Leaderboard APIs return deterministic ranked data.
- Attempt and result linkage is consistent for analytics.
- Shared file locks are not held longer than needed.
