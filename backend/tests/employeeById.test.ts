import request from "supertest";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import { createTestPool } from "./helpers/testDb";
import { insertEmployee, insertSalaryHistory } from "./helpers/fixtures";

describe("GET /employees/:id", () => {
  let pool: Pool;

  beforeEach(async () => {
    pool = await createTestPool();
  });

  it("returns the employee with salary history ordered by effective_date ascending", async () => {
    const employeeId = await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      salaryAmount: 1500000,
    });
    await insertSalaryHistory(pool, {
      employeeId,
      salaryAmount: 1500000,
      effectiveDate: "2024-01-01",
      reason: "Annual increment",
    });
    await insertSalaryHistory(pool, {
      employeeId,
      salaryAmount: 1000000,
      effectiveDate: "2022-01-01",
      reason: "Initial hire",
    });
    await insertSalaryHistory(pool, {
      employeeId,
      salaryAmount: 1200000,
      effectiveDate: "2023-01-01",
      reason: "Promotion",
    });

    const app = createApp(pool);
    const res = await request(app).get(`/employees/${employeeId}`);

    expect(res.status).toBe(200);
    expect(res.body.employeeCode).toBe("EMP-00001");
    expect(res.body.salaryHistory.map((h: { reason: string }) => h.reason)).toEqual([
      "Initial hire",
      "Promotion",
      "Annual increment",
    ]);
    expect(
      res.body.salaryHistory.map((h: { effectiveDate: string }) => h.effectiveDate)
    ).toEqual(["2022-01-01", "2023-01-01", "2024-01-01"]);
  });

  it("returns an employee with no salary history as an empty array", async () => {
    const employeeId = await insertEmployee(pool, { employeeCode: "EMP-00002" });

    const app = createApp(pool);
    const res = await request(app).get(`/employees/${employeeId}`);

    expect(res.status).toBe(200);
    expect(res.body.salaryHistory).toEqual([]);
  });

  it("returns an inactive employee rather than 404ing", async () => {
    const employeeId = await insertEmployee(pool, {
      employeeCode: "EMP-00003",
      status: "inactive",
    });

    const app = createApp(pool);
    const res = await request(app).get(`/employees/${employeeId}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("inactive");
  });

  it("returns 404 for a well-formed id that doesn't exist", async () => {
    const app = createApp(pool);

    const res = await request(app).get(
      "/employees/00000000-0000-0000-0000-000000000000"
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed id", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees/not-a-uuid");

    expect(res.status).toBe(400);
  });
});
