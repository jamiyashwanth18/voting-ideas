# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `6b9f1b7` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Voting ideas is a generated full-stack application for a small idea-voting board (sign up, post ideas, upvote, list by votes). It is built from two independently generated halves in one repo: a Vite + React 19 SPA (`frontend/`) containing the fully approved, reviewed screens that currently run against seeded sample data, and a FastAPI 0.115 service (`backend/`) that, since no backend architecture was approved yet, only exposes a health check and an auth stub (login/me) backed by SQLAlchemy models, Alembic migrations, and a SQLite-by-default database that can be pointed at PostgreSQL 16 (the approved database) via `DATABASE_URL`.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for the Vite/React/Vitest/Playwright frontend tooling)
- Python 3.12 (matches backend/Dockerfile base image)
- pip
- PostgreSQL 16 (required for backend pytest per TESTING.md; SQLite is used by default otherwise)
- Docker and docker-compose (to run the Postgres service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository
2. Backend: cd backend && pip install -r requirements.txt
3. (Optional) Start a local Postgres instance: docker-compose up -d db (from the repo root)
4. Backend: run uvicorn app.main:app --reload to start the API (defaults to SQLite ./app.db unless DATABASE_URL is set)
5. Frontend: cd frontend && npm install
6. Frontend: npm run dev to start the Vite dev server against the seeded sample data
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `uvicorn app.main:app --reload` | Runs the FastAPI service locally with auto-reload (run from backend/, after installing requirements.txt) |
| frontend dev | `npm run dev` | Starts the Vite dev server for the React SPA (run from frontend/) |
| frontend build | `npm run build` | Bundles the frontend app with Vite; does not typecheck |
| frontend preview | `npm run preview` | Serves the production build locally |
| generate API client | `npm run gen:api` | Exports the backend's OpenAPI spec and regenerates frontend/src/api/schema.ts via openapi-typescript (run from frontend/) |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend` | FastAPI service: app code, Alembic migrations, tests, scripts |
| `backend/app` | Application package: main entrypoint, models, schemas, auth, database, seed, routers |
| `backend/alembic` | Alembic migration environment and versioned schema migrations |
| `backend/tests` | Unit and integration tests (pytest), including auth and health checks |
| `backend/scripts` | Utility scripts: exporting the OpenAPI spec and a smoke test |
| `frontend` | Vite + React SPA: approved screens, API client, styling, and tests |
| `frontend/src` | Application source: screens, shared lib (api/ui/icons/navigate), API client and schema |
| `frontend/e2e` | Playwright end-to-end acceptance specs and support helpers |
| `.github` | CI workflows, including the SonarQube scan |
| `.devcontainer` | Devcontainer configuration for a consistent development environment |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend request/response models are Pydantic 'ApiModel' subclasses so JSON uses camelCase while Python code uses snake_case (app/api_model.py)
- One FastAPI router per approved architecture component that owns endpoints (backend/app/routers/)
- Unimplemented routes return a typed StubResponse rather than an error, keeping the service startable and its OpenAPI document complete
- Database schema is managed exclusively through Alembic migrations (backend/alembic/versions/), never via create_all; the app runs migrations on startup
- Backend session handling is request-scoped via a get_db dependency, opening the DB connection only at request/startup time, not at import time
- Frontend screens live one module per approved screen; shared UI/icon vocabulary is centralized in src/lib/ui.tsx and src/lib/icons.tsx
- Frontend API calls go exclusively through the generated client (src/api/client.ts, src/api/schema.ts), not raw fetch
- Session token is stored in localStorage and sent as a bearer token ahead of the shared project bearer
- Linting/formatting: ESLint + Prettier on the frontend, Ruff (check and format) on the backend
- Test reports (JUnit XML) are written to fixed reports/junit/ paths for both frontend (Vitest/Playwright) and backend (pytest) so the platform can read results
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend tests | `pytest` | Runs backend unit/integration tests (requires PostgreSQL per TESTING.md); run from backend/ |
| backend lint | `ruff check .` | Lints backend Python code |
| backend format check | `ruff format .` | Formats backend Python code |
| frontend unit tests | `npm run test` | Runs Vitest component tests colocated with components |
| frontend e2e tests | `npm run test:e2e` | Runs Playwright acceptance tests; builds/serves the app and backend locally unless E2E_BASE_URL is set |
| install e2e browser | `npm run test:e2e:install` | Installs the Chromium browser Playwright needs |
| frontend lint | `npm run lint` | Runs ESLint over the frontend app |
| frontend typecheck | `npm run typecheck` | Runs tsc --noEmit to typecheck the frontend |
| frontend format check | `npm run format:check` | Checks Prettier formatting |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Backend pytest fails or behaves inconsistently | pytest requires PostgreSQL per TESTING.md; start it with docker-compose up -d db and set DATABASE_URL accordingly rather than relying on the SQLite default |
| Frontend calls to the backend are blocked by the browser (CORS) | Set the ALLOWED_ORIGINS environment variable (comma-separated) on the backend to include the frontend's origin; in development the backend already allows http://localhost:5173 and http://127.0.0.1:5173 by default |
| Backend fails to start with an error about alembic.ini being missing | Ensure alembic.ini and the alembic/ directory are present beside app/ (the Dockerfile copies both); do not remove them from the image or working directory |
| Playwright e2e run fails because Chromium is not installed | Run npm run test:e2e:install before npm run test:e2e |
| Frontend build succeeds but tsc fails separately | npm run build does not typecheck; run npm run typecheck to catch type errors before deployment |
| Session does not persist across reloads | The session token is stored in localStorage via src/lib/api.ts; check that the browser allows localStorage (not in private/incognito mode with storage disabled) |
<!-- sdlc:auto:end troubleshooting -->
