<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-11-27

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- MySQL
- SQLite

## Decision Outcome

Chosen option: PostgreSQL 16, because Approved stack. The data is relational (users, ideas, votes) and a UNIQUE(user_id, idea_id) constraint enforces one vote per user per idea even under concurrent clicks (NFR-008); ranking by vote count is trivial.

## Consequences

Needs a running server versus embedded SQLite, but RDS makes it managed and cheap.
<!-- sdlc:auto:end adr -->