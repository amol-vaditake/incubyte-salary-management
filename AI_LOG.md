# AI Usage & Decision Log

This log documents AI-assisted decisions, prompts, and manual (non-AI) steps taken throughout the build, in chronological order. Entries made before the Claude Code session began were done via conversational planning with Claude (claude.ai), used for architecture/requirements thinking before any code was written.

---

### 1. Reviewing the assessment brief (AI-assisted)
**Context:** Read through the Incubyte assessment document (Salary Management System) and a public review of a different Incubyte candidate's assessment (a Pokémon frontend exercise), to understand grading patterns across their assessments.
**Decision:** Identified recurring evaluation themes even across different problem statements: strict incremental/TDD-style commit history, explicit documentation of AI usage (not just "AI was used" but specific prompts/rationale), live deployed link + video demo, and product thinking beyond the literal spec.
**Output:** Used these patterns to shape the project's working rules (see `CLAUDE.md`).

### 2. Drafting project rules (`CLAUDE.md`) (AI-assisted)
**Prompt/instruction given:** Asked for a rules file that Claude Code would automatically read every session, capturing every requirement from the assessment brief in enforceable detail.
**Decision/output:** Created `CLAUDE.md` in the repo root covering: the problem statement, hard requirements (requirements doc, backend/frontend stack, seed script, deployment, video demo, tests, incremental commits, artifacts), TDD workflow expectations, commit hygiene, an instruction to maintain this very log file (`AI_LOG.md`) proactively, README requirements, and an explicit "ask, don't assume" rule mirroring the assessment's own instructions.
**Alternatives considered:** Named the file `rules.md`; switched to `CLAUDE.md` instead because Claude Code auto-loads that specific filename at the start of every session, removing the need for a manual reminder prompt.

