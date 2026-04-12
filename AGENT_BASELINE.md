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

## MANDATORY: Planning Before Code

**This is a non-negotiable rule for every implementation task.**

**NO CODE CAN BE WRITTEN BEFORE PLANNING IS COMPLETE AND APPROVED.**

1. **Read AGENT_PLANNER.md** immediately when you receive a task
2. **Execute the 4-phase planning process** (Planning → Self-Validation → Present → User Review)
3. **Complete all 8 planning steps** (feature → entities → types → repositories → use-cases → API → UI → files)
4. **Perform self-validation internally** (validate checklist, ensure no violations, confirm architecture compliance)
5. **Revise plan if self-validation fails** (do not present incomplete plans)
6. **Present the FINAL validated plan** to the user clearly and structured
7. **Wait for explicit user approval** before writing any code
8. **Refuse to write code** if planning is incomplete, self-validation failed, or user approval is not received

This rule is absolute. Every agent session starts here.

---

## MANDATORY: Self-Review After Code

**This is a non-negotiable rule for every implementation task.**

**NO CODE CAN BE DELIVERED WITHOUT SELF-REVIEW AND FIXES.**

1. **Read SELF_REVIEW.md** immediately after writing code
2. **Execute the 5-phase self-review process** (Architecture → Plan Consistency → Code Quality → Error Handling → Minimalism)
3. **Fix ALL detected issues immediately** (auto-fix rule)
4. **Re-review after fixes** until no issues remain
5. **Only after review passes** deliver the final code
6. **Refuse to deliver code** with known issues or violations

This rule is absolute. Every implementation ends here.

---

## Recommended task flow (after plan approval)

1. Create entities and types in order (entities → types)
2. Build repositories using only CRUD operations
3. Write use-cases with full business logic and unit tests (mock repositories)
4. Add API routes (thin adapters calling use-cases)
5. Build UI components (calling API routes)
6. Validate against Architecture Enforcement Checklist (PROJECT_BRAIN.md Section 10)
7. Run `npm run lint` and `npm run typecheck`
8. Final verification before completion

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
