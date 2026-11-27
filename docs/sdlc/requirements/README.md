# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-STACK-001 · approved · source: requirements:technology-stack

Product owner approved an exact technology stack: FastAPI backend, AWS cloud, PostgreSQL 16 database, React 19 frontend. No substitutions are to be made.

- Backend: FastAPI 0.115 -- chosen because the server work (register/login/logout, post/edit/delete idea, one-vote-per-user-per-idea enforcement) is modest and well covered with low overhead; integrates cleanly with PostgreSQL and (previously) an email service.
- Cloud: AWS -- chosen for cheap, reliable hosting of a low-traffic free public board, with managed PostgreSQL available.
- Database: PostgreSQL 16 -- chosen because data is relational (users, ideas, votes); a uniqueness constraint enforces one vote per user per idea even under concurrent clicks; sorting by vote count is trivial at this scale.
- Frontend: React 19 -- chosen for the responsive, interactive re-ordering idea list, rendering cleanly on phone and desktop from one codebase.

### REQ-SERVICES-001 · approved · source: requirements:capabilities-in-scope

The approved set of capabilities (services) the board offers to its users.

- Public browsing of all ideas ranked by upvotes, highest first.
- Email-and-password sign-up (no email verification).
- Log in and log out.
- Post an idea with title and short description.
- Upvote an idea, one vote per user, toggleable off.
- Edit and delete your own ideas.
- Entirely free; no payments or billing.
- Ideas are title and short text only -- no images or attachments.

### REQ-SCOPE-001 · approved · source: requirements:scope

Delivery scope is lightweight MVP, requirements version 1. Several items were explicitly excluded.

Out of scope -- do not design or build:
- Native mobile apps (iOS/Android).
- Comments/discussion on ideas.
- Categories/tags.
- Email notifications about activity.
- Email service (SendGrid was removed from the stack), which also removes email verification at sign-up and emailed password reset (see NFR-012, NFR-013).

### REQ-FEAT-001 · approved · source: requirements:sign-in-accounts

Covers account creation and session handling with email and password.

- Register with email and password: visitor creates an account with a valid, unused email and a password meeting stated rules; duplicate emails and invalid details are rejected with a clear message; account is usable immediately (no email verification).
- Log in: registered, active user logs in with email and password to reach account-gated features; incorrect password or unknown email is refused.
- Log out: logged-in user can log out to end their session so no one else on the same device can act as them.

### REQ-FEAT-002 · approved · source: requirements:browsing-ideas

Covers the public, read-only idea list.

- Browse ideas ranked by upvotes: anyone, including visitors without an account, can view the full list of ideas ordered by upvote count highest to lowest; each idea shows title, short description and current upvote count.
- Empty board message: when no ideas have been posted yet, the board shows a no-ideas message, without error.

### REQ-FEAT-003 · approved · source: requirements:managing-ideas

Covers creation, editing and deletion of a user's own ideas.

- Post a new idea: logged-in user can post an idea with non-empty title and short description within allowed length limits; idea is attributed to them, starts at zero upvotes, appears on the public list; visitors are prompted to log in or register.
- Edit your own idea: author can change title and description; valid changes are shown on the board; empty or over-length text is rejected with a message and the original is left unchanged.
- Delete your own idea: author can delete it after confirming; the idea and its upvotes are removed and it no longer appears on the board.

### REQ-FEAT-004 · approved · source: requirements:upvoting-ideas

Covers casting and removing upvotes.

- Upvote an idea: logged-in user can upvote an idea, increasing its count by one and updating its ranked position; each user can upvote a given idea at most once; visitors are prompted to log in or register.
- Remove your upvote: a user who has upvoted an idea can toggle it off, decreasing the count by one, and may upvote again later.

### REQ-FEAT-005 · approved · source: requirements:admin-moderation

Covers the admin role and moderation actions.

- Admin role via configuration: an account is granted admin role through configuration or seed data, with any credential supplied as a placeholder such as <set-at-first-login>; ordinary users cannot grant themselves admin.
- Review and remove any idea: a logged-in admin can open the admin view to see all ideas regardless of author and remove any one; the removed idea and its upvotes disappear from the public list.
- Deactivate abusive users: a logged-in admin can deactivate an abusive user's account so that user can no longer log in or continue to post or vote.

### NFR-001 · approved · source: requirements:NFR-001

[security] Passwords stored only as hashes.

User passwords are stored only in hashed form and never kept or shown in plain text.

### NFR-002 · approved · source: requirements:NFR-002

