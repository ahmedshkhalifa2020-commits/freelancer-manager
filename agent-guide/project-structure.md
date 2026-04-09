# Project Structure Reference

This file describes the main folders, files, and scripts in the `freelancer-manager` repo.
It is intended to help agents and future sessions understand where to make changes.

## Key source areas (Clean Architecture)

**Request → API Route → Use-Case → Repository → Database**

- **`src/app/api/`** — HTTP handlers. Parse request, validate with Zod, call use-case, return JSON. **No business logic.**
- **`src/use-cases/`** — Business logic. Coordinate repositories, validate domain rules, throw DomainError. Testable without HTTP or DB.
- **`src/dal/repositories/`** — Data access layer. CRUD operations only. No filtering, no logic. One repo per entity.
- **`src/dal/entities/`** — Drizzle table definitions. Schema only.
- **`src/dal/types/`** — Domain types, enums, interfaces. Shared across use-cases and repositories.
- **`src/app/`** — Next.js App Router pages and layout entrypoints. UI components.
- **`src/lib/`** — Shared utilities (logging, helpers, env). No business logic.
- **`src/proxy.ts`** — project proxy or middleware entrypoint.
- **`src/features/`** — Future: feature-specific code if repo expands (grouping related use-cases).
- **`src/integrations/`** — External API helpers and wrappers.
- **`src/md/`** — Internal documentation and architecture notes.
- **`src/middleware/`** — Framework middleware and request hooks.
- **`src/tests/`** — Test files organized by use-case, repository, and API route.

## Important config files

- `package.json` — development, build, lint, format, typecheck, and database scripts.
- `next.config.ts` — Next.js configuration.
- `tsconfig.json` — TypeScript compiler configuration.
- `postcss.config.mjs` — PostCSS and Tailwind configuration.
- `drizzle.config.ts` — Drizzle ORM configuration.
- `biome.json` — Biome formatting and linting config.
- `.env`, `.env.example` — environment settings.

## Useful scripts

- `npm run dev` — start Next.js development server.
- `npm run build` — build the app for production.
- `npm run start` — run the production build.
- `npm run lint` — run Biome checks.
- `npm run format` — apply format changes.
- `npm run typecheck` — run TypeScript type checks.
- `npm run db:start` — start database services via Docker Compose.
- `npm run db:reset` — reset database containers.
- `npm run db:migrate` — run Drizzle migrations.
- `npm run seed` — run seed scripts.

## How to map tasks to files

**Example: "Create an order with products"**

1. **Define the data model**
   - `src/dal/entities/order.ts`, `order-item.ts` — table definitions
   - `src/dal/types/order.ts` — OrderStatus enum, Order interface

2. **Implement data access**
   - `src/dal/repositories/orderRepository.ts` — CRUD: create, findById, update, delete
   - `src/dal/repositories/orderItemRepository.ts` — batch insert/delete

3. **Implement business logic**
   - `src/use-cases/CreateOrderUseCase.ts` — validate products exist, check stock, calculate totals, call repositories

4. **Expose via HTTP**
   - `src/app/api/orders/route.ts` — POST handler: validate input → call use-case → return response

5. **Build the UI**
   - `src/app/orders/create/page.tsx` — form that POSTs to /api/orders

**Other task types:**

- Database migrations: `drizzle.config.ts` and seed scripts.
- Logging and helpers: `src/lib/`.
- Tests: `src/tests/` (mirrors use-case, repository, API structure).

## Layer Responsibility Reference

| Layer      | Responsibility               | Example                                                               |
| ---------- | ---------------------------- | --------------------------------------------------------------------- |
| API Route  | HTTP adapter only            | Parse request, validate with Zod, call `CreateOrderUseCase.execute()` |
| Use-Case   | Business logic, coordination | Validate products exist, check stock, call repositories in order      |
| Repository | CRUD only                    | `orderRepository.create()`, `findById()`, `update()`, `delete()`      |
| Entity     | Schema definition            | Drizzle `pgTable("orders", {...})`                                    |

## Agent guidance

- Start with `AGENT_BASELINE.md` for workflow rules and architecture.
- Use `agent-guide/agents/planner.md` to scope work and identify affected layers.
- Use `agent-guide/skills/plan-workflow/SKILL.md` for planning prompts.
- Use `agent-guide/agents/tdd-guide.md` to define tests for use-cases first.
- Use `agent-guide/agents/code-reviewer.md` to verify clean architecture is followed.
- Use `agent-guide/agents/security-reviewer.md` when use-cases handle sensitive data.
