# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Public Idea Browsing: anyone, including visitors without an account, can browse all ideas ranked by upvote count highest first -- the read-only public face of the product.

Assumptions recorded at epic level: the product is entirely free with no payments/subscriptions/billing of any kind; ideas consist of a title and short text description only, with no images, attachments, categories, tags or comment threads in this MVP.

**Related:** US-001, US-002

### EPIC-002 · approved · source: planning:EPIC-002

Account Registration and Authentication: self-registration with email and password, plus log in/log out, gating the ability to post ideas, manage own ideas, and vote.

Assumption recorded at epic level: the originally confirmed understanding described email verification and emailed password-reset links via a transactional email service; for this Lightweight MVP scope the email service (e.g. SendGrid) was removed from the stack, so accounts are email-and-password only with no verification step and no emailed password reset -- a deliberate scope reduction recorded against the affected requirement. Sign-in and session security are stated as checkable outcomes (hashed passwords, inactivity expiry, logout ends session); the specific mechanism is left to implementation.

**Related:** US-003, US-004, US-005

### EPIC-003 · approved · source: planning:EPIC-003

Posting and Managing Your Own Ideas: logged-in users can post a title-and-short-description idea and edit or delete ideas they authored.

Assumption recorded at epic level: ideas have a title and short text description only; no images, attachments, categories or tags are supported in this MVP.

**Related:** US-006, US-007, US-008

### EPIC-004 · approved · source: planning:EPIC-004

Upvoting Ideas: logged-in users can cast at most one upvote per idea and toggle it off; there are no downvotes; voting requires being logged in.

Assumption recorded at epic level: only upvotes exist, no downvote; a user can remove (toggle off) their own upvote; users cannot vote unless logged in and cannot vote twice on the same idea.

**Related:** US-009, US-010

### EPIC-005 · approved · source: planning:EPIC-005

Admin Moderation: a designated admin can review and remove any idea and manage abusive users; the admin role is granted through configuration or seed, not self-service.

Assumption recorded at epic level: the admin role is assigned via configuration/seed rather than a self-service upgrade; admin tooling is a simple view to see and remove ideas and deactivate abusive users; there is no public flag/report workflow in this MVP; any admin credential is set through configuration using a placeholder such as <set-at-first-login>, never a real value.

**Related:** US-011, US-012, US-013
<!-- sdlc:auto:end narrative -->
