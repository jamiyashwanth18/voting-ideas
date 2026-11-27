# Deployment Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start how-it-deploys -->
Pushes to `main` run `.github/workflows/deploy.yml`, which builds the API image (if there is a backend) and deploys the SPA to AWS Amplify. Commits touching only `docs/sdlc/**` don't deploy. Deployments can also be started from the platform's Deployment tab.
<!-- sdlc:auto:end how-it-deploys -->

<!-- sdlc:auto:start environments -->
| Name | Service | Runtime | Scaling | Environment |
|---|---|---|---|---|
| SPA Host | React static site (S3 + CloudFront) | Static assets | CDN-served, effectively flat cost | dev |
| API Service | FastAPI on AWS App Runner (or ECS Fargate) | Python 3.12 / Uvicorn | 1 small instance, autoscale to a few for hundreds of users | dev |
| Database | Amazon RDS for PostgreSQL 16 | PostgreSQL 16 managed | Single small instance (db.t4g.micro), vertical if needed | dev |
<!-- sdlc:auto:end environments -->

<!-- sdlc:auto:start live -->
_Not deployed yet._
<!-- sdlc:auto:end live -->

<!-- sdlc:auto:start topology -->
```mermaid
graph LR
  n_SPA_Host["SPA Host<br/>React static site (S3 + CloudFront)"]
  n_API_Service["API Service<br/>FastAPI on AWS App Runner (or ECS Fargate)"]
  n_Database["Database<br/>Amazon RDS for PostgreSQL 16"]
  n_SPA_Host -->|"HTTPS"| n_API_Service
  n_API_Service -->|"PostgreSQL/TLS"| n_Database
```
<!-- sdlc:auto:end topology -->
