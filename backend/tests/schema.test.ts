import { createTestPool } from "./helpers/testDb";

describe("database schema", () => {
  it("allows inserting and reading back an employee with salary history", async () => {
    const pool = await createTestPool();

    await pool.query(
      `INSERT INTO employees
        (id, employee_code, first_name, last_name, email, country, department, role_title, level, currency, salary_amount, hire_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        "11111111-1111-1111-1111-111111111111",
        "EMP-00001",
        "Asha",
        "Rao",
        "asha.rao@example.com",
        "India",
        "Engineering",
        "Senior Engineer",
        "Senior",
        "INR",
        1800000,
        "2022-01-15",
        "active",
      ]
    );

    await pool.query(
      `INSERT INTO salary_history
        (id, employee_id, salary_amount, currency, effective_date, reason)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        "22222222-2222-2222-2222-222222222222",
        "11111111-1111-1111-1111-111111111111",
        1800000,
        "INR",
        "2022-01-15",
        "Initial hire",
      ]
    );

    const employeeResult = await pool.query(
      `SELECT * FROM employees WHERE employee_code = $1`,
      ["EMP-00001"]
    );
    const historyResult = await pool.query(
      `SELECT * FROM salary_history WHERE employee_id = $1`,
      ["11111111-1111-1111-1111-111111111111"]
    );

    expect(employeeResult.rows).toHaveLength(1);
    expect(employeeResult.rows[0].status).toBe("active");
    expect(historyResult.rows).toHaveLength(1);
    expect(historyResult.rows[0].reason).toBe("Initial hire");
  });

  it("rejects a salary_history row for a non-existent employee", async () => {
    const pool = await createTestPool();

    await expect(
      pool.query(
        `INSERT INTO salary_history
          (id, employee_id, salary_amount, currency, effective_date, reason)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          "33333333-3333-3333-3333-333333333333",
          "99999999-9999-9999-9999-999999999999",
          1000,
          "INR",
          "2022-01-15",
          "Initial hire",
        ]
      )
    ).rejects.toThrow();
  });
});
