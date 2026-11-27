# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Anyone, including visitors without an account, can browse all ideas on the public board ranked by upvote count, highest first. This is the read-only public face of the product.

Goal: public, read-only idea browsing ranked by upvotes. Assumptions recorded: the product is entirely free with no payments/subscriptions/billing of any kind; ideas consist of a title and short text description only, with no images, attachments, categories, tags, or comment threads in this MVP. Stories: US-001 (browse all ideas ranked by upvotes, critical), US-002 (board displays correctly on mobile and desktop browser widths, high).

**Related:** US-001, US-002

### EPIC-002 · approved · source: planning:EPIC-002

Anyone can self-register with an email address and password, then log in and log out. Authentication gates posting ideas, managing one's own ideas, and voting.

Goal: self-service account registration and session-based authentication/logout gating idea posting, idea management, and voting. Recorded scope reduction: the originally confirmed understanding included email verification and password reset via emailed links through a transactional email service; for this Lightweight MVP the email service (e.g. SendGrid) was removed from the stack, so accounts are email-and-password only with no email verification step and no emailed password-reset link -- this is a deliberate reduction recorded against US-003. Sign-in/session security stated as checkable outcomes: passwords stored only in hashed form, sessions expire after a period of inactivity, and signing out ends the session; the specific mechanism is left to implementation. Stories: US-003 (self-register with email and password, critical), US-004 (log in with email and password, critical), US-005 (log out, high).

**Related:** US-003, US-004, US-005

### EPIC-003 · approved · source: planning:EPIC-003

Logged-in users can post a new idea (title + short text description) and can edit or delete ideas they authored.

Goal: authoring and self-management of one's own ideas, text only. Assumption recorded: ideas have a title and short text description only -- no images, attachments, categories, or tags are supported in this MVP. Stories: US-006 (post a new idea, critical), US-007 (edit my own idea, high), US-008 (delete my own idea, high).

**Related:** US-006, US-007, US-008

### EPIC-004 · approved · source: planning:EPIC-004

Logged-in users can upvote ideas, with at most one upvote per user per idea, and can toggle that upvote off. There are no downvotes and voting requires login.

Goal: single-upvote-per-user voting with toggle-off, no downvotes. Assumption recorded: only upvotes exist; a user can remove (toggle off) their own upvote; users cannot vote unless logged in and cannot vote twice on the same idea. Stories: US-009 (upvote an idea, critical), US-010 (toggle my upvote off, high).

**Related:** US-009, US-010

### EPIC-005 · approved · source: planning:EPIC-005

A designated admin can review and remove any idea on the public board and deactivate abusive users. The admin role is granted only via configuration or seed, never self-service.

Goal: simple admin moderation tooling to view/remove any idea and deactivate abusive accounts. Assumption recorded: the admin role is assigned via configuration/seed rather than a self-service upgrade; admin tooling is a simple view to see and remove ideas and to deactivate abusive users; there is no public flag/report workflow in this MVP; any admin credential is set through configuration using a placeholder such as <set-at-first-login>, never a real value. Stories: US-011 (admin role assigned via configuration, high), US-012 (admin reviews and removes any idea, high), US-013 (admin manages abusive users, medium).

**Related:** US-011, US-012, US-013

### SPRINT-1 · approved · source: planning:Sprint 1

First sprint of the approved v1 plan: stand up authentication (register/login/logout) and the public ranked idea board. Capacity 20 points.

Goal (plan v1, approved): 'Stand up authentication (register/login/logout) and the public ranked idea board.' Capacity: 20. Items whose titles match this goal text: EPIC-002 (Account Registration and Authentication, unassigned role), US-003 Self-register with email and password (5 pts, backend-agent), US-004 Log in with email and password (5 pts, backend-agent), US-005 Log out (2 pts, backend-agent), EPIC-001 (Public Idea Browsing, unassigned role), US-001 Browse all ideas ranked by upvotes (8 pts, backend-agent) with its sub-tasks US-001-T1 Create ideas and votes schema (backend-agent), US-001-T2 Implement GET /ideas endpoint (backend-agent), US-001-T3 Build public idea list UI (frontend-agent). Sprint-item linkage is inferred from matching the sprint goal wording to story/epic titles; the plan input did not tag each backlog item with an explicit sprint number.

**Related:** EPIC-002, US-003, US-004, US-005, EPIC-001, US-001

### SPRINT-2 · approved · source: planning:Sprint 2

Second sprint of the approved v1 plan: enable logged-in users to post, edit and delete their own ideas, upvote, and make the board responsive. Capacity 20 points.

Goal (plan v1, approved): 'Enable logged-in users to post, edit and delete their own ideas, upvote, and make the board responsive.' Capacity: 20. Items whose titles match this goal text: EPIC-003 (Posting and Managing Your Own Ideas, unassigned role), US-006 Post a new idea (5 pts, backend-agent), US-007 Edit my own idea (3 pts, backend-agent), US-008 Delete my own idea (3 pts, backend-agent), EPIC-004 (Upvoting Ideas, unassigned role), US-009 Upvote an idea (5 pts, backend-agent), US-002 View the board on mobile and desktop browsers (3 pts, frontend-agent). Sprint-item linkage is inferred from matching the sprint goal wording to story/epic titles; the plan input did not tag each backlog item with an explicit sprint number.

**Related:** EPIC-003, US-006, US-007, US-008, EPIC-004, US-009, US-002

### SPRINT-3 · approved · source: planning:Sprint 3

Third sprint of the approved v1 plan: finish voting (toggle off) and deliver admin moderation -- idea removal and user deactivation. Capacity 20 points.

Goal (plan v1, approved): 'Finish voting (toggle off) and deliver admin moderation: idea removal and user deactivation.' Capacity: 20. Items whose titles match this goal text: US-010 Toggle my upvote off (2 pts, backend-agent), EPIC-005 (Admin Moderation, unassigned role), US-012 Admin reviews and removes any idea (5 pts, backend-agent), US-013 Admin manages abusive users (5 pts, backend-agent). Also included here: US-011 Admin role assigned via configuration (2 pts, devops-agent) -- this backlog item belongs to EPIC-005 and is the only sprint whose goal touches that epic, though US-011 is not explicitly named in the Sprint 3 goal text. Sprint-item linkage is inferred from matching the sprint goal wording to story/epic titles; the plan input did not tag each backlog item with an explicit sprint number.

**Related:** US-010, EPIC-005, US-012, US-013, US-011
<!-- sdlc:auto:end narrative -->
