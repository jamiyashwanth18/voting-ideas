# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run. **Tests** counts the tests written for the story, and **Result** how many last passed, how many failed and when, as of this page's generation; the Documentation tab shows them live.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Test step | Tests | Result | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Browse all ideas ranked by upvotes | US-001, US-001-T1, US-001-T2, US-001-T3 | 1 | GET /ideas, api, db, ideas, votes, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-002 | EPIC-001 | View the board on mobile and desktop browsers | US-002 | 2 | web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-003 | EPIC-002 | Self-register with email and password | US-003 | 1 | POST /auth/register, api, db, users | — | — | not started | not run | 0 | No tests | 0/4 tested · 0/4 passing | — |
| US-004 | EPIC-002 | Log in with email and password | US-004 | 1 | GET /auth/me, POST /auth/login, api, db, sessions, users | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-005 | EPIC-002 | Log out | US-005 | 1 | POST /auth/logout, api, sessions | — | — | not started | not run | 0 | No tests | 0/1 tested · 0/1 passing | — |
| US-006 | EPIC-003 | Post a new idea | US-006 | 2 | POST /ideas, api, db, ideas, users, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-007 | EPIC-003 | Edit my own idea | US-007 | 2 | PATCH /ideas/{id}, api, ideas, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-008 | EPIC-003 | Delete my own idea | US-008 | 2 | DELETE /ideas/{id}, api, ideas, votes, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-009 | EPIC-004 | Upvote an idea | US-009 | 2 | POST /ideas/{id}/vote, api, db, ideas, votes, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-010 | EPIC-004 | Toggle my upvote off | US-010 | 3 | POST /ideas/{id}/vote, api, ideas, votes, web | — | — | not started | not run | 0 | No tests | 0/1 tested · 0/1 passing | — |
| US-011 | EPIC-005 | Admin role assigned via configuration | US-011 | 3 | api, db, users | — | — | not started | not run | 0 | No tests | 0/1 tested · 0/1 passing | — |
| US-012 | EPIC-005 | Admin reviews and removes any idea | US-012 | 3 | DELETE /ideas/{id}, GET /admin/ideas, api, ideas, users, votes, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-013 | EPIC-005 | Admin manages abusive users | US-013 | 3 | POST /admin/users/{id}/deactivate, api, db, sessions, users | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
<!-- sdlc:auto:end matrix -->
