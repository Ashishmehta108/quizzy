# agent-4: Frontend Contests, Leaderboards, and API Unification

## Mission
Implement contest/leaderboard UI and unify frontend API usage for reliable workspace-aware requests.

## Primary ownership
- `quiz-app/lib/api.ts`
- `quiz-app/lib/types.ts`
- `quiz-app/components/dashboard/Sidebar.tsx`
- `quiz-app/app/dashboard/contests/page.tsx` (new)
- `quiz-app/app/dashboard/contests/[id]/page.tsx` (new)
- `quiz-app/app/dashboard/leaderboards/page.tsx` (new)

## Shared files (lock required)
- `quiz-app/app/dashboard/analytics/page.tsx` (shared with agent-3)

## Parallel-safe task queue
1. Add contests and leaderboards navigation entries.
2. Create contests list/detail pages and leaderboard page shells.
3. Standardize API client usage (token + workspace header behavior).
4. Add typed response models for contests and leaderboards.
5. Wire analytics/leaderboard UI to backend endpoints after contract finalization.

## Lock workflow
1. Read `agent-todo/locks.json`.
2. Mark agent state to `running`.
3. Lock shared files before any edit and release quickly.
4. Work on isolated new pages while waiting on backend contract locks.
5. Mark state `done` and leave handoff note in lock metadata.

## Done criteria
- Dashboard has contest and leaderboard entry points.
- New pages compile with typed API data.
- No hardcoded localhost API calls remain in touched files.