[security] Sessions expire after inactivity.

A logged-in session expires after a period of inactivity; the next action needing login is rejected and prompts the user to log in again.

### NFR-003 · approved · source: requirements:NFR-003

[security] Signing out ends the session.

When a user logs out, their session is ended so they can no longer perform actions that require login without logging in again.

### NFR-004 · approved · source: requirements:NFR-004

[security] Deactivation ends access and sessions.

When an admin deactivates an account, that user can no longer log in and their existing sessions are ended so they cannot continue to post or vote.

### NFR-005 · approved · source: requirements:NFR-005

[security] Generic login failure message.

A failed login returns a generic message that does not reveal whether the email or the password was wrong, and no session is started.

### NFR-006 · approved · source: requirements:NFR-006

[security] Only authors can change their ideas.

Only the author of an idea can edit or delete it; attempts by any other user are refused.

### NFR-007 · approved · source: requirements:NFR-007

[security] Moderation limited to admins.

Only accounts designated as admin can open the admin view, remove ideas by other authors, or deactivate users; non-admin users are refused these actions.

### NFR-008 · approved · source: requirements:NFR-008

[security] One upvote per user per idea under concurrent clicks.

Each user can have at most one upvote on a given idea, and this holds even when the same person clicks several times at once so no duplicate vote is recorded.

### NFR-009 · approved · source: requirements:NFR-009

[usability] Readable on mobile and desktop.

The idea board remains readable and usable at typical mobile phone widths without horizontal scrolling and makes use of the available space at desktop widths.

### NFR-010 · approved · source: requirements:NFR-010

[usability] Stable order for tied ideas.

When two or more ideas have the same upvote count, their relative order is stable and deterministic across page reloads.

### NFR-011 · approved · source: requirements:NFR-011

[scalability] Supports low traffic of hundreds of users.

The system is sized for a low-traffic public board serving on the order of hundreds of users.

### NFR-012 · approved · source: requirements:NFR-012

[security] (accepted risk) No email verification at sign-up.

For this lightweight MVP the email service was removed, so new accounts are usable immediately with no email-verification step. The risk of unverified email addresses is accepted.

### NFR-013 · approved · source: requirements:NFR-013

[usability] (accepted risk) No emailed password reset.

With the email service removed from scope, there is no emailed password-reset link in this MVP, and the absence of self-service password recovery is accepted.
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-11-27

**Capabilities in scope:** Public browsing of all ideas ranked by upvotes, highest first, Email and password sign-up, Log in and log out, Post an idea with title and short description, Upvote an idea, one vote per user, toggleable off, Edit and delete your own ideas, Entirely free; no payments or billing, Ideas are title and short text only, no images or attachments, Email-and-password accounts, no email verification

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | The server work here is modest and well-defined: register/login/logout, post/edit/delete an idea, and enforce one upvote per user per idea. FastAPI covers all of it with low overhead, suits hundreds of users comfortably, and integrates cleanly with PostgreSQL and the email service for your verification and password-reset links. |
| cloud | AWS | A low-traffic, free public board needs a reliable, inexpensive place to host the web app, database and the email integration. AWS runs a small app like this cheaply, keeps running as usage grows from hundreds of users, and offers a managed PostgreSQL so you are not babysitting the database. |
| database | PostgreSQL | You confirmed a relational database, and your data is naturally relational: users, ideas, and votes, where the key rule is one vote per user per idea. PostgreSQL enforces that rule directly with a uniqueness constraint so a user cannot vote twice even under concurrent clicks, and sorting ideas by upvote count is trivial for it at your scale. |
| frontend | React | Your board is a responsive web app that non-logged-in visitors browse and logged-in users interact with (posting ideas, toggling upvotes that re-sort the list live). React handles that interactive, re-ordering list well and renders cleanly on phones and desktops from one codebase, which is exactly the single responsive site you described. |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Public Idea Browsing

Anyone on the internet, including visitors who are not logged in, can browse all ideas on the board. Ideas are listed ranked by their upvote count, highest first. This is the public, read-only face of the product.

Assumption: The product is entirely free to use and browse; there are no payments, subscriptions, or billing of any kind.

Assumption: Ideas consist of a title and a short text description only; there are no images, attachments, categories, tags, or comment threads in this MVP.

### US-001: Browse all ideas ranked by upvotes

**Priority:** critical

