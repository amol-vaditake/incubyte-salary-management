# Project Rules — Incubyte Assessment: Employee Salary Management System

> Claude Code: read this file in full before doing any work in this repo, and re-check it before every new task or session. Do not skip or summarize past it — every rule here is a hard constraint for this assessment, not a suggestion.

## 1. Context — why this project exists

This is a take-home technical assessment for a **Software Craftsperson (Node/TypeScript/ReactJS - II)** role at Incubyte. It is being evaluated by their engineering team on:
- Clarity of thought & structured problem solving
- Engineering fundamentals & product thinking
- Architecture & design decisions
- Production-quality code and tests
- **Intentional, transparent use of AI tools** (this is graded explicitly — not a formality)
- Evidence of incremental development (commit history must show evolution, not one big dump)

Getting selected depends as much on **how the process is documented** as on the code working. Treat documentation and commit hygiene as first-class deliverables, equal in priority to the feature code.

## 2. The problem statement (do not deviate from this)

**Goal:** Build employee salary management software for an organization with 10,000 employees.

**Persona:** HR Manager of the organization.

**Problem:** ACME org's HR team currently manages salary data for 10,000 employees across multiple countries via Excel. They want a web-based system to manage salary data and answer questions about how the org pays people.

**Deliberately note:** "answer questions about how the org pays people" implies some reporting/analytics/query capability beyond basic CRUD — e.g. average salary by country/department/role, pay bands, currency handling. This is a product-thinking signal, not just a data-entry app. Do not build a plain CRUD table and call it done.

## 3. Hard requirements (from the assessment doc)

1. **Requirements document** — a one-page doc written *before* building, covering: goal, scope & features, and what is deliberately excluded (with reasoning). This must exist as an artifact in the repo, not just in my head.
2. **Backend:** Node/TypeScript preferred (matches JD). Relational database (SQLite is acceptable and recommended for simplicity/portability).
3. **Frontend:** ReactJS or NextJS, any component library.
4. **Seed script** that generates 10,000 employees (realistic-looking data: names, countries, currencies, departments, salary bands — not just `Employee 1` through `Employee 10000`).
5. **Fully functional, deployed** software (live link required).
6. **Video demo** of the working software.
7. **Meaningful unit tests** covering core functionality — fast, deterministic, easy to understand. Not testing implementation details; test behavior.
8. **Incremental commits** that show the evolution of the solution — this is explicitly checked. No single "initial commit with everything."
9. **Artifacts committed to the repo**, e.g.: requirements doc, planning/design notes, architecture diagrams, AI prompts/instructions used, trade-off explanations, performance considerations. "No required format" — but they must exist and be easy to find.

## 4. Development workflow rules

### TDD discipline
Even though the doc says "incremental commits" rather than the words "TDD," treat this as a de facto TDD assessment (confirmed pattern from other Incubyte assessment reviews). Follow strict red → green → refactor:
1. Write a failing test first.
2. Write the minimal code to make it pass.
3. Refactor with tests green.
4. Commit at each meaningful step — commit messages should make the red/green/refactor rhythm visible (e.g. `test: add failing test for salary band calculation`, `feat: implement salary band calculation to pass test`, `refactor: extract salary band logic into service`).

### Commit hygiene
- Small, logical, incremental commits — never large multi-feature dumps.
- Conventional commit style prefixes: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`.
- Every commit should be understandable in isolation from its message.

### Code quality bar
- Production-quality: proper error handling, input validation, sensible folder structure, no dead code, no commented-out blocks left in.
- Prefer clarity and maintainability over cleverness.
- Keep functions/components small and single-purpose.

## 5. AI transparency logging — MANDATORY, ONGOING

This is graded, so it cannot be reconstructed after the fact from memory. As you (Claude Code) work:

- **Maintain a file called `AI_LOG.md` in the repo root.**
- Every time you (a) make a non-trivial design/architecture decision, (b) are given a prompt/instruction that shapes the code, or (c) consider and reject a trade-off, **append an entry immediately** — don't wait to be asked. Format:

```
### [timestamp or step name]
**Prompt/instruction given:** <what I asked you to do, paraphrased or verbatim>
**Decision/output:** <what you did and why>
**Alternatives considered:** <if any, and why rejected>
```

- At the end of the project, this log feeds directly into the README's "Implementation Details" / AI usage section — so keep entries honest, specific, and non-generic. Avoid vague lines like "used AI to write code." Be specific: which parts were AI-scaffolded, which were hand-reviewed/modified, and why.
- Do not silently skip logging because a decision "seems minor" — under-logging is worse than over-logging here.

## 6. README requirements

The final README must include:
- Project overview & how to run it locally (setup steps, env vars, seed command).
- Link to live deployed version.
- Link/embed to video demo.
- Screenshots of key screens.
- **"Implementation Details" section** documenting AI tool usage: which tools, what for, and rationale (derived from `AI_LOG.md`).
- Architecture overview (brief diagram or description).
- Trade-offs made and what was deliberately left out of scope, with reasoning.
- How to run tests.

## 7. Ask, don't assume

The assessment explicitly says: "If anything is unclear, ask. Do not proceed with doubts." If you (Claude Code) hit a genuine ambiguity in scope (e.g., multi-currency handling, auth requirements, exact reporting queries expected), **surface it to me explicitly as a question** rather than silently picking an interpretation and running with it. I will decide whether to make an assumption (and document it in the requirements doc) or ask Incubyte directly.

## 8. What NOT to do

- Do not over-engineer (microservices, Kafka, etc. for a take-home) — this is a signal of poor judgment, not skill.
- Do not skip tests to move faster — meaningful test coverage is explicitly graded.
- Do not deploy something flaky — "fully functional deployed software" is a hard requirement, not a nice-to-have.
- Do not write a generic README — specificity is what separates a strong submission from a template-shaped one.
