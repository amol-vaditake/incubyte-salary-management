# Architecture & Data Model

## Overview

The system is a full-stack web application allowing an HR Manager to manage salary data for ~10,000 employees across multiple countries, and to answer aggregate questions about how the organization pays its people.

**Stack:**
- Frontend: React (Vite) + Zustand + [component library TBD] → deployed on Vercel
- Backend: Express + TypeScript → deployed on Render
- Database: PostgreSQL (Render managed / Neon) — relational, per assessment constraint
- Testing: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Data Model

### `employees`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID / serial, PK | |
| `employee_code` | text, unique | human-readable ID, e.g. `EMP-00001` |
| `first_name` | text | |
| `last_name` | text | |
| `email` | text, unique | |
| `country` | text | e.g. India, USA, UK |
| `department` | text | e.g. Engineering, Sales, HR |
| `role_title` | text | e.g. "Senior Engineer" |
| `level` | text | e.g. Junior / Mid / Senior / Lead |
| `currency` | text | ISO currency code, e.g. INR, USD, GBP |
| `salary_amount` | numeric | current salary, in local currency |
| `hire_date` | date | |
| `status` | text (enum-like) | `active` / `inactive` — soft-delete rather than hard-delete |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `salary_history`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID / serial, PK | |
| `employee_id` | FK → employees.id | |
| `salary_amount` | numeric | |
| `currency` | text | |
| `effective_date` | date | |
| `reason` | text | e.g. "Annual increment", "Promotion", "Initial hire" |
| `created_at` | timestamp | |

**Why `salary_history` exists:** the brief asks the HR manager to be able to "answer questions about how the org pays people" — this phrasing invites more than a static snapshot of current salaries. A history table enables trend-based questions (e.g. average raise % by department over the last year, pay progression per employee) that a flat CRUD table cannot answer. It is cheap to model now and expensive to retrofit later.

## Core API surface (initial slice)

- `GET /employees` — paginated list, filterable by country/department/level/status
- `GET /employees/:id` — single employee detail, including salary history
- `POST /employees` — create employee (also creates initial `salary_history` row)
- `PUT /employees/:id` — update employee details
- `PATCH /employees/:id/salary` — record a salary change (updates `employees.salary_amount`, inserts a `salary_history` row)
- `DELETE /employees/:id` — soft-delete (sets `status = inactive`)
- `GET /analytics/summary` — aggregate endpoint answering "how does the org pay people": avg salary by department, avg salary by country, headcount by department/level

## Explicitly out of scope (and why)

- **Currency conversion / single-currency reporting** — normalizing all salaries to one reporting currency requires live exchange rate data and introduces accuracy/staleness concerns beyond the scope of this exercise. Salaries are stored and reported in local currency with a `currency` field on each record.
- **Multi-tenant / multi-organization support** — the brief describes a single org (ACME) with a single HR Manager persona; building multi-tenancy would be solving a problem not asked for.
- **Authentication / role-based access control** — the persona is a single HR Manager; adding auth would add complexity without demonstrating additional relevant judgment for this exercise. Noted as a natural next step for a real production system.
- **Payroll processing / disbursement** — the problem statement is about managing and understanding salary *data*, not running payroll; actual disbursement is a distinct system concern.
- **Full audit trail / undo history beyond salary_history** — general field-level audit logging (e.g. who changed an employee's department) is deferred; only salary changes are tracked historically, since that's the dimension the brief asks about.

## Non-functional considerations

- **Seed scale:** 10,000 employees generated via a seed script (e.g. `@faker-js/faker`) with realistic distribution across countries, departments, and salary bands — not uniform/random noise.
- **Performance:** list endpoint uses pagination and indexed filter columns (`country`, `department`, `status`) to stay responsive at 10k rows.
- **Deployment:** free-tier hosting (Render backend + Postgres, Vercel frontend) with an external keep-alive cron to avoid cold starts during review; the free Postgres instance has a 30-day expiry, acceptable within the assessment/review timeline.