> As a visitor who is not logged in, I want to view the full list of ideas ranked by upvote count, highest first, so that I can see which ideas are most popular without needing an account.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | ideas exist on the board with differing upvote counts | a visitor who is not logged in opens the idea board | all ideas are displayed in a list ordered by upvote count from highest to lowest, each showing its title, short description, and current upvote count |
| AC-002 | two ideas have the same upvote count | the board is displayed | both ideas appear in the list and their relative order is stable and deterministic across page reloads |
| AC-003 | no ideas have been posted yet | a visitor opens the board | an empty-state message is shown indicating there are no ideas yet, and no error occurs |

### US-002: View the board on mobile and desktop browsers

**Priority:** high

> As a visitor, I want the board to display correctly on both phone and desktop browser widths, so that I can use the product on whatever device I have.

| ID | Given | When | Then |
|---|---|---|---|
| AC-004 | the idea board is loaded in a browser | the viewport is a typical mobile phone width | the idea list remains readable and usable without horizontal scrolling |
| AC-005 | the idea board is loaded in a browser | the viewport is a typical desktop width | the idea list is laid out to make use of the available width and remains readable |

## EPIC-002: Account Registration and Authentication

Anyone can self-register with an email address and password, then log in and log out. Authentication gates the ability to post ideas, manage your own ideas, and vote.

Assumption: The confirmed understanding described email verification and password reset via emailed links through a transactional email service. For this Lightweight MVP scope the email service (e.g. SendGrid) was removed from the stack, so accounts are email-and-password with no email verification step and no emailed password-reset link. This is a deliberate scope reduction recorded here against the affected requirement.

Sign-in and session security are stated as checkable outcomes: passwords are stored only in hashed form, sessions expire after a period of inactivity, and signing out ends the session. The specific mechanism is left to implementation.

### US-003: Self-register with email and password

**Priority:** critical

> As a visitor without an account, I want to register using my email address and a password, so that I can log in to post and upvote ideas.

| ID | Given | When | Then |
|---|---|---|---|
| AC-006 | a visitor is on the registration page | they submit a valid, unused email address and a password that meets the stated password rules | an account is created, the password is stored only in hashed form, and the visitor is able to log in |
| AC-007 | a visitor enters an email address that already has an account | they submit the registration form | registration is rejected with a message indicating the email is already registered, and no duplicate account is created |
| AC-008 | a visitor enters a malformed email address or a password that does not meet the stated rules | they submit the registration form | registration is rejected with a validation message identifying the problem, and no account is created |
| AC-009 | the email service has been removed from this MVP scope | a new account is created | the account becomes usable immediately with no email-verification step required |

### US-004: Log in with email and password

**Priority:** critical

> As a registered user, I want to log in with my email and password, so that I can access features that require an account.

| ID | Given | When | Then |
|---|---|---|---|
| AC-010 | a registered, active account exists | the user submits the correct email and password | the user is logged in and a session is started |
| AC-011 | a registered account exists | the user submits an incorrect password or an unknown email | login is refused with a generic message that does not reveal which field was wrong, and no session is started |
| AC-012 | a user has been logged in and inactive beyond the session expiry period | they next attempt an action that requires login | the expired session is rejected and the user is prompted to log in again |

### US-005: Log out

**Priority:** high

> As a logged-in user, I want to log out, so that I can end my session so no one else using the device can act as me.

| ID | Given | When | Then |
|---|---|---|---|
| AC-013 | a user is logged in | they choose to log out | their session is ended and they can no longer perform actions that require login without logging in again |

## EPIC-003: Posting and Managing Your Own Ideas

Logged-in users can post a new idea consisting of a title and a short text description, and can edit or delete the ideas they authored. Ideas are text only.

Assumption: Ideas have a title and a short text description only; no images, attachments, categories, or tags are supported in this MVP.

### US-006: Post a new idea

**Priority:** critical

> As a logged-in user, I want to post an idea with a title and a short text description, so that others can see and upvote my idea.

| ID | Given | When | Then |
|---|---|---|---|
| AC-014 | a user is logged in | they submit an idea with a non-empty title and description within the allowed length limits | the idea is created, attributed to that user as author, starts with an upvote count of zero, and appears in the public idea list |
| AC-015 | a user is logged in | they submit an idea with an empty title or an empty description, or with text exceeding the allowed length | the idea is rejected with a validation message and no idea is created |
| AC-016 | a visitor is not logged in | they attempt to open the post-an-idea form or submit an idea | the action is refused and they are prompted to log in or register |

### US-007: Edit my own idea

**Priority:** high

> As a logged-in user who authored an idea, I want to edit the title and description of my idea, so that I can correct or improve it after posting.

