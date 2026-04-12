# PROJECT_BRAIN.md

**This is the authoritative source of truth for the freelancer-manager architecture.**
**Read this first. Everything else references this.**

---

## 1. Project Overview

- **Type**: Next.js 16+ application with App Router under `src/app/`
- **Database**: PostgreSQL with Drizzle ORM for migrations and queries
- **Style & Lint**: Biome for formatting and linting
- **Architecture**: Clean architecture with strict layer separation
- **Main entry**: `src/app/page.tsx`

Commands live in `package.json`. Key ones: `dev`, `build`, `lint`, `lint:fix`, `typecheck`, `db:start`, `db:reset`, `db:migrate`, `db:push`.

---

## 2. Architecture Layers (the core constraint)

**This project enforces clean architecture.**
**Each layer has ONE responsibility. Violations break the system.**

### Layer 1: HTTP Adapter — `src/app/api/`

**Responsibility**: Translate HTTP into function calls.

- Parse request JSON
- Validate input with Zod
- Call a use-case function
- Catch errors and return HTTP responses
- **NO business logic. NO database queries. NO filtering.**

**Example**: POST `/api/orders` → validate with Zod → call `CreateOrderUseCase.execute()` → return 201 or 400.

### Layer 2: Use-Cases (Business Logic) — `src/use-cases/`

**Responsibility**: Implement business rules and coordinate data access.

- Validate domain rules (e.g., "product must exist", "user must have balance")
- Call repositories to fetch/write data
- Throw `DomainError` for business rule violations (with user-friendly messages)
- Return domain objects
- **NO HTTP, NO database queries. Testable in isolation.**

**Example**: `CreateOrderUseCase` validates products exist, checks stock, calculates totals, calls repositories.

### Layer 3: Repositories — `src/dal/repositories/`

**Responsibility**: CRUD operations only.

- One repository per entity (e.g., `orderRepository.ts`, `productRepository.ts`)
- Simple methods: `create()`, `findById()`, `findAll()`, `update()`, `delete()`
- **NO filtering logic, NO calculations, NO business rules.**

**Example**: `orderRepository.create({ userId, totalPrice, status })` inserts and returns the row.

### Layer 4: Entities (Schema) — `src/dal/entities/`

**Responsibility**: Table definitions.

- Drizzle `pgTable()` definitions only
- Fields, relationships, constraints
- **NO computed properties, NO logic.**

**Example**: `export const orders = pgTable("orders", { id, userId, totalPrice, status, createdAt })`

### Layer 5: Types — `src/dal/types/`

**Responsibility**: Shared interfaces, enums, type definitions.

- `OrderStatus` enum (PENDING, PAID, SHIPPED)
- `Order` interface, `CreateOrderRequest` interface
- Shared across use-cases and repositories

### Supporting Layers

- **`src/lib/`**: Utilities (logger, helpers). No business logic.
- **`src/app/`**: UI pages and components. Call API routes via HTTP.
- **`src/integrations/`**: External API wrappers.
- **`src/middleware/`**: Request hooks.

---

