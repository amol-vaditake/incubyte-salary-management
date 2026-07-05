import type { Pool } from "pg";

export interface AverageSalaryByDepartment {
  department: string;
  currency: string;
  averageSalary: number;
  count: number;
}

export interface AverageSalaryByCountry {
  country: string;
  currency: string;
  averageSalary: number;
  count: number;
}

export interface HeadcountByDepartment {
  department: string;
  count: number;
}

export interface HeadcountByLevel {
  level: string;
  count: number;
}

export interface AnalyticsSummary {
  averageSalaryByDepartment: AverageSalaryByDepartment[];
  averageSalaryByCountry: AverageSalaryByCountry[];
  headcountByDepartment: HeadcountByDepartment[];
  headcountByLevel: HeadcountByLevel[];
}

// Rounds an already-aggregated (one row per group, not per employee) average
// to 2 decimal places in JS rather than SQL's ROUND(numeric, integer) -
// pg-mem doesn't implement that overload ("function round(bigint, integer)
// does not exist"), and rounding a handful of group rows client-side is
// negligible cost, unlike pulling all 10k+ raw rows into JS would be.
function roundToTwoDecimals(value: string): number {
  return Math.round(Number(value) * 100) / 100;
}

// Every aggregate is scoped to active employees only - this answers "how do
// we currently pay people", and inactive (former) employees would otherwise
// skew the averages. Salary averages are grouped by currency as well as
// department/country, since neither department nor country maps 1:1 to a
// single currency (that's only true of the current seed data, not something
// the schema enforces) - a blended cross-currency average would be
// meaningless, consistent with this project's no-currency-conversion stance.
export async function getAnalyticsSummary(pool: Pool): Promise<AnalyticsSummary> {
  const [byDepartment, byCountry, headcountDept, headcountLevel] = await Promise.all([
    pool.query<{
      department: string;
      currency: string;
      average_salary: string;
      count: string;
    }>(
      `SELECT department, currency, AVG(salary_amount) AS average_salary, COUNT(*) AS count
       FROM employees
       WHERE status = 'active'
       GROUP BY department, currency
       ORDER BY department, currency`
    ),
    pool.query<{
      country: string;
      currency: string;
      average_salary: string;
      count: string;
    }>(
      `SELECT country, currency, AVG(salary_amount) AS average_salary, COUNT(*) AS count
       FROM employees
       WHERE status = 'active'
       GROUP BY country, currency
       ORDER BY country, currency`
    ),
    pool.query<{ department: string; count: string }>(
      `SELECT department, COUNT(*) AS count
       FROM employees
       WHERE status = 'active'
       GROUP BY department
       ORDER BY department`
    ),
    pool.query<{ level: string; count: string }>(
      `SELECT level, COUNT(*) AS count
       FROM employees
       WHERE status = 'active'
       GROUP BY level
       ORDER BY level`
    ),
  ]);

  return {
    averageSalaryByDepartment: byDepartment.rows.map((row) => ({
      department: row.department,
      currency: row.currency,
      averageSalary: roundToTwoDecimals(row.average_salary),
      count: Number(row.count),
    })),
    averageSalaryByCountry: byCountry.rows.map((row) => ({
      country: row.country,
      currency: row.currency,
      averageSalary: roundToTwoDecimals(row.average_salary),
      count: Number(row.count),
    })),
    headcountByDepartment: headcountDept.rows.map((row) => ({
      department: row.department,
      count: Number(row.count),
    })),
    headcountByLevel: headcountLevel.rows.map((row) => ({
      level: row.level,
      count: Number(row.count),
    })),
  };
}
