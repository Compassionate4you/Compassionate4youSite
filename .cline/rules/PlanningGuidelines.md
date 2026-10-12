# Cline Rules: Planning Mode Specification

## 1. Mode Objective
In **Plan Mode**, your primary responsibility is deep architectural discovery, risk assessment, and producing an exhaustive, deterministic execution blueprint. 

> **Core Principle:** Do not create abstract or vague task lists. Every plan must explicitly outline the exact **methodology**, **architecture**, and **concrete implementation mechanics** that will be followed in **Act Mode**.

---

## 2. Plan Mode Operational Constraints
- **Read-Only / Non-Destructive:** Only gather context (e.g., search codebases, inspect files, read configuration, examine schemas). Do not write production code or execute destructive side-effects during this phase.
- **No Ambiguity:** If a design decision or API contract is unresolved, resolve it in the plan or ask targeted clarifying questions before finalizing.
- **Zero Surprises for Act Mode:** A plan is considered complete only if an executing agent can transition directly to Act Mode and follow the instructions without needing to guess design patterns, library choices, or file structures.

---

## 3. Required Plan Structure
Every generated plan must adhere to the following template:

```markdown
# [Feature / Task Name] - Execution Plan

## 1. Context & Problem Statement
- **Objective:** Brief summary of the expected outcome.
- **Affected Subsystems:** Components, modules, microservices, or APIs involved.

## 2. Technical Methodology & Architectural Approach
- **Pattern/Strategy:** Explicit rationale for the selected design pattern or algorithm (e.g., Strategy pattern, Event-driven, Atomic updates).
- **Alternative Approaches Rejected:** Why alternative patterns or libraries were dismissed.
- **State & Data Flow:** Explicit flow of state/data across layers (e.g., UI -> Controller -> Service -> DB).
- **Interface & Schema Contracts:** Explicit TypeScript interfaces, DB schemas, or API payload specifications.

## 3. Step-by-Step Implementation Blueprint (Act Mode Roadmap)
For each logical step, specify:
- **Target File(s):** Absolute or repository-relative paths.
- **Methodology / Implementation Details:**
  - Concrete functions/methods to create, modify, or deprecate.
  - Core logic, edge cases to handle, and error-handling strategy.
  - Dependencies or utilities to import/install.
  - Example signature or pseudocode illustrating exact mechanics.

## 4. Verification & Validation Strategy
- **Unit / Integration Tests:** Explicit test cases, files to add/update, and mock requirements.
- **Manual Verification Steps:** CLI commands, curl requests, or UI workflows to confirm success.
- **Rollback / Failure Modes:** Anticipated failure scenarios and mitigation steps.
```

---

## 4. Implementation Detail Standards for Act Mode
When preparing the **Step-by-Step Implementation Blueprint**, you must fulfill the following:

1. **Exact File Paths:** Never state *"Update the relevant controller"*; specify *"Modify `src/controllers/user.controller.ts`"*.
2. **Explicit Logic & Algorithmic Steps:** Do not write *"Add caching"*; write *"Wrap `fetchUserProfile()` with Redis `getOrSet()` using key `user:profile:{id}` and TTL of 300s, handling cache-miss fallbacks"*.
3. **Data Transformations & Contracts:** Detail exact input/output payloads, schema changes, migrations, or typing definitions.
4. **Boundary & Edge-Case Handling:** Explicitly define how null values, network timeouts, invalid inputs, or race conditions will be intercepted and resolved.

---

## 5. Transition to Act Mode
- Present the generated plan clearly to the user.
- Explicitly ask for user approval or feedback on the technical decisions.
- Do not execute write/modify operations until the plan is approved.