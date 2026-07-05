import request from "supertest";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import { createTestPool } from "./helpers/testDb";
import { insertEmployee, insertSalaryHistory } from "./helpers/fixtures";

describe("PATCH /employees/:id/salary", () => {
  let pool: Pool;

  beforeEach(async () => {
    pool = await createTestPool();
  });

  async function seedActiveEmployee(): Promise<string> {
    const employeeId = await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      currency: "INR",
      salaryAmount: 1_000_000,
      hireDate: "2022-01-01",
      status: "active",
    });
    await insertSalaryHistory(pool, {
      employeeId,
      salaryAmount: 1_000_000,
      currency: "INR",
      effectiveDate: "2022-01-01",
      reason: "Initial hire",
    });
    return employeeId;
  }

  it("updates the employee's salary and appends a salary_history row", async () => {
    const employeeId = await seedActiveEmployee();
    const app = createApp(pool);

    const res = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({
        salaryAmount: 1_200_000,
        effectiveDate: "2024-01-01",
        reason: "Annual increment",
      });

    expect(res.status).toBe(200);
    expect(res.body.salaryAmount).toBe(1_200_000);
    expect(res.body.currency).toBe("INR");
    expect(res.body.salaryHistory).toHaveLength(2);
    expect(res.body.salaryHistory[1]).toMatchObject({
      salaryAmount: 1_200_000,
      currency: "INR",
      effectiveDate: "2024-01-01",
      reason: "Annual increment",
    });

    const employeeRow = await pool.query("SELECT salary_amount FROM employees WHERE id = $1", [
      employeeId,
    ]);
    expect(Number(employeeRow.rows[0]?.salary_amount)).toBe(1_200_000);
  });

  it("accepts an explicit currency and updates the employee's currency too", async () => {
    const employeeId = await seedActiveEmployee();
    const app = createApp(pool);

    const res = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({
        salaryAmount: 90_000,
        currency: "USD",
        effectiveDate: "2024-06-01",
        reason: "Relocation",
      });

    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("USD");
    expect(res.body.salaryHistory[1]).toMatchObject({ currency: "USD" });
  });

  it("allows an effectiveDate equal to the most recent entry (same-day correction)", async () => {
    const employeeId = await seedActiveEmployee();
    const app = createApp(pool);

    const res = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({
        salaryAmount: 1_050_000,
        effectiveDate: "2022-01-01",
        reason: "Payroll correction",
      });

    expect(res.status).toBe(200);
  });

  it("returns 400 and makes no changes when effectiveDate is before the latest salary_history entry", async () => {
    const employeeId = await seedActiveEmployee();
    const app = createApp(pool);

    const res = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({
        salaryAmount: 1_100_000,
        effectiveDate: "2021-06-01",
        reason: "Backdated raise",
      });

    expect(res.status).toBe(400);

    const historyCount = await pool.query(
      "SELECT COUNT(*) AS count FROM salary_history WHERE employee_id = $1",
      [employeeId]
    );
    expect(Number(historyCount.rows[0]?.count)).toBe(1);

    const employeeRow = await pool.query("SELECT salary_amount FROM employees WHERE id = $1", [
      employeeId,
    ]);
    expect(Number(employeeRow.rows[0]?.salary_amount)).toBe(1_000_000);
  });

  it("returns 400 and makes no changes for an inactive employee", async () => {
    const employeeId = await insertEmployee(pool, {
      employeeCode: "EMP-00002",
      status: "inactive",
      salaryAmount: 500_000,
    });
    const app = createApp(pool);

    const res = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({
        salaryAmount: 600_000,
        effectiveDate: "2024-01-01",
        reason: "Annual increment",
      });

    expect(res.status).toBe(400);

    const historyCount = await pool.query(
      "SELECT COUNT(*) AS count FROM salary_history WHERE employee_id = $1",
      [employeeId]
    );
    expect(Number(historyCount.rows[0]?.count)).toBe(0);
  });

  it("returns 404 for a well-formed id that doesn't exist", async () => {
    const app = createApp(pool);

    const res = await request(app)
      .patch("/employees/00000000-0000-0000-0000-000000000000/salary")
      .send({ salaryAmount: 100, effectiveDate: "2024-01-01", reason: "x" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed id", async () => {
    const app = createApp(pool);

    const res = await request(app)
      .patch("/employees/not-a-uuid/salary")
      .send({ salaryAmount: 100, effectiveDate: "2024-01-01", reason: "x" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid body (non-positive salaryAmount, missing reason, bad date)", async () => {
    const employeeId = await seedActiveEmployee();
    const app = createApp(pool);

    const badSalary = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({ salaryAmount: -5, effectiveDate: "2024-01-01", reason: "x" });
    expect(badSalary.status).toBe(400);

    const missingReason = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({ salaryAmount: 100, effectiveDate: "2024-01-01" });
    expect(missingReason.status).toBe(400);

    const badDate = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({ salaryAmount: 100, effectiveDate: "not-a-date", reason: "x" });
    expect(badDate.status).toBe(400);
  });
});
