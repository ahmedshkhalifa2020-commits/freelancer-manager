# CONSISTENCY_CHECK.md

**MANDATORY RULE: NO DELIVERY WITHOUT CONSISTENCY**

This document defines the strict "Code → Consistency Check → Delivery" validation for every task.

After code implementation and self-review, consistency validation must be complete before delivery.

---

## The Hard Rule

```
IF implementation does not match the approved plan
  OR violates PROJECT_BRAIN.md architecture
  OR scores below 85
  THEN task is INVALID until fixed
  AND stop the task
  AND require fixes or explicit deviation approval
```

This rule is non-negotiable. Every agent session must execute this check before delivery.

---

## When to Run Consistency Check

Consistency check runs immediately after self-review. It happens BEFORE delivery.

**Exception**: Do not check for trivial tasks (fixing a typo, renaming a variable). Check everything else.

---

## Consistency Dimensions

Validation occurs across 4 categories:

1. **Plan Alignment** — Implementation matches approved plan
2. **Architecture Compliance** — Code follows PROJECT_BRAIN.md rules
3. **Code Quality** — Clean, maintainable, correct implementation
4. **Minimalism** — No unnecessary files, code, or complexity

Each category is scored individually and contributes to a total score out of 100.

---

## Scoring System

Assign points in each category:

- **Plan Alignment:** 0–30
- **Architecture Compliance:** 0–30
- **Code Quality:** 0–20
- **Minimalism:** 0–20

**Total:** 100 points

### Grading

- **90–100** → Production Ready
- **75–89** → Acceptable (minor issues)
- **50–74** → Needs Improvement
- **< 50** → Reject

**Enforcement:**

```
IF total score < 85
  THEN MUST auto-fix issues
  AND re-run review and consistency checks
```

---

## 1. Plan Alignment Validation

Check that implemented code matches AGENT_PLANNER.md plan:

- **All planned entities exist** — Every table in plan has `src/dal/entities/{name}.ts`
- **All planned repositories are implemented** — Every repository in plan has `src/dal/repositories/{name}Repository.ts` with listed methods
- **All planned use-cases exist** — Every use-case in plan has `src/use-cases/{name}UseCase.ts` and `.test.ts`
- **All API endpoints are implemented** — Every endpoint in plan has `src/app/api/{path}/route.ts`
- **No extra files not in plan** — No unapproved files exist
- **No missing files** — All planned files exist

Score this category out of 30 based on completeness and fidelity.

---

## 2. Architecture Compliance Validation

Validate against PROJECT_BRAIN.md rules:

- **No business logic in API routes** — Routes only parse, validate, call use-case, respond
- **No DB access outside repositories** — Only repositories query database
- **Use-cases contain all business logic** — Validation, calculations, rules in use-cases
- **Proper dependency injection used** — Repositories injected into use-cases
- **Entities contain no logic** — Only Drizzle schema definitions
- **No direct repository calls from UI** — All data through API routes

Score this category out of 30 based on architecture adherence.

---

## 3. Code Quality Validation

Evaluate implementation quality:

- **Readability** — Clear naming, consistent style, concise functions
- **Error handling** — Meaningful catches, domain errors mapped to HTTP codes
- **Test coverage** — Use-case tests exist and cover core behavior
- **Correctness** — Implementation matches the approved design

Score this category out of 20 based on code health and robustness.

---

## 4. Minimalism Validation

Evaluate implementation efficiency:

- **No unnecessary files** — Only planned files exist
- **No unused code** — No dead exports, helpers, or imports
- **No duplicated logic** — Business rules and helpers are not repeated
- **No over-engineering** — Implementation is as simple as required by the plan

Score this category out of 20 based on simplicity and focus.

---

## Auto-Fix Rule

**Agent MUST fix inconsistencies immediately when score is below 85.**

- **MUST NOT ignore low scores** — Every issue requires action
- **MUST re-run validation after fixing** — Confirm fixes resolve issues
- **MUST NOT deliver with known issues** — Self-review + consistency check = clean code
- **MUST auto-fix** when total score is below 85, even if passing is not binary

---

## Output Format

**REQUIRED: Produce this report after validation.**

```
CONSISTENCY SCORE: 92/100

Breakdown:
- Plan: 28/30
- Architecture: 30/30
- Quality: 18/20
- Minimalism: 16/20

Grade: Production Ready

Deviations:
- List of mismatches (if any)

Fixes Applied:
- List of fixes (if any)
```

**Example**:

```
CONSISTENCY SCORE: 82/100

Breakdown:
- Plan: 24/30
- Architecture: 28/30
- Quality: 17/20
- Minimalism: 13/20

Grade: Acceptable (minor issues)

Deviations:
- Missing unit test for UpdateOrderUseCase
- One extra helper file not in plan

Fixes Applied:
- Added missing test
- Removed extra helper file
```

---

## Workflow Integration

Consistency check fits here:

PLAN → APPROVAL → CODE → SELF_REVIEW → **CONSISTENCY_CHECK** → DELIVERY

- **After self-review** — Run consistency validation
- **Before delivery** — Ensure score is 85 or higher
- **On failure** — Fix issues, re-validate, repeat until clean

---

## Explicit Rules

- **NO DELIVERY WITHOUT**:
  - Total consistency score ≥ 85
  - Plan alignment confirmed
  - Architecture compliance verified
  - Code quality validated
  - Minimalism confirmed

- **FIX OR APPROVE**:
  - Deviations require either fix or explicit user approval
  - No silent acceptance of mismatches
    </content>
    <parameter name="filePath">e:\Learn Next JS\freelancer-manager\CONSISTENCY_CHECK.md