## 3. Data Flow (Request to Database)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS FORM (src/app/orders/create/page.tsx)       │
│    POST /api/orders { userId, items: [{productId, qty}] }   │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│ 2. API ROUTE (src/app/api/orders/route.ts)                  │
│    • Parse JSON → body = await req.json()                    │
│    • Validate → createOrderSchema.parse(body)                │
│    • Call use-case → await createOrderUseCase.execute(input) │
│    • Return 201 { orderId } or 400 { error }                │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│ 3. USE-CASE (src/use-cases/CreateOrderUseCase.ts)           │
│    • Fetch products → await productRepository.findById()      │
│    • Validate rules → if (!product) throw DomainError()       │
│    • Calculate total → sum(item.qty * product.price)         │
│    • Call repositories:                                       │
│      └─ order = await orderRepository.create()               │
│      └─ await orderItemRepository.createBatch()              │
│    • Return order object                                      │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│ 4. REPOSITORIES (src/dal/repositories/)                      │
│    • orderRepository.create() → INSERT INTO orders VALUES...  │
│    • productRepository.findById() → SELECT * FROM products... │
│    • orderItemRepository.createBatch() → multi-row INSERT     │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│ 5. DATABASE (PostgreSQL via Drizzle)                        │
│    • Inserts/queries executed                                │
│    • Constraints enforced (FK, PK, unique)                   │
└──────────────────────────────────────────────────────────────┘
```

**Key principle**: Data flows UP the stack. Use-cases call repositories, API routes call use-cases. Never skip layers.

---

## 4. Strict Rules (DO and DON'T)

### **DO — Always**

1. **DO create a use-case for every business operation**, even simple ones.
   - Reason: Centralizes logic, enables testing, enables reuse (CLI, webhook, scheduler).

2. **DO validate input in API routes** with Zod.
   - Validates HTTP shape before business logic sees it.

3. **DO inject dependencies** into use-cases.
   - Pass repositories as constructor parameters. Enables testing with mocks.

4. **DO throw `DomainError`** in use-cases with user-friendly messages.
   - Example: `throw new DomainError("Insufficient stock")`

5. **DO map errors to HTTP codes** in API routes.
   - `DomainError` → 400 Bad Request
   - `NotFoundError` → 404 Not Found
   - Unexpected errors → 500 Internal Server Error
   - Always log the real error, return generic message to client.

6. **DO keep repositories simple CRUD**.
   - One method = one intention. `create()`, `findById()`, `update()`, `delete()`, `findAll()`.

7. **DO test use-cases in isolation** by mocking repositories.
   - No HTTP, no database in unit tests.

### **DON'T — Never**

1. **DON'T put business logic in API routes.**
   - Routes are adapters only: parse → validate → call → respond.
   - If you're tempted to add an `if` statement, it belongs in a use-case.

2. **DON'T call repositories directly from UI.**
   - All data access goes through API routes → use-cases → repositories.
   - This enforces authentication, validation, and business rules.

3. **DON'T mix database queries with business rules in repositories.**
   - Repositories: pure data access.
   - Business rules: use-cases.

4. **DON'T create a repository without a corresponding entity.**
   - Every repository has a matching `pgTable()` definition.

5. **DON'T expose database errors to the client.**
   - Catch and log the error. Return: `{ error: "Internal server error" }` with status 500.
   - Never return: `{ error: "Column 'user_id' not found in table 'orders'" }`

6. **DON'T add logic to entity definitions.**
   - `pgTable()` is schema only. No computed properties, no methods.

7. **DON'T use global singletons for repositories.**
   - Inject them as dependencies. Enables testing and isolation.

---

## 5. Feature Implementation Guide

**Follow this order exactly. Do not skip steps.**

### Step 1: Plan

- Identify what data this feature needs.
- List all business rules (validation, constraints, side effects).
- Identify which existing repositories are affected or need creation.

Example: "Create order with products"

- Data: orders table, order_items table, products table
- Rules: product must exist, product must have stock
- Existing: productRepository; New: orderRepository, orderItemRepository

### Step 2: Define Entities

- Create table definitions in `src/dal/entities/`
- Add one file per entity (e.g., `order.ts`, `order-item.ts`)
- Use `createTable()` helper from `src/dal/entities/table.ts`

```
export const orders = createTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
```

### Step 3: Create Types

- Create interfaces and enums in `src/dal/types/`
- One file per feature (e.g., `order.ts`)

```
export enum OrderStatus { PENDING, PAID, SHIPPED }
export interface Order { id: number; userId: number; totalPrice: number; status: OrderStatus }
export interface CreateOrderRequest { userId: number; items: Array<{productId, quantity}> }
```

### Step 4: Build Repositories

- Create one file per entity in `src/dal/repositories/`
- Implement CRUD methods only
- Return database row or throw database errors

```
export class OrderRepository {
  async create(data: { userId, totalPrice, status }) { /* INSERT */ }
  async findById(id: number) { /* SELECT WHERE id */ }
  async update(id: number, data: Partial<Order>) { /* UPDATE */ }
}
```

### Step 5: Write Use-Cases

- Create one file per business operation in `src/use-cases/`
- Inject repositories as constructor params
- Call repositories, validate rules, throw DomainError
- Write tests here (mock repositories)

```
export class CreateOrderUseCase {
  constructor(private orderRepo, private productRepo, private itemRepo) {}

