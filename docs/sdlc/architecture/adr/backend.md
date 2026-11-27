<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-11-27

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Flask
- Express

## Decision Outcome

Chosen option: FastAPI 0.115, because Approved stack. Covers register/login/logout, idea CRUD with ownership, and vote toggling with low overhead; Pydantic validation enforces email and length rules, and dependencies enforce auth, ownership and admin checks.

## Consequences

Async stack is more than this traffic strictly needs, but it integrates cleanly with PostgreSQL and keeps the design simple.
<!-- sdlc:auto:end adr -->