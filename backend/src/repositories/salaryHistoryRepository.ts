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
