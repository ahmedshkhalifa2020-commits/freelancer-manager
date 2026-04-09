# Agent Baseline for freelancer-manager

This file defines how future chat and agent sessions should work with this repository.
It is built to follow the actual project layout and developer conventions in this Next.js app.

## Why this exists

- Provide a single workspace-native reference for planning, implementation, review, and verification.
- Make sure future sessions use the current repo structure (`src/`, `app/`, `package.json`, `db`, etc.).
- Keep the workflow small, actionable, and focused on the major requirements of this app.

## Project context

- This is a Next.js app with the App Router under `src/app/`.
- The repo uses `biome` for formatting and linting, and `drizzle-kit` for database migrations.
- The main app entrypoint is `src/app/page.tsx`.
- Local commands are defined in `package.json` and should be referenced for dev, build, lint, and DB tasks.

## Architecture: Clean Separation of Concerns

This project enforces **clean architecture**. Each layer has one responsibility:

- **`src/app/api/`** — HTTP adapter only. Parse request → validate → call use-case → return response.
- **`src/use-cases/`** — Business logic. Coordinate repositories, enforce business rules, handle domain errors.
- **`src/dal/repositories/`** — Data access only. CRUD operations on database via Drizzle. No logic.
- **`src/dal/entities/`** — Table definitions. Drizzle schema only.
- **`src/lib/`** — Shared utilities (logging, helpers). No business logic.

## Folder structure for agent instructions

- `agent-guide/agents/` — task-specific agent roles.
- `agent-guide/skills/` — reusable workflow templates.
- `agent-guide/rules/` — baseline project guidelines.
- `agent-guide/hooks/` — lifecycle and automation concepts.
- `agent-guide/project-structure.md` — maps this guide to the current repo.

## Recommended task flow

1. Use `planner` to break the request into small, testable work items and identify affected layers.
2. Use `tdd-guide` to define tests for use-cases before implementation.
3. Implement in order: entities → repositories → use-cases → API route → UI.
4. Use `code-reviewer` to validate correctness, clarity, and layer separation.
5. Use `security-review` when the change touches data, auth, or external inputs.
6. Confirm adherence to rules in `agent-guide/rules/common/` before finalizing.

## How to use this guide

- Read `agent-guide/README.md` first.
- Use `agent-guide/project-structure.md` to locate relevant files and scripts.
- Consult `agent-guide/agents/` for role guidance when delegating.
- Consult `agent-guide/skills/` for workflow templates and prompts.
- Follow `agent-guide/rules/common/` for consistent conventions.

## Strict DO and DON'T Rules

### DO:

- **DO create a use-case** for every business operation, even simple ones.
- **DO validate input in API routes** with Zod before calling use-cases.
- **DO inject dependencies** into use-cases (don't use global singletons).
- **DO throw domain errors in use-cases** with user-friendly messages.
- **DO map domain errors to HTTP status codes** in API routes (400 for business rules, 500 for system errors).
- **DO keep repositories as simple CRUD** — no filtering logic, no calculations.
- **DO test use-cases in isolation** by mocking repositories.

### DON'T:

- **DON'T put business logic in API routes.** Routes are adapters only.
- **DON'T call repositories directly from UI.** Always go through API routes.
- **DON'T mix database queries with business rules** in repositories.
- **DON'T create a repository without a corresponding entity definition.**
- **DON'T expose database errors to the client.** Catch, log, return generic message.
- **DON'T add logic to entity definitions** (Drizzle schemas are data only).

## Maintainer note

This layout is intentionally small and repo-specific. Add new agent roles, skills, rules, and project-specific hooks in the same `agent-guide/` structure if the project grows.
