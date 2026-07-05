import crypto from "node:crypto";
import type { Pool } from "pg";
import { toDateOnlyString } from "../db/dateOnly";

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  salaryAmount: number;
  currency: string;
  effectiveDate: string;
  reason: string;
  createdAt: string;
}

interface SalaryHistoryRow {
  id: string;
  employee_id: string;
  salary_amount: string;
  currency: string;
  effective_date: string | Date;
  reason: string;
  created_at: string;
}

function mapRow(row: SalaryHistoryRow): SalaryHistoryRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    salaryAmount: Number(row.salary_amount),
    currency: row.currency,
    effectiveDate: toDateOnlyString(row.effective_date),
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export interface NewSalaryHistoryEntry {
  employeeId: string;
  salaryAmount: number;
  currency: string;
  effectiveDate: string;
  reason: string;
}

export async function createSalaryHistoryEntry(
  pool: Pool,
  entry: NewSalaryHistoryEntry
): Promise<SalaryHistoryRecord> {
  const result = await pool.query<SalaryHistoryRow>(
    `INSERT INTO salary_history (id, employee_id, salary_amount, currency, effective_date, reason)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      crypto.randomUUID(),
      entry.employeeId,
      entry.salaryAmount,
      entry.currency,
      entry.effectiveDate,
      entry.reason,
    ]
  );

  return mapRow(result.rows[0]!);
}

export async function findSalaryHistoryByEmployeeId(
  pool: Pool,
  employeeId: string
): Promise<SalaryHistoryRecord[]> {
  const result = await pool.query<SalaryHistoryRow>(
    `SELECT * FROM salary_history WHERE employee_id = $1 ORDER BY effective_date ASC`,
    [employeeId]
  );

  return result.rows.map(mapRow);
}
