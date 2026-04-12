# AGENT_PLANNER.md

**MANDATORY RULE: NO CODE BEFORE PLAN**

This document defines the strict "Plan → Self-Validate → Present → User Review → Code" workflow for every task.

Before any code is written, line-by-line planning must be complete, self-validated, and user-approved.

---

## The Hard Rule

```
IF planning is not finished
  OR self-validation is not passed
  OR user approval is not received
  THEN refuse to write any code
  AND stop the task
  AND ask for plan approval before proceeding
```

This rule is non-negotiable. Every agent session must execute this planner before implementation.

---

## When to Start Planning

Planning begins immediately after understanding the task. It happens BEFORE touching any code files.

**Exception**: Do not plan for trivial tasks (fixing a typo, renaming a variable). Plan everything else.

---

## Phase 1: Planning

Complete the full planning steps (feature → entities → repositories → use-cases → API → UI → files)

### Step 1: Feature Understanding

**Goal**: Define exactly what needs to be built.

Questions to answer:

- What is this feature supposed to do?
- Who uses it?
- What is the expected input and output?
- Are there any special constraints (performance, security, offline support)?
- Does this depend on any existing features?

**Output**: 2-3 sentence feature summary.

Example:

> "Create an order from a list of products. User submits { userId, items: [{productId, qty}] }. The system validates that products exist and have stock, calculates total price, and returns the order ID. Depends on existing product and user tables."

### Step 2: Data Entity Planning

**Goal**: Identify ALL database tables affected or created.

For each table:

- Name (e.g., `orders`, `order_items`)
- Purpose (what does it store?)
- Key fields (id, userId, totalPrice, status, timestamps)
- Relationships (foreign keys, unique constraints)
- Which existing table it references (if any)

**Output**: List of entities with field names and types.

Example:

```
Entities:
- orders (NEW)
  - id: INT PRIMARY KEY
  - userId: INT FOREIGN KEY (references users.id)
  - totalPrice: DECIMAL(10, 2)
  - status: TEXT (ENUM: PENDING, PAID, SHIPPED)
  - createdAt: TIMESTAMP DEFAULT NOW

- order_items (NEW)
  - id: INT PRIMARY KEY
  - orderId: INT FOREIGN KEY (references orders.id)
  - productId: INT FOREIGN KEY (references products.id)
  - quantity: INT
  - price: DECIMAL(10, 2)
  - createdAt: TIMESTAMP DEFAULT NOW
```

### Step 3: Type Definitions Planning

**Goal**: Define TypeScript types and enums.

For each entity or operation:

- Interface for the entity (TypeScript type)
- Enum for status fields (if any)
- Interface for input (CreateOrderRequest)
- Interface for output (Order response)

**Output**: List of types to create in `src/dal/types/`.

Example:

```
Types (in src/dal/types/order.ts):
- OrderStatus enum: PENDING, PAID, SHIPPED
- Order interface: { id, userId, totalPrice, status, createdAt }
- CreateOrderRequest interface: { userId, items: [{productId, quantity}] }
- CreateOrderResponse interface: { id, userId, totalPrice }
```

### Step 4: Repository Planning

**Goal**: Identify CRUD operations needed.

For each repository:

- Name (e.g., `orderRepository`, `productRepository`)
- List methods (create, findById, findAll, update, delete)
- Mark which are NEW and which are EXISTING
- Each method does ONE thing only (pure CRUD, no logic)

**Output**: List of repositories and their CRUD methods.

Example:

```
Repositories:
- orderRepository (NEW)
  - create(data: { userId, totalPrice, status }): Promise<Order>
  - findById(id: number): Promise<Order | null>
  - findAll(): Promise<Order[]>
  - update(id: number, data: Partial<Order>): Promise<Order>
  - delete(id: number): Promise<void>

- orderItemRepository (NEW)
  - create(data: { orderId, productId, quantity, price }): Promise<OrderItem>
  - createBatch(items: OrderItem[]): Promise<OrderItem[]>
  - deleteByOrderId(orderId: number): Promise<void>

- productRepository (EXISTING)
  - findById(id: number): Promise<Product | null>
  - (may need new methods, list them)
```

### Step 5: Use-Case Planning

**Goal**: Identify business operations and their logic.

For each use-case:

- Name (e.g., CreateOrderUseCase)
- Input (what does it receive?)
- Business rules (validation, constraints)
- Output (what does it return?)
- Dependencies (which repositories does it inject?)
- Errors (what DomainErrors can it throw?)

**Output**: List of use-cases with logic outlined.

Example:

```
Use-Cases:
- CreateOrderUseCase
  Input: { userId, items: [{productId, quantity}] }
  Dependencies: orderRepository, orderItemRepository, productRepository
  Logic:
    1. Validate: userId must exist (check in repository or accept it)
    2. Validate: For each item, find product
       → If product not found, throw DomainError("Product not found")
    3. Check stock: For each item, check product.stock >= quantity
       → If insufficient, throw DomainError("Insufficient stock for X")
    4. Calculate: total = sum(item.qty * product.price)
    5. Create order: call orderRepository.create({ userId, total, status: "PENDING" })
    6. Batch create items: call orderItemRepository.createBatch(items with orderId)
    7. Return: { id: order.id, userId, totalPrice, status, createdAt }
  Errors:
    - DomainError("Product not found"): 404
    - DomainError("Insufficient stock"): 400
    - (unexpected errors): 500
```

