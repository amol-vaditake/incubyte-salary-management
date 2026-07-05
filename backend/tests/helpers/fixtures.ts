import crypto from "node:crypto";
import type { Pool } from "pg";

export interface EmployeeFixture {
  id?: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  department?: string;
  roleTitle?: string;
  level?: string;
  currency?: string;
  salaryAmount?: number;
  hireDate?: string;
  status?: string;
}

export async function insertEmployee(
  pool: Pool,
  fixture: EmployeeFixture
): Promise<string> {
  const id = fixture.id ?? crypto.randomUUID();

  await pool.query(
    `INSERT INTO employees
      (id, employee_code, first_name, last_name, email, country, department, role_title, level, currency, salary_amount, hire_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      id,
      fixture.employeeCode,
      fixture.firstName ?? "Test",
      fixture.lastName ?? "Employee",
      fixture.email ?? `${fixture.employeeCode.toLowerCase()}@example.com`,
      fixture.country ?? "India",
      fixture.department ?? "Engineering",
      fixture.roleTitle ?? "Engineer",
      fixture.level ?? "Mid",
      fixture.currency ?? "INR",
      fixture.salaryAmount ?? 1000000,
      fixture.hireDate ?? "2022-01-01",
      fixture.status ?? "active",
    ]
  );

  return id;
}

export interface SalaryHistoryFixture {
  id?: string;
  employeeId: string;
  salaryAmount: number;
  currency?: string;
  effectiveDate: string;
  reason: string;
}

export async function insertSalaryHistory(
  pool: Pool,
  fixture: SalaryHistoryFixture
): Promise<string> {
  const id = fixture.id ?? crypto.randomUUID();

  await pool.query(
    `INSERT INTO salary_history
      (id, employee_id, salary_amount, currency, effective_date, reason)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      id,
      fixture.employeeId,
      fixture.salaryAmount,
      fixture.currency ?? "INR",
      fixture.effectiveDate,
      fixture.reason,
    ]
  );

  return id;
}
