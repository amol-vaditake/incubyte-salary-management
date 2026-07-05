# Requirements Document — Employee Salary Management System

## Goal

Give ACME org's HR Manager a web-based system to manage salary data for ~10,000 employees across multiple countries, replacing the current spreadsheet-based workflow, and to let them answer questions about how the organization pays its people — not just store and retrieve individual records.

## Persona

**HR Manager** — a single internal user responsible for maintaining accurate salary records and understanding pay patterns across the org (by country, department, and level), without needing engineering or data-analyst help to answer basic compensation questions.

## In Scope

- **Employee records:** create, view, update, and deactivate (soft-delete) employee salary data — name, country, currency, department, role/level, current salary, hire date, status.
- **Salary history:** every salary change is recorded with an effective date and reason, so pay progression over time is visible per employee, not just the latest snapshot.
- **Browsing & filtering:** a paginated, filterable list view (by country, department, level, status) so the HR Manager can navigate 10,000 employees without relying on spreadsheet tricks.
- **Analytics/summary view:** aggregate reporting that directly answers "how does the org pay people" — e.g. average salary by department, average salary by country, headcount by department/level.
- **Seeded realistic data:** 10,000 employees generated with realistic distribution across countries, departments, and salary bands, so the system can be evaluated at real scale, not with a handful of toy records.
- **Deployed, working software** with a live link and a short video walkthrough.

## Explicitly Out of Scope (and why)

- **Currency conversion / single-currency reporting.** Normalizing all salaries into one reporting currency requires live exchange-rate data and introduces accuracy/staleness questions that are a separate problem from salary *management*. Salaries are stored and reported in local currency, with a currency field per record, so comparisons within a country/currency remain meaningful without a false precision layer on top.
- **Multi-tenant / multi-organization support.** The brief describes a single organization (ACME) with a single HR Manager persona. Building multi-tenancy would be solving a problem that wasn't asked for and would add complexity that doesn't demonstrate additional relevant judgment here.
- **Authentication / role-based access control.** With a single-user persona and no stated requirement for multiple roles or access levels, adding auth would be scope creep for this exercise. It's a natural and expected addition for a real production rollout, and is called out here rather than silently ignored.
- **Payroll processing / disbursement.** The problem statement is about managing and understanding salary *data*, not running payroll or issuing payments — that is a distinct system with its own compliance and integration concerns.
- **Full field-level audit trail.** General audit logging of every field edit (e.g. who changed an employee's department) is deferred. Only salary changes are tracked historically, since that is the specific dimension the brief asks the HR Manager to be able to reason about.

## Success Criteria

The HR Manager can, without engineering help:
1. Find and review any employee's current salary and history.
2. Update an employee's salary and have that change reflected immediately in both the record and the history.
3. Answer "how are we paying people in Engineering vs Sales" or "how does India compare to the US" via the analytics view, without exporting to Excel.
4. Do all of the above responsively across a dataset of 10,000 employees.