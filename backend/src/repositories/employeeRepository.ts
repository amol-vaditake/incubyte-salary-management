import crypto from "node:crypto";
import type { Pool } from "pg";
import type { Employee } from "../types/employee";
import { toDateOnlyString } from "../db/dateOnly";
import type { Queryable } from "../db/transaction";

export interface EmployeeFilters {
  country?: string | undefined;
  department?: string | undefined;
  status?: string | undefined;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedEmployees {
  data: Employee[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface EmployeeRow {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  department: string;
  role_title: string;
  level: string;
  currency: string;
  salary_amount: string;
  hire_date: string | Date;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: EmployeeRow): Employee {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    country: row.country,
    department: row.department,
    roleTitle: row.role_title,
    level: row.level,
    currency: row.currency,
    salaryAmount: Number(row.salary_amount),
    hireDate: toDateOnlyString(row.hire_date),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildWhereClause(filters: EmployeeFilters): {
  clause: string;
  values: string[];
} {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.country) {
    values.push(filters.country);
    conditions.push(`country = $${values.length}`);
  }
  if (filters.department) {
    values.push(filters.department);
    conditions.push(`department = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

export async function findEmployeeById(
  pool: Pool,
  id: string
): Promise<Employee | null> {
  const result = await pool.query<EmployeeRow>(
    "SELECT * FROM employees WHERE id = $1",
    [id]
  );

  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export async function findEmployeeByEmail(
  pool: Pool,
  email: string
): Promise<Employee | null> {
  const result = await pool.query<EmployeeRow>(
    "SELECT * FROM employees WHERE email = $1",
    [email]
  );

  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

// Codes are zero-padded (EMP-00001, EMP-00002, ...) so a plain string sort
// matches numeric order. Reads the current max under the same transaction
// as the insert that follows, to narrow (not eliminate) the race window -
// acceptable given the single-HR-Manager persona this system is built for.
export async function nextEmployeeCode(db: Queryable): Promise<string> {
  const result = await db.query<{ employee_code: string }>(
    "SELECT employee_code FROM employees ORDER BY employee_code DESC LIMIT 1"
  );

  const last = result.rows[0]?.employee_code;
  const lastNumber = last ? Number(last.replace(/^EMP-/, "")) : 0;
  return `EMP-${String(lastNumber + 1).padStart(5, "0")}`;
}

export interface NewEmployeeInput {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  department: string;
  roleTitle: string;
  level: string;
  currency: string;
  salaryAmount: number;
  hireDate: string;
}

export async function createEmployee(
  db: Queryable,
  input: NewEmployeeInput
): Promise<Employee> {
  const id = crypto.randomUUID();

  const result = await db.query<EmployeeRow>(
    `INSERT INTO employees
      (id, employee_code, first_name, last_name, email, country, department, role_title, level, currency, salary_amount, hire_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active')
     RETURNING *`,
    [
      id,
      input.employeeCode,
      input.firstName,
      input.lastName,
      input.email,
      input.country,
      input.department,
      input.roleTitle,
      input.level,
      input.currency,
      input.salaryAmount,
      input.hireDate,
    ]
  );

  return mapRow(result.rows[0]!);
}

export async function updateEmployeeSalary(
  db: Queryable,
  id: string,
  update: { salaryAmount: number; currency: string }
): Promise<Employee> {
  const result = await db.query<EmployeeRow>(
    `UPDATE employees
     SET salary_amount = $1, currency = $2, updated_at = now()
     WHERE id = $3
     RETURNING *`,
    [update.salaryAmount, update.currency, id]
  );

  return mapRow(result.rows[0]!);
}

export interface EmployeeOptions {
  countries: string[];
  departments: string[];
  levels: string[];
}

// Sourced live from the table rather than a maintained list, so the create
// form and the filter dropdowns can never drift from what the database
// actually contains (or from each other).
export async function findEmployeeOptions(pool: Pool): Promise<EmployeeOptions> {
  const [countries, departments, levels] = await Promise.all([
    pool.query<{ country: string }>(
      "SELECT DISTINCT country FROM employees ORDER BY country"
    ),
    pool.query<{ department: string }>(
      "SELECT DISTINCT department FROM employees ORDER BY department"
    ),
    pool.query<{ level: string }>("SELECT DISTINCT level FROM employees ORDER BY level"),
  ]);

  return {
    countries: countries.rows.map((row) => row.country),
    departments: departments.rows.map((row) => row.department),
    levels: levels.rows.map((row) => row.level),
  };
}

export async function findEmployees(
  pool: Pool,
  filters: EmployeeFilters,
  pagination: PaginationParams
): Promise<PaginatedEmployees> {
  const { clause, values } = buildWhereClause(filters);
  const offset = (pagination.page - 1) * pagination.pageSize;

  const dataResult = await pool.query<EmployeeRow>(
    `SELECT * FROM employees ${clause}
     ORDER BY employee_code ASC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.pageSize, offset]
  );

  const countResult = await pool.query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM employees ${clause}`,
    values
  );

  const total = Number(countResult.rows[0]?.total ?? 0);

  return {
    data: dataResult.rows.map(mapRow),
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  };
}
