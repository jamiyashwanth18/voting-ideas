<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-11-27

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- Google Cloud
- Azure

## Decision Outcome

Chosen option: AWS, because Approved stack. S3+CloudFront for the SPA, App Runner/Fargate for the API, and managed RDS PostgreSQL run a hundreds-of-users board cheaply (NFR-011) with encryption at rest and in transit.

## Consequences

More service choices than a single PaaS, but keeps cost low and growth headroom available.
<!-- sdlc:auto:end adr -->