# AUTO_LOOP.md

**MANDATORY AUTOMATION LOOP FOR ALL TASKS**

This document defines the strict automated execution loop for every development task in the freelancer-manager project.

**NO MANUAL OVERRIDE ALLOWED. NO SHORTCUTS PERMITTED.**

---

## System Overview

The Auto-Loop is a deterministic, fail-safe execution system that enforces clean architecture and quality standards through automated validation and correction.

**Execution Flow:**

```
Task → Plan → Approval → Build → Review → Fix Loop → Delivery
```

**Integration Points:**

- AGENT_PLANNER.md (planning phase)
- PROJECT_BRAIN.md (architecture enforcement)
- SELF_REVIEW.md (quality validation)
- CONSISTENCY_CHECK.md (plan/architecture compliance)
- Multi-Agent System (planner.md, builder.md, reviewer.md)

---

## Loop Steps

### Step 1: Receive Task

**Trigger:** User provides feature request or task description

**Action:**

- Parse task requirements
- Validate task clarity (reject if ambiguous)
- Initialize execution context

**Failure:** Return "Task unclear - please clarify requirements"

### Step 2: Run Planner Agent

**Trigger:** Task received and validated

**Action:**

- Invoke Planner Agent (agent-guide/agents/planner.md)
- Execute complete AGENT_PLANNER.md process
- Generate full 8-step plan
- Perform internal self-validation

**Failure:** If planning fails validation → Revise plan internally → Retry until passes

### Step 3: Validate Plan

**Trigger:** Planner Agent completes

**Action:**

- Verify plan completeness (all 8 sections present)
- Check architecture compliance (no PROJECT_BRAIN.md violations)
- Confirm file structure validity

**Failure:** Return to Step 2 (Planner Agent) for revision

### Step 4: Wait for User Approval

**Trigger:** Plan validation passes

**Action:**

- Present complete plan to user
- Wait for explicit "APPROVED" or "REJECTED" response
- No timeout - wait indefinitely

**Failure:** If rejected → Return to Step 2 with feedback

### Step 5: Run Builder Agent

**Trigger:** Plan approved by user

**Action:**

- Invoke Builder Agent (agent-guide/agents/builder.md)
- Implement in strict order: entities → types → repositories → use-cases → API → UI
- Follow PROJECT_BRAIN.md architecture exactly
- Create all planned files, no extras

**Failure:** If implementation fails → Stop execution → Report "Builder failed - manual intervention required"

### Step 6: Run Self-Review

**Trigger:** Builder Agent completes

**Action:**

- Invoke Reviewer Agent (agent-guide/agents/reviewer.md)
- Execute SELF_REVIEW.md 5-phase process:
  - Architecture validation
  - Plan consistency
  - Code quality
  - Error handling
  - Minimalism

**Failure:** Proceed to auto-fix loop (Step 7)

### Step 7: Run Consistency Check

**Trigger:** Self-review completes (regardless of pass/fail)

**Action:**

- Execute CONSISTENCY_CHECK.md validation:
  - Plan vs Code alignment
  - Architecture compliance
  - File structure integrity

**Failure:** Proceed to auto-fix loop (Step 8)

### Step 8: Auto-Fix Loop

**Trigger:** Issues found in Step 6 or Step 7

**Recursive Process:**

```
WHILE (self-review fails OR consistency fails):
  - Identify all issues
  - Apply fixes immediately
  - Re-run Step 6 (Self-Review)
  - Re-run Step 7 (Consistency Check)
  - Repeat until both pass
```

**Termination:** Max 3 iterations → If still failing → Stop → Report "Auto-fix limit reached - manual review required"

### Step 9: Final Validation

**Trigger:** Auto-fix loop completes successfully

**Action:**

- Confirm all checks pass
- Run `npm run lint` and `npm run typecheck`
- Generate final reports

**Failure:** Return to Step 8 (Auto-fix)

### Step 10: Deliver Final Output

**Trigger:** All validations pass

**Action:**

