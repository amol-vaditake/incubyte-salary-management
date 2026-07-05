import type { Pool } from "pg";
import { createTestPool } from "../helpers/testDb";
import { seedDatabase } from "../../src/seed/seedDatabase";

const EMPLOYEE_COUNT = 10_000;

describe("seedDatabase", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = await createTestPool();
    await seedDatabase(pool, EMPLOYEE_COUNT);
  }, 120_000);

  it("inserts exactly the requested number of employees", async () => {
    const result = await pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM employees"
    );
    expect(Number(result.rows[0]?.count)).toBe(EMPLOYEE_COUNT);
  });

  it("inserts exactly one salary_history row per employee", async () => {
    const result = await pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM salary_history"
    );
    expect(Number(result.rows[0]?.count)).toBe(EMPLOYEE_COUNT);
  });

  it("gives every salary_history row a valid employee_id and 'Initial hire' reason", async () => {
    const orphaned = await pool.query(
      `SELECT sh.id FROM salary_history sh
       LEFT JOIN employees e ON e.id = sh.employee_id
       WHERE e.id IS NULL`
    );
    expect(orphaned.rows).toHaveLength(0);

    const wrongReason = await pool.query(
      `SELECT id FROM salary_history WHERE reason != 'Initial hire'`
    );
    expect(wrongReason.rows).toHaveLength(0);
  });

  it("gives every employee's initial salary_history row a matching amount and effective_date", async () => {
    const mismatched = await pool.query(
      `SELECT sh.id FROM salary_history sh
       JOIN employees e ON e.id = sh.employee_id
       WHERE sh.salary_amount != e.salary_amount
          OR sh.currency != e.currency
          OR sh.effective_date != e.hire_date`
    );
    expect(mismatched.rows).toHaveLength(0);
  });

  it("is idempotent - re-running it does not duplicate rows", async () => {
    await seedDatabase(pool, EMPLOYEE_COUNT);

    const employeesResult = await pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM employees"
    );
    const historyResult = await pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM salary_history"
    );

    expect(Number(employeesResult.rows[0]?.count)).toBe(EMPLOYEE_COUNT);
    expect(Number(historyResult.rows[0]?.count)).toBe(EMPLOYEE_COUNT);
  }, 120_000);
});