### 3. Tech stack selection and a corrected mistake (AI-assisted)
**Initial plan:** React, Zustand, Express, **MongoDB Atlas**, Vercel (frontend), Render (backend).
**Issue identified:** The assessment explicitly requires a "relational database of your choice, like SQLite." MongoDB is a document database, not relational — this would have silently violated a stated technical constraint.
**Decision:** Switched to **PostgreSQL** (via Render's managed Postgres or Neon), keeping the rest of the stack unchanged. Rationale: lower risk than justifying a non-relational DB as a "trade-off," and Postgres is a better natural fit for the "answer questions about how the org pays people" reporting requirement (aggregations/group-bys across country, department, band).
**Logged in:** `CLAUDE.md`, Section 8 (Deployment & infra notes).

### 4. Deployment platform research and keep-alive plan (AI-assisted, web search used)
**Context:** Verified current (2026) Render free-tier behavior for Postgres and web services before committing to the platform.
**Findings used to shape decisions:** Render's free web services spin down after ~15 minutes of inactivity (30-60s cold start on next request); Render's free Postgres database expires 30 days after creation with a 14-day grace period before deletion.
**Decision:** Proceed with Render's free tier since the assessment/review window fits comfortably within 30 days. Added an external keep-alive cron (e.g. cron-job.org) pinging a `/health` endpoint every ~10 minutes to prevent web-service spin-down. Explicitly noted that this cron does NOT prevent the separate 30-day database expiry — that's a distinct lifecycle limit with no workaround at the free tier, just a time constraint to stay within.
**Logged in:** `CLAUDE.md`, Section 8.

### 5. Backend scaffold (manual, before Claude Code session started)
**What was done:** Manually ran `npm init -y`, installed `express`, `pg`, `dotenv`, installed dev dependencies (`typescript`, `ts-node-dev`, `jest`, `ts-jest`, `supertest`, `@types/*`), and ran `npx tsc --init` directly in the terminal.
**AI involvement:** None — plain manual setup commands, run directly by the developer before opening Claude Code for this project.

---

## From this point forward

Entries below this line are generated during active Claude Code sessions, per the standing instruction in `CLAUDE.md` Section 5: every non-trivial decision, prompt, or trade-off encountered during development is logged here as it happens, not reconstructed afterward.

### 6. Test runner setup and DB testing strategy (AI-assisted)
**Prompt/instruction given:** "Start the TDD loop for the backend per CLAUDE.md. First slice: create the Postgres schema (employees + salary_history), then GET /employees with pagination and filtering. Write a failing test first, minimal implementation, refactor, commit each stage separately."
**Decision/output:**
- Switched `tsconfig.json` `module`/`moduleResolution` from the scaffolded `nodenext` to `commonjs`/`node`. `ts-jest` supports both, but `commonjs` avoids ESM-specific test-runner friction (extension mapping, `extensionsToTreatAsEsm`) for no real cost in a Node backend that isn't publishing an ESM package. Also filled in `types: ["node", "jest"]` (was empty, which would have left `process`/`describe`/`it` untyped) and dropped `rootDir`/`outDir` until an actual build script needs them.
- Checked this dev machine for a local Postgres/Docker to back integration tests: neither `psql` nor `docker` is installed. Rather than requiring the reviewer/grader to have Postgres running locally to run `npm test` (risky for a graded assessment), added **pg-mem** (`^3.0.14`) as a devDependency — an in-memory, dependency-free engine that speaks the same wire protocol/interface as `pg`. Tests get a real `Pool` and run real SQL (schema DDL, inserts, `WHERE`/`LIMIT`/`OFFSET`) against it, so this is a genuine integration test of the SQL, not a mock of the repository layer.
- Verified the ts-jest + pg-mem setup with a throwaway smoke test before writing real tests, then deleted it — confirms tooling works before it's load-bearing.
**Alternatives considered:**
- *Mock the repository/DB layer entirely* — rejected: would only test that the route calls a mocked function, not that the SQL pagination/filtering logic is correct, which is the actual behavior worth testing here.
- *Require a real local/Dockerized Postgres for tests* — rejected: most "production-realistic" option, but makes `npm test` fail out of the box on a machine without Postgres/Docker installed (this one included), which is a bad default for something explicitly graded on "fast, deterministic, easy to run" tests.
- *Use SQLite for tests, Postgres in production* — rejected: schema/dialect drift risk (e.g. date/numeric handling, aggregate functions used later for analytics) could hide real bugs; pg-mem stays on the Postgres dialect.
**Logged in:** `backend/tsconfig.json`, `backend/jest.config.js`, `backend/package.json` (commit `chore: configure Jest test runner for backend`).

### 7. Schema slice: TDD cycle and ID-generation trade-off (AI-assisted)
**Decision/output:** Wrote a failing test (`tests/schema.test.ts`) asserting an employee + linked `salary_history` row round-trip correctly, and that a `salary_history` row referencing a non-existent `employee_id` is rejected (FK enforcement) — confirmed it failed (`ENOENT` on missing `schema.sql`), then added `src/db/schema.sql` to make it pass.
- `id` columns are `UUID PRIMARY KEY` with **no DB-side default**. Postgres's `gen_random_uuid()` needs either PG13+ built-in support or the `pgcrypto` extension, and pg-mem's support for that surface wasn't worth gambling the first schema commit on. The application will generate ids (e.g. `crypto.randomUUID()`) on insert instead — simpler, portable across the real Postgres and the pg-mem test engine, and keeps id generation visible/testable in app code rather than implicit in the DB.
- No `CHECK` constraint on `employees.status` yet — validation of the active/inactive values is deferred to the application layer (better error messages, and avoids a second unverified pg-mem/Postgres constraint-support assumption in this slice). Can be added later if a defense-in-depth DB constraint is wanted.
**Alternatives considered:** `DEFAULT gen_random_uuid()` in schema — rejected for this slice per above; can be revisited once POST /employees is built and both engines' behavior is confirmed empirically.

### 8. GET /employees slice: TDD cycle, response shape, and no-refactor decision (AI-assisted)
**Decision/output:**
- Test-first: `tests/employees.test.ts` seeds 5 fixture employees and asserts default pagination, explicit `page`/`pageSize`, filtering by `country`, combined `department`+`status`, an empty-match page, and 400s for a non-positive `page` and an over-max `pageSize`. Confirmed it failed (`Cannot find module '../src/app'`) before implementing.
- `createApp(pool)` is a factory taking a `Pool` rather than constructing one internally, so tests inject a pg-mem pool and `src/server.ts` injects a real one — no mocking of `pg` itself needed, and the route/repository code under test is identical to what runs in production.
- API response uses camelCase (`employeeCode`, `salaryAmount`, ...) mapped from the DB's snake_case columns in `employeeRepository.mapRow`, matching normal JS/JSON convention on the wire while keeping SQL idiomatic.
- Pagination response shape: `{ data: Employee[], pagination: { page, pageSize, total, totalPages } }`. Ordered by `employee_code ASC` for deterministic pagination (required for the page-2 test to be meaningful).
- Validation: `page`/`pageSize` must be positive integers (regex-checked, not just `Number()` + `isInteger`, to reject things like `"1e2"` or whitespace-padded strings cleanly); `pageSize` capped at 100 to bound query cost at 10k rows.
- Assessed whether a refactor step was warranted after the implementation (per CLAUDE.md's red→green→**refactor** loop): the route/repository/mapper split is already single-purpose with no duplication at this size (one endpoint, one filter-building path) - added no refactor commit rather than manufacturing one just to check the box, per the "don't over-engineer" rule.
**Alternatives considered:** Building the app/pool inside `src/app.ts` as a singleton (no DI) — rejected: would force tests to either hit a real Postgres or `jest.mock('pg')` the whole module, both worse than passing a pg-mem `Pool` straight in.