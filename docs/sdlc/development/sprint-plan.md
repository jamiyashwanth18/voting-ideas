# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Stand up authentication (register/login/logout) and the public ranked idea board.

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Browse all ideas ranked by upvotes | 8 | backend-agent | — |
| ↳ US-001-T1 | Task | Create ideas and votes schema | — | backend-agent | — |
| ↳ US-001-T2 | Task | Implement GET /ideas endpoint | — | backend-agent | — |
| ↳ US-001-T3 | Task | Build public idea list UI | — | frontend-agent | — |
| US-003 | Story | Self-register with email and password | 5 | backend-agent | — |
| US-004 | Story | Log in with email and password | 5 | backend-agent | US-003 |
| US-005 | Story | Log out | 2 | backend-agent | US-004 |

## Sprint 2: Sprint 2

Enable logged-in users to post, edit and delete their own ideas, upvote, and make the board responsive.

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-002 | Story | View the board on mobile and desktop browsers | 3 | frontend-agent | US-001 |
| US-006 | Story | Post a new idea | 5 | backend-agent | US-001, US-004 |
| US-007 | Story | Edit my own idea | 3 | backend-agent | US-006 |
| US-008 | Story | Delete my own idea | 3 | backend-agent | US-006 |
| US-009 | Story | Upvote an idea | 5 | backend-agent | US-001, US-004 |

## Sprint 3: Sprint 3

Finish voting (toggle off) and deliver admin moderation: idea removal and user deactivation.

Capacity: 20 points · Committed: 14

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-010 | Story | Toggle my upvote off | 2 | backend-agent | US-009 |
| US-011 | Story | Admin role assigned via configuration | 2 | devops-agent | US-003 |
| US-012 | Story | Admin reviews and removes any idea | 5 | backend-agent | US-011, US-008, US-001 |
| US-013 | Story | Admin manages abusive users | 5 | backend-agent | US-011, US-004 |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