  async execute(input: CreateOrderRequest) {
    // Validate: products exist
    const products = await Promise.all(...)
    if (!products[0]) throw new DomainError("Product not found")

    // Calculate
    const total = ...

    // Create
    const order = await this.orderRepo.create({ userId: input.userId, totalPrice: total, status: "PENDING" })
    await this.itemRepo.createBatch([...])

    return order
  }
}
```

### Step 6: Build API Routes

- Create route handlers in `src/app/api/{resource}/route.ts`
- Validate input, call use-case, handle errors, return response

```
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = createOrderSchema.parse(body)

    const order = await createOrderUseCase.execute(input)

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    logger.error("Failed to create order", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### Step 7: Build UI

- Create forms/pages in `src/app/{resource}/`
- Call API routes via HTTP
- Display results

```
export default function CreateOrderPage() {
  const [items, setItems] = useState([])

  const handleSubmit = async () => {
    const response = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ userId: 1, items })
    })
    const data = await response.json()
    // display result
  }

  return <form ...>
}
```

### Step 8: Test

- Unit test use-cases (mock repositories)
- Integration test API routes (mock use-cases or real DB)
- E2E test UI (real server)

---

## 6. Folder Responsibilities (src/)

| Folder                  | Purpose                                     | Example files                                       |
| ----------------------- | ------------------------------------------- | --------------------------------------------------- |
| `src/app/`              | UI pages, layout. Next.js App Router.       | `page.tsx`, `layout.tsx`, `orders/create/page.tsx`  |
| `src/app/api/`          | HTTP route handlers. **No logic.**          | `api/orders/route.ts`, `api/products/[id]/route.ts` |
| `src/use-cases/`        | Business logic, coordination. **Testable.** | `CreateOrderUseCase.ts`, `CancelOrderUseCase.ts`    |
| `src/dal/entities/`     | Drizzle table definitions. **Schema only.** | `order.ts`, `product.ts`, `user.ts`                 |
| `src/dal/repositories/` | CRUD operations. **No logic.**              | `orderRepository.ts`, `productRepository.ts`        |
| `src/dal/types/`        | Interfaces, enums, types. Shared.           | `order.ts`, `product.ts`                            |
| `src/dal/database/`     | Schema exports, env config.                 | `schema.ts`, `data/env/server.ts`                   |
| `src/dal/seed/`         | Database seeding scripts.                   | `cli.ts` for `npm run seed`                         |
| `src/lib/`              | Utilities, helpers. **No business logic.**  | `logger.ts`                                         |
| `src/middleware/`       | Request hooks.                              | (empty until needed)                                |
| `src/features/`         | Future: group related use-cases.            | (empty until repo grows)                            |
| `src/integrations/`     | External API wrappers.                      | (empty until needed)                                |
| `src/tests/`            | Tests organized by layer.                   | `use-cases/`, `repositories/`, `api/`               |
| `src/md/`               | Internal docs.                              | Project architecture notes                          |

---

## 7. Mental Model

**Think of the application as a series of independent, testable steps:**

1. **HTTP Request arrives** — API route receives it
2. **Input Validation** — Zod ensures it has the right shape
3. **Business Logic** — Use-case enforces domain rules (has dependencies, fields exist, etc.)
4. **Data Access** — Repository performs CRUD on database
5. **Response** — API route returns HTTP response to client

**Each step has ONE responsibility. Each can be tested independently.**

### Key concepts:

- **Use-cases are the core.** They contain the "intelligence" of the system. They are testable without HTTP or DB.
- **Repositories are boring.** They are simple CRUD. No intelligence.
- **API routes are thin.** They translate HTTP to use-case calls.
- **Entities are dumb.** They are pure schema.
- **Types are shared.** They are the contract between layers.

### Testing pyramid:

```
            /\
           /  \  E2E (UI → API → DB)
          /────\
         /      \  Integration (API → Use-case → mocked repos)
        /────────\
       /          \ Unit (Use-case → mocked repos)
      /____________\
```

Most tests are at the bottom (unit test use-cases). Few at the top (E2E).

### When confused: Ask "which layer?"

- "Where does X go?" — Identify if it's HTTP (API route), business rule (use-case), or data (repository).
- "Why can't I do Y?" — Check the DO/DON'T rules for that layer.
- "How do I test Z?" — Use-cases: mock repositories. API routes: mock use-cases. Repositories: real DB or test DB.

---

## 8. Quick Reference

### Common paths:

| Task               | Files to touch                        |
| ------------------ | ------------------------------------- |
| Add a new table    | `src/dal/entities/`, `src/dal/types/` |
| Add a new query    | `src/dal/repositories/`               |
| Add business logic | `src/use-cases/`                      |
| Add an endpoint    | `src/app/api/` + use-case             |
| Add a page         | `src/app/`                            |
| Add a utility      | `src/lib/`                            |

### Common errors:

| Error                                        | Fix                                      |
| -------------------------------------------- | ---------------------------------------- |
| "How do I access the DB from this page?"     | Don't. Create an API route instead.      |
| "Should I put validation in the repository?" | No. Put it in the use-case or API route. |
| "Can I use global state for repositories?"   | No. Inject as dependencies.              |
| "My use-case is complex."                    | Split it. One use-case per operation.    |
| "The API route has `if` statements."         | Move the logic to a use-case.            |

### Key files:

- `AGENT_BASELINE.md` — Tasks and workflow
- `agent-guide/project-structure.md` — Folder and file reference
- `agent-guide/rules/common/task-flow.md` — Implementation order
- `package.json` — Commands
- `drizzle.config.ts` — DB config
- `src/dal/database/data/env/server.ts` — Environment validation

---

## 9. Before You Start Coding

1. Read this file completely.
2. Go to `agent-guide/agents/planner.md` and plan your feature.
3. Identify entities, repositories, use-cases, API routes, UI.
4. Follow the implementation order in Section 5 exactly.
5. Write tests as you go (especially for use-cases).
6. Run `npm run lint` and `npm run typecheck` before submitting.

---

## 10. Architecture Enforcement Checklist

**REQUIRED: Use this checklist BEFORE completing any task.**

**If ANY item fails, the task is INCOMPLETE. Do not submit.**

### Layer Validation

- [ ] API routes contain NO business logic (only parsing, validation, calling use-case)
- [ ] Use-cases contain ALL business rules (validation, decisions, calculations)
- [ ] Repositories contain ONLY CRUD operations (create, findById, findAll, update, delete)
- [ ] No direct database access outside repositories
- [ ] UI does not call repositories directly (all data flows through API routes)
- [ ] Entities contain ONLY Drizzle schema definitions (no logic, no computed properties)

### Dependency Rules

- [ ] Use-cases receive repository dependencies via constructor injection
- [ ] No global imports of repositories (use dependency injection)
- [ ] No circular dependencies between layers

### Implementation Order

- [ ] Entities defined and exported from `src/dal/entities/`
- [ ] Types defined in `src/dal/types/`
- [ ] Repositories implemented in `src/dal/repositories/`
- [ ] Use-case implemented in `src/use-cases/` and unit tested with mocked repositories
- [ ] API route added in `src/app/api/`
- [ ] UI added in `src/app/` (last step only)

### Error Handling

- [ ] Use-cases throw `DomainError` for business rule violations with user-friendly messages
- [ ] Use-cases do NOT throw database errors (let them bubble, catch in API route)
- [ ] API routes catch all errors and map to HTTP status codes
- [ ] API routes log real errors, return generic messages to client
- [ ] No raw database errors exposed to client

### Testing

- [ ] Use-case unit tests exist and pass (mocked repositories)
- [ ] Use-case can run without HTTP or database
- [ ] API route tested separately (mocked use-case or real DB)

### Code Quality

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No `any` types in repositories or use-cases
- [ ] No `TODO` or `FIXME` comments left in code

### Final Validation

- [ ] Task matches feature requirements exactly
- [ ] No business logic in wrong layers
- [ ] All layers communicate through defined interfaces
- [ ] Code is consistent with existing patterns in the repo

---

## Common Violations (Wrong vs Right)

## If any of these patterns appear in your code, you MUST refactor before completion.

### 1. Business logic inside API route

**WRONG**

```ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const total = body.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const order = await orderRepository.create({ userId: body.userId, total });
  return NextResponse.json(order);
}
```

**RIGHT**

```ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = createOrderSchema.parse(body);
  const order = await createOrderUseCase.execute(input);
  return NextResponse.json(order, { status: 201 });
}
```

Short explanation: API routes must only parse, validate, and delegate.

### 2. Repository containing filtering or calculations

**WRONG**

```ts
export class ProductRepository {
  async findAvailableAndCalculateTotal(items) {
    const products = await db
      .select()
      .from(products)
      .where(
        eq(
          products.id,
          items.map((i) => i.productId),
        ),
      );
    return products.reduce(
      (sum, product) =>
        sum +
        product.price * items.find((i) => i.productId === product.id).quantity,
      0,
    );
  }
}
```

**RIGHT**

```ts
export class ProductRepository {
  async findById(id: number) {
    return db.select().from(products).where(eq(products.id, id)).get();
  }
}
```

Short explanation: repositories must only expose raw CRUD operations.

### 3. UI calling repository directly

**WRONG**

```tsx
import { productRepository } from "@/src/dal/repositories/productRepository";

export default function Page() {
  const products = productRepository.findAll();
  return <ProductList products={products} />;
}
```

**RIGHT**

```tsx
export default async function Page() {
  const res = await fetch("/api/products");
  const products = await res.json();
  return <ProductList products={products} />;
}
```

Short explanation: UI must call API routes, not repositories.

### 4. Missing dependency injection in use-case

**WRONG**

```ts
import { orderRepository } from "@/src/dal/repositories/orderRepository";

export class CreateOrderUseCase {
  async execute(input) {
    return orderRepository.create(input);
  }
}
```

**RIGHT**

```ts
export class CreateOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(input) {
    return this.orderRepository.create(input);
  }
}
```

Short explanation: use-cases must receive repositories by injection for testability.

### 5. Throwing raw database errors to client

**WRONG**

```ts
try {
  const order = await createOrderUseCase.execute(input);
  return NextResponse.json(order);
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**RIGHT**

```ts
try {
  const order = await createOrderUseCase.execute(input);
  return NextResponse.json(order, { status: 201 });
} catch (error) {
  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  logger.error("Create order failed", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

Short explanation: map domain errors and hide raw DB details from clients.

---

**This is the law. Everything else is commentary.**
