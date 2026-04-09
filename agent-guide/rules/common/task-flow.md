# Task Flow

## Implementation Order (Clean Architecture)

Always follow this layer-by-layer approach:

1. **Define entities** — Create Drizzle table definitions in `src/dal/entities/`.
2. **Create repositories** — Implement CRUD operations in `src/dal/repositories/`.
3. **Write use-cases** — Implement business logic in `src/use-cases/`. Test in isolation with mocked repositories.
4. **Build API routes** — Create HTTP handlers in `src/app/api/`. Validate input, call use-case, return response.
5. **Build UI** — Create forms and pages in `src/app/`. Call API routes via HTTP.

## Key principles

- **Entities** are data only. No logic.
- **Repositories** are CRUD only. No filtering, no logic.
- **Use-cases** contain all business logic and coordinate repositories.
- **API routes** are adapters only. They don't contain business logic.
- **Test use-cases in isolation** by mocking repositories.
- **All validation** happens in API routes (Zod) or use-cases (business rules).
