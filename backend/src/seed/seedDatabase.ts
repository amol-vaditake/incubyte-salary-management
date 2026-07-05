import crypto from "node:crypto";
import type { Pool } from "pg";
import { generateEmployees, type SeedEmployee } from "./generateEmployees";

const BATCH_SIZE = 500;

const EMPLOYEE_COLUMNS = [
  "id",
  "employee_code",
  "first_name",
  "last_name",
  "email",
  "country",
  "department",
  "role_title",
  "level",
  "currency",
  "salary_amount",
  "hire_date",
  "status",
];

const SALARY_HISTORY_COLUMNS = [
  "id",
  "employee_id",
  "salary_amount",
  "currency",
  "effective_date",
  "reason",
];

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildEmployeeRow(employee: SeedEmployee): unknown[] {
  return [
    employee.id,
    employee.employeeCode,
    employee.firstName,
    employee.lastName,
    employee.email,
    employee.country,
    employee.department,
    employee.roleTitle,
    employee.level,
    employee.currency,
    employee.salaryAmount,
    employee.hireDate,
    employee.status,
  ];
}

function buildSalaryHistoryRow(employee: SeedEmployee): unknown[] {
  return [
    crypto.randomUUID(),
    employee.id,
    employee.salaryAmount,
    employee.currency,
    employee.hireDate,
    "Initial hire",
  ];
}

async function insertBatch(
  pool: Pool,
  table: string,
  columns: string[],
  rows: unknown[][]
): Promise<void> {
  if (rows.length === 0) return;

  const values: unknown[] = [];
  const rowPlaceholders = rows.map((row) => {
    const placeholders = row.map((_, colIndex) => `$${values.length + colIndex + 1}`);
    values.push(...row);
    return `(${placeholders.join(", ")})`;
  });

  await pool.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${rowPlaceholders.join(", ")}`,
    values
  );
}

export async function seedDatabase(pool: Pool, count: number): Promise<void> {
  // Safe to re-run: clear existing data first (child table before parent,
  // for the employee_id foreign key) rather than accumulating duplicates.
  await pool.query("DELETE FROM salary_history");
  await pool.query("DELETE FROM employees");

  const employees = generateEmployees(count);

  for (const batch of chunk(employees, BATCH_SIZE)) {
    await insertBatch(pool, "employees", EMPLOYEE_COLUMNS, batch.map(buildEmployeeRow));
    await insertBatch(
      pool,
      "salary_history",
      SALARY_HISTORY_COLUMNS,
      batch.map(buildSalaryHistoryRow)
    );
  }
}
