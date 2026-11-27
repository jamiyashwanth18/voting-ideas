<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-11-27

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Svelte

## Decision Outcome

Chosen option: React 19, because Approved stack. Renders the interactive, live-resorting idea list well and serves one responsive codebase for phone and desktop widths (NFR-009). Built as a Vite SPA hosted on its own origin, storing the session token and sending it as a Bearer header.

## Consequences

A SPA needs client-side routing and token handling; acceptable for this small board and keeps the API stateless-per-request.
<!-- sdlc:auto:end adr -->