- Package final deliverables
- Present to user with confidence
- End execution loop

---

## Failure Handling

**General Rule:**

```
IF any step fails:
  - STOP current execution
  - IDENTIFY failure point
  - RETURN to appropriate previous step
  - RETRY after fixing
  - LOG failure reason
```

**Specific Failure Recovery:**

| Failure Point         | Recovery Action                      |
| --------------------- | ------------------------------------ |
| Step 1 (Task)         | Request clarification                |
| Step 2-3 (Planning)   | Revise plan internally               |
| Step 4 (Approval)     | Wait or revise based on feedback     |
| Step 5 (Building)     | Manual intervention required         |
| Step 6-9 (Review/Fix) | Auto-fix loop or manual intervention |

**No Recovery Scenarios:**

- Architecture violations that cannot be auto-fixed
- Missing critical dependencies
- External system failures

---

## Guardrails

### Absolute Restrictions

- **NO CODE WITHOUT PLAN** — Builder Agent cannot start without approved plan
- **NO SKIPPING STEPS** — All 10 steps must execute in order
- **NO MANUAL CODING** — All implementation through Builder Agent
- **NO DELIVERY WITHOUT CHECKS** — Must pass self-review AND consistency check
- **NO ARCHITECTURE VIOLATIONS** — PROJECT_BRAIN.md rules are absolute

### Validation Gates

- **Planning Gate:** Must pass self-validation before user presentation
- **Approval Gate:** Must have explicit user approval before building
- **Quality Gate:** Must pass all reviews before delivery
- **Architecture Gate:** Must comply with clean architecture at all times

---

## Output Format

**Final Deliverable Package:**

### 1. Approved Plan

```
# Feature: [Name]

## 1. Feature Understanding
[Complete description]

## 2. Data Entities
[All tables defined]

## 3. Type Definitions
[All interfaces/enums]

## 4. Repository Planning
[All repositories/methods]

## 5. Use-Case Planning
[All use-cases with logic]

## 6. API Endpoint Planning
[All endpoints]

## 7. UI Component Planning
[All components]

## 8. File Structure Plan
[All files to create/modify]
```

### 2. Final Code

- Complete implementation in correct file structure
- All files created as planned
- No extra or missing files
- Compiles without errors

### 3. Self-Review Report

```
SELF-REVIEW REPORT:
Architecture: ✅
Plan Consistency: ✅
Code Quality: ✅
Error Handling: ✅
Minimalism: ✅

Issues Found: [None or list]
Fixes Applied: [List if any]
```

### 4. Consistency Report

```
CONSISTENCY REPORT:
Plan Alignment: ✅
Architecture Compliance: ✅
File Structure: ✅

Deviations: [None or list]
Fixes Applied: [List if any]
```

---

## System Behavior

### Deterministic Execution

- Same input → Same output
- No random decisions
- No "creative" interpretations
- Follow rules exactly

### Strict Enforcement

- No exceptions to rules
- No "just this once" allowances
- No shortcuts for "simple" tasks
- Absolute compliance required

### Error Prevention

- Validate at every step
- Fail fast on violations
- No proceeding with known issues
- Comprehensive logging

### Quality Assurance

- Multiple validation layers
- Auto-correction when possible
- Manual intervention when needed
- Zero-defect delivery goal

---

## Integration with Multi-Agent System

- **Planner Agent:** Steps 2-4
- **Builder Agent:** Step 5
- **Reviewer Agent:** Steps 6-9

**Agent Communication:**

- Agents work sequentially, not concurrently
- Each agent receives validated input from previous
- No agent can proceed without predecessor success
- Shared context maintained throughout loop

---

## Maintenance Notes

- This loop is self-enforcing — violations are automatically detected and corrected
- Add new validation steps by extending the loop, not bypassing it
- Monitor failure patterns to identify systemic issues
- Update agent roles if new requirements emerge, but maintain loop structure</content>
  <parameter name="filePath">e:\Learn Next JS\freelancer-manager\AUTO_LOOP.md