### Step 6: API Endpoint Planning

**Goal**: Define HTTP routes and their behavior.

For each endpoint:

- HTTP method (POST, GET, PATCH, DELETE)
- Route path (e.g., POST /api/orders)
- Input schema (Zod schema name)
- Output (what is returned on success and error?)
- Which use-case it calls
- Error handling strategy

**Output**: List of endpoints with request/response shapes.

Example:

```
API Endpoints:
- POST /api/orders
  Input: { userId: number, items: [{productId: number, quantity: number}] }
  Validation: createOrderSchema.parse(body)
  Calls: await createOrderUseCase.execute(input)
  Output (201): { id, userId, totalPrice, status, createdAt }
  Error (400): { error: "Product not found" | "Insufficient stock" }
  Error (500): { error: "Internal server error" }
```

### Step 7: UI Component Planning

**Goal**: Define what pages/components are needed.

For each page or component:

- Name (e.g., CreateOrderPage, OrderList)
- Purpose (what does the user see?)
- Form fields (if it's a form)
- API call (which route does it hit?)
- Display logic (what happens on success/error?)

**Output**: List of UI components to create.

Example:

```
UI Components:
- CreateOrderPage (src/app/orders/create/page.tsx)
  Purpose: User can select products and quantities, submit order
  Form fields: productId, quantity (repeatable)
  API call: POST /api/orders { userId: 1, items: [...] }
  On success: Show "Order created!" and order ID, redirect to /orders/{id}
  On error: Show error message

- OrderDetails (src/app/orders/[id]/page.tsx)
  Purpose: Show order summary with items
  API call: GET /api/orders/{id}
  Display: Order header (date, status, total), line items (product, qty, price)
```

### Step 8: File Structure Plan

**Goal**: List all files to create or modify.

Example:

```
Files to Create:
- src/dal/entities/order.ts
- src/dal/entities/order-item.ts
- src/dal/types/order.ts
- src/dal/repositories/orderRepository.ts
- src/dal/repositories/orderItemRepository.ts (use batch create)
- src/use-cases/CreateOrderUseCase.ts
- src/use-cases/CreateOrderUseCase.test.ts (unit tests)
- src/app/api/orders/route.ts
- src/app/orders/create/page.tsx
- src/app/orders/[id]/page.tsx

Files to Modify:
- src/dal/database/schema.ts (export new entities)
- src/dal/entities/index.ts (export new entities)
- tests/use-cases/... (add test file)
```

---

## Phase 2: Self-Validation (MANDATORY)

Before presenting the plan, the agent MUST:

- Validate all checklist items internally
- Ensure:
  - All entities are defined
  - All use-cases are present
  - No architecture violations
  - File structure matches PROJECT_BRAIN.md

**Rule**: If any validation fails → the agent MUST revise the plan before presenting it.

---

## Phase 3: Present Plan

- Present the FINAL validated plan clearly
- The plan must be clean, structured, and ready for implementation

---

## Phase 4: User Review (MANDATORY)

- The agent MUST wait for user approval before writing any code
- No code is allowed before approval

---

## Explicit Rules

- NO CODE BEFORE:
  - Planning is complete
  - Self-validation is passed
  - User approval is received

---

## File Example (Full Plan)

This is what a complete plan looks like (before coding):

```
# Feature: Create Order

## 1. Feature Understanding
User submits a form with selected products and quantities.
System validates products exist, calculates total, and creates an order.
Returns order ID and status.

## 2. Data Entities
- orders table: id, userId, totalPrice, status, createdAt
- order_items table: id, orderId, productId, quantity, price

## 3. Types
- OrderStatus enum: PENDING, PAID, SHIPPED
- Order interface: {id, userId, totalPrice, status, createdAt}
- CreateOrderRequest: {userId, items: [{productId, quantity}]}

## 4. Repositories
- orderRepository (NEW): create, findById, findAll, update
- orderItemRepository (NEW): create, createBatch, deleteByOrderId
- productRepository (EXISTING): findById needs no changes

## 5. Use-Cases
- CreateOrderUseCase: validate products, check stock, calculate total, create rows, return order

## 6. API Endpoints
- POST /api/orders: accepts request, calls use-case, returns 201 or error

## 7. UI Components
- CreateOrderPage: form with product selector, submit to API
- OrderDetailsPage: display created order

## 8. Files
Create: entities, types, repositories, use-case, tests, API route, pages
Modify: schema.ts, index.ts
```

---

## Planning Validation Checklist

**BEFORE proceeding to code, answer YES to ALL of these:**

- [ ] Feature summary is clear in 1-2 sentences
- [ ] All data entities are identified (new and existing)
- [ ] All fields in entities have names and types
- [ ] All relationships/foreign keys are defined
- [ ] TypeScript types match the entities
- [ ] All repository CRUD methods are listed
- [ ] At least one use-case is defined with logic steps
- [ ] All business rules are explicit (validation, constraints)
- [ ] All DomainErrors that can be thrown are listed
- [ ] All API endpoints are defined (method, path, input, output)
- [ ] Error handling strategy is clear (which errors → which HTTP codes)
- [ ] All UI components are identified
- [ ] File structure is planned (which files created/modified)
- [ ] Total implementation scope is small (1-5 features or < 3 API endpoints)

**IF any checkbox is unchecked, the plan is INCOMPLETE. Stop and refine the plan.**

---

## Failure Conditions (When to Stop Planning)

Stop planning and ask for clarification if ANY of these occur:

1. **Scope explosion**: The plan requires > 5 new entities or > 3 use-cases
   - **Action**: Break it into smaller tasks
   - **Example**: "Create order" and "Manage order" are two separate tasks

2. **Unclear business rules**: You cannot write the logic because you don't understand the constraint
   - **Action**: Ask the user to clarify the rule
   - **Example**: "When should an order be marked PAID?" — needs definition

3. **Missing existing context**: The plan depends on something that doesn't exist and you can't create it
   - **Action**: Ask if this dependency should be created first
   - **Example**: "Is there a usersRepository?" — needs confirmation

4. **Circular dependencies**: Use-case A calls use-case B which calls use-case A
   - **Action**: Refactor the logic to break the cycle
   - **Example**: Create a shared helper instead of calling between use-cases

5. **Ambiguous UI flow**: You cannot design the page because the user journey is unclear
   - **Action**: Ask for user stories or wireframes
   - **Example**: "On success, does it redirect?" — needs decision

**IF any failure condition occurs, STOP PLANNING. Do not write code. Ask the user.**

---

## How to Communicate the Plan

Once planning is complete, present it in this format:

```markdown
# Task: [Feature Name]

## Plan Approved? (waiting for confirmation)

[Insert full plan here, using the 8 steps above]

---

## Implementation Steps

1. Create entities (entities/order.ts, entities/order-item.ts)
2. Define types (types/order.ts)
3. Build repositories (repositories/orderRepository.ts, orderItemRepository.ts)
4. Create use-case (use-cases/CreateOrderUseCase.ts) + unit tests
5. Add API route (app/api/orders/route.ts)
6. Create UI pages (app/orders/create/page.tsx, app/orders/[id]/page.tsx)
7. Run lint & typecheck
8. Validate against Architecture Enforcement Checklist (PROJECT_BRAIN.md Section 10)

Ready to code? Approve this plan first.
```

Wait for user to say "Approved" or request changes. Do not write code until approval.

---

## Integration with PROJECT_BRAIN.md

This planner enforces the architecture defined in PROJECT_BRAIN.md:

- **Step 2** (Data Entities) maps to PROJECT_BRAIN.md Section 2 Layer 4
- **Step 4** (Repositories) maps to PROJECT_BRAIN.md Section 2 Layer 3
- **Step 5** (Use-Cases) maps to PROJECT_BRAIN.md Section 2 Layer 2
- **Step 6** (API Endpoints) maps to PROJECT_BRAIN.md Section 2 Layer 1

The Architecture Enforcement Checklist in Step 8 directly references PROJECT_BRAIN.md Section 10.

No layer violations are allowed. Reject any plan that violates these rules.

---

## Validation Rules

Apply these rules WHILE planning:

1. **No business logic in API routes** (Layer 1 must be thin)
2. **No database queries outside repositories** (Layer 3 only)
3. **No use-case dependencies on UI** (unidirectional)
4. **All use-cases receive repositories via constructor** (dependency injection)
5. **All domain errors have user-friendly messages** (not tech jargon)
6. **All repositories are pure CRUD** (no logic)

If the plan violates any rule, reject it and ask for a revised plan.

---

## Summary

**The planner enforces this workflow:**

```
TASK RECEIVED
  ↓
START PLANNING (this document)
  ├─ Step 1: Feature Understanding
  ├─ Step 2: Data Entities
  ├─ Step 3: Types
  ├─ Step 4: Repositories
  ├─ Step 5: Use-Cases
  ├─ Step 6: API Endpoints
  ├─ Step 7: UI Components
  └─ Step 8: File Structure
  ↓
SELF-VALIDATE (checklist above)
  ↓
PRESENT PLAN TO USER
  ↓
WAIT FOR USER APPROVAL
  ↓
ONLY IF APPROVED: Start coding
  ├─ Create entities
  ├─ Define types
  ├─ Build repositories
  ├─ Write use-cases + tests
  ├─ Add API routes
  ├─ Create UI
  └─ Validate against PROJECT_BRAIN.md
  ↓
TASK COMPLETE
```

**No deviations. No exceptions.**
