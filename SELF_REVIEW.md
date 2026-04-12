# SELF_REVIEW.md

**MANDATORY RULE: NO CODE DELIVERY WITHOUT SELF-REVIEW**

This document defines the enforced self-review and auto-fix system that happens immediately after code implementation.

Before delivering any code, the agent MUST review its own work and fix all issues.

---

## The Hard Rule

```
IF code is written
  THEN self-review MUST happen immediately
  AND all issues MUST be fixed
  AND review MUST pass before delivery
```

This rule is non-negotiable. Every implementation ends with this review.

---

## When to Start Self-Review

Self-review begins immediately after code is written and BEFORE final delivery.

**Exception**: Do not review for trivial changes (fixing a typo, renaming a variable). Review everything else.

---

## The Self-Review Process (5 Phases)

### Phase 1: Architecture Review

**Goal**: Validate implementation against PROJECT_BRAIN.md architecture rules.

Check each layer:

- **API Routes** (`src/app/api/`): Only HTTP adapters (parse → validate → call use-case → respond). NO business logic.
- **Use-Cases** (`src/use-cases/`): Contain ALL business logic, validation, coordination. Receive repositories via constructor injection.
- **Repositories** (`src/dal/repositories/`): Pure CRUD only (create, findById, findAll, update, delete). NO filtering, NO calculations.
- **Entities** (`src/dal/entities/`): Drizzle schema only. NO logic, NO computed properties.
- **Types** (`src/dal/types/`): Shared interfaces and enums.

**Common Violations to Check:**

- Business logic in API routes (calculations, decisions)
- Database queries outside repositories
- UI calling repositories directly (must use API routes)
- Missing dependency injection in use-cases
- Raw database errors exposed to client

**Output**: List of violations found and fixes applied.

### Phase 2: Plan Consistency Review

**Goal**: Compare implementation with the APPROVED PLAN from AGENT_PLANNER.md.

Verify:

- All planned entities are created with correct fields
- All planned types are defined
- All planned repositories exist with correct methods
- All planned use-cases are implemented with correct logic
- All planned API endpoints exist with correct routes
- All planned UI components are created
- All planned files are created/modified as specified

**Deviation Handling:**
If implementation differs from plan:

- **Mark it clearly** in the review report
- **Either fix it** to match the plan OR **explain why deviation is necessary**
- **Get user approval** for any deviation before delivery

**Output**: List of consistencies and any deviations with explanations.

### Phase 3: Code Quality Review

**Goal**: Ensure code is clean, readable, and maintainable.

Check:

- **Type Safety**: All TypeScript types are correct, no `any` types
- **Naming**: Clear, descriptive names for variables, functions, classes, files
- **Function Size**: No functions longer than 20-30 lines (split if needed)
- **Readability**: Clean structure, logical flow, no messy nested code
- **No Duplication**: DRY principle applied, no repeated code
- **Imports**: Clean imports, no unused imports
- **Comments**: Necessary comments for complex logic, no obvious comments

**Output**: List of quality issues found and fixes applied.

### Phase 4: Edge Cases & Error Handling

**Goal**: Verify robust error handling and edge case coverage.

Check:

- **Domain Errors**: Use-cases throw `DomainError` with user-friendly messages
- **HTTP Mapping**: API routes map domain errors to correct HTTP status codes (400 for business rules, 500 for system errors)
- **Error Logging**: Real errors are logged, generic messages returned to client
- **Input Validation**: All inputs validated with Zod in API routes
- **Null/Undefined Handling**: Proper checks for null values, optional chaining used
- **Database Constraints**: Foreign keys, unique constraints handled gracefully
- **Network Failures**: API calls handle timeouts, connection errors

**Output**: List of error handling issues found and fixes applied.

### Phase 5: Minimalism Check

**Goal**: Ensure the simplest correct implementation.

Check:

- **Over-engineering**: Remove unnecessary abstractions, patterns, or complexity
- **Dead Code**: Remove unused functions, variables, imports
- **Simplest Solution**: Is there a simpler way to achieve the same result?
- **Performance**: No premature optimization, but no obvious inefficiencies
- **Maintainability**: Code is easy to understand and modify

