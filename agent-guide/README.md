# Agent Guide

This folder contains the simplified agent workflow for the `freelancer-manager` repository.
It is an explicit, repo-specific companion to the existing codebase.

Structure:
- `agents/` — role definitions for planner, reviewer, TDD, and security.
- `skills/` — reusable workflow templates for common agent tasks.
- `rules/common/` — baseline conventions for task flow, code quality, and review.
- `hooks/` — conceptual hook automation for lifecycle checks.
- `project-structure.md` — maps the agent workflow to the actual repo layout.

How to use this guide:
- Read `AGENT_BASELINE.md` first to understand the agent workflow.
- Use `project-structure.md` to find the right source and config files in this repo.
- Use `agents/` when you want to delegate a role or keep a task scoped.
- Use `skills/` when you want a repeatable workflow prompt.
- Use `rules/common/` to keep task planning and code review consistent.

Recommended support files for this repo:
- `package.json` scripts for dev, build, lint, and database commands.
- `src/app/` for UI and page-level work.
- `drizzle.config.ts` and `src/dal/` for database schema and repositories.
- `next.config.ts`, `postcss.config.mjs`, and `.env` files for runtime configuration.

This guide is intentionally lightweight. Add more project-specific guidance under `agent-guide/` only when there is a real workflow need.