| ID | Given | When | Then |
|---|---|---|---|
| AC-017 | a user is logged in and is the author of an idea | they save valid changes to its title or description | the idea is updated and the new text is shown on the board |
| AC-018 | a user is logged in but is not the author of an idea | they attempt to edit that idea | the edit is refused |
| AC-019 | the author edits their idea | they submit an empty title or description or text exceeding the allowed length | the change is rejected with a validation message and the original idea is unchanged |

### US-008: Delete my own idea

**Priority:** high

> As a logged-in user who authored an idea, I want to delete my idea, so that I can remove it if I no longer want it on the board.

| ID | Given | When | Then |
|---|---|---|---|
| AC-020 | a user is logged in and is the author of an idea | they confirm deletion of that idea | the idea and its upvotes are removed and it no longer appears in the public list |
| AC-021 | a user is logged in but is not the author of an idea | they attempt to delete that idea | the deletion is refused |

## EPIC-004: Upvoting Ideas

Logged-in users can upvote ideas. Each user may cast at most one upvote per idea, and can toggle that upvote off. There are no downvotes. Voting requires being logged in.

Assumption: Only upvotes exist; there is no downvote. A user can remove (toggle off) their own upvote. Users cannot vote unless logged in and cannot vote twice on the same idea.

### US-009: Upvote an idea

**Priority:** critical

> As a logged-in user, I want to upvote an idea, so that I can show support for ideas I like and influence their ranking.

| ID | Given | When | Then |
|---|---|---|---|
| AC-022 | a logged-in user has not yet upvoted a given idea | they upvote it | the idea's upvote count increases by one, the user's upvote is recorded, and the idea's position in the ranked list updates accordingly |
| AC-023 | a logged-in user has already upvoted a given idea | they attempt to upvote the same idea again | no additional vote is recorded and the upvote count does not increase beyond one for that user |
| AC-024 | a visitor is not logged in | they attempt to upvote an idea | the vote is refused and they are prompted to log in or register |

### US-010: Toggle my upvote off

**Priority:** high

> As a logged-in user who has upvoted an idea, I want to remove my upvote, so that I can change my mind and withdraw my support.

| ID | Given | When | Then |
|---|---|---|---|
| AC-025 | a logged-in user has an active upvote on an idea | they toggle their upvote off | the idea's upvote count decreases by one, the user's upvote is removed, and the user is then able to upvote the idea again later |

## EPIC-005: Admin Moderation

A designated admin can review and remove any idea on the public board and manage abusive users. The admin role is granted through configuration or a seed, not through self-service.

Assumption: The admin role is assigned via configuration/seed rather than a self-service upgrade. The admin tooling is a simple view to see and remove ideas and to deactivate abusive users. There is no public flag/report workflow in this MVP. Any admin credential is set through configuration using a placeholder such as <set-at-first-login>, never a real value.

### US-011: Admin role assigned via configuration

**Priority:** high

> As a operator of the board, I want the admin role to be granted through configuration or a seed, so that there is a trusted moderator without exposing a self-service way to become admin.

| ID | Given | When | Then |
|---|---|---|---|
| AC-026 | the system is being set up | an account is designated as admin through configuration or seed data, with any credential supplied as a placeholder such as <set-at-first-login> | that account gains admin privileges and ordinary users have no option to grant themselves the admin role |

### US-012: Admin reviews and removes any idea

**Priority:** high

> As a designated admin, I want to view all ideas and remove any that are inappropriate, so that I can keep the public board free of abusive or unwanted content.

| ID | Given | When | Then |
|---|---|---|---|
| AC-027 | an admin is logged in | they open the admin view | they can see the ideas on the board regardless of author |
| AC-028 | an admin is logged in and viewing an idea they did not author | they remove that idea | the idea and its upvotes are removed and it no longer appears in the public list |
| AC-029 | a non-admin user is logged in | they attempt to access the admin view or remove an idea they did not author | the action is refused |

### US-013: Admin manages abusive users

**Priority:** medium

> As a designated admin, I want to deactivate an abusive user's account, so that I can stop repeat abuse of the board.

| ID | Given | When | Then |
|---|---|---|---|
| AC-030 | an admin is logged in and identifies an abusive user | they deactivate that user's account | the user can no longer log in and their existing sessions are ended so they cannot continue to post or vote |
| AC-031 | a non-admin user is logged in | they attempt to deactivate another user's account | the action is refused |
<!-- sdlc:auto:end epics -->