**Output**: List of simplifications made or confirmed minimal.

---

## AUTO-FIX RULE (CRITICAL)

**If ANY issue is found in ANY phase:**

- **The agent MUST fix it immediately**
- **The agent MUST NOT ignore issues**
- **The agent MUST NOT deliver code with known problems**
- **The agent MUST re-run the review after fixing**

**Repeat the entire review process until:**

- NO issues remain in any phase
- All checklists pass
- Implementation is clean and correct

**Failure to fix = Task incomplete.**

---

## REQUIRED OUTPUT FORMAT

After implementation and before delivery, the agent MUST output:

---

## SELF-REVIEW REPORT

### 1. Architecture Check

- [x] No layer violations found
- [x] Use-cases contain all business logic
- [x] API routes are thin adapters only
- [x] Proper dependency injection used
- [x] No database access outside repositories

### 2. Plan Consistency

- [x] All planned files implemented
- [x] All use-cases match plan
- [x] Repository methods match plan
- [x] No unexplained deviations

**Deviations (if any):**

- None

### 3. Code Quality

- [x] Type-safe implementation
- [x] Clear naming throughout
- [x] Functions appropriately sized
- [x] Clean, readable structure
- [x] No code duplication

### 4. Error Handling

- [x] All expected errors handled
- [x] Domain errors are user-friendly
- [x] Correct HTTP status codes used
- [x] No unhandled exceptions

### 5. Minimalism

- [x] Simplest correct implementation
- [x] No unnecessary complexity
- [x] No dead code

### Improvements Made

- **Fixed**: [Describe any fixes applied during review]
- **Refactored**: [Describe any refactoring done]
- **Simplified**: [Describe any simplifications made]

---

## ENFORCEMENT RULES

- **The agent MUST NOT deliver code without SELF-REVIEW**
- **The agent MUST fix ALL detected issues BEFORE finishing**
- **The agent MUST ensure consistency with AGENT_PLANNER.md and PROJECT_BRAIN.md**
- **The agent MUST re-review after fixes**
- **Code is NOT complete until review passes with no issues**

---

## Integration with Workflow

This review fits into the complete workflow:

```
TASK RECEIVED
  ↓
PLAN (AGENT_PLANNER.md)
  ↓
SELF-VALIDATE PLAN
  ↓
PRESENT PLAN
  ↓
USER APPROVAL
  ↓
CODE IMPLEMENTATION
  ↓
SELF-REVIEW (this document)
  ├─ Architecture Check
  ├─ Plan Consistency
  ├─ Code Quality
  ├─ Error Handling
  └─ Minimalism
  ↓
AUTO-FIX (if issues found)
  ↓
RE-REVIEW (repeat until clean)
  ↓
DELIVER FINAL CODE
```

---

## Common Issues & Fixes

### Architecture Violations

**Issue**: Business logic in API route
**Fix**: Move logic to use-case, make API route thin

**Issue**: Repository with filtering
**Fix**: Remove filtering, keep pure CRUD

**Issue**: UI calling repository
**Fix**: Change to API route call

### Plan Deviations

**Issue**: Extra file created not in plan
**Fix**: Either remove it or update plan and get approval

**Issue**: Use-case logic differs from plan
**Fix**: Align with plan or explain deviation

### Code Quality

**Issue**: Large function (>30 lines)
**Fix**: Split into smaller functions

**Issue**: Poor naming
**Fix**: Rename to be descriptive

### Error Handling

**Issue**: Raw DB error to client
**Fix**: Catch, log, return generic 500

**Issue**: Missing validation
**Fix**: Add Zod schema and validation

---

## Summary

**The self-review enforces quality by default:**

- **Architecture compliance** prevents technical debt
- **Plan consistency** ensures requirements are met
- **Code quality** maintains readability
- **Error handling** ensures robustness
- **Minimalism** prevents over-engineering

**No code leaves the agent without passing this review.**

**No exceptions. No shortcuts.**
