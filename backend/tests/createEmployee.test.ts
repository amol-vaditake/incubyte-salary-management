import request from "supertest";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import { createTestPool } from "./helpers/testDb";
import { insertEmployee } from "./helpers/fixtures";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@example.com",
    country: "India",
    department: "Engineering",
    roleTitle: "Senior Engineer",
    level: "Senior",
    currency: "INR",
    salaryAmount: 1_800_000,
    hireDate: "2026-07-01",
    ...overrides,
  };
}

describe("POST /employees", () => {
  let pool: Pool;

  beforeEach(async () => {
    pool = await createTestPool();
  });

  it("creates an employee with a server-generated id, the next sequential employee_code, default active status, and an initial salary_history row", async () => {
    await insertEmployee(pool, { employeeCode: "EMP-00005" });
    const app = createApp(pool);

    const res = await request(app).post("/employees").send(validBody());

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(res.body.employeeCode).toBe("EMP-00006");
    expect(res.body.status).toBe("active");
    expect(res.body.firstName).toBe("Priya");
    expect(res.body.salaryHistory).toHaveLength(1);
    expect(res.body.salaryHistory[0]).toMatchObject({
      salaryAmount: 1_800_000,
      currency: "INR",
      effectiveDate: "2026-07-01",
      reason: "Initial hire",
    });

    const employeeRow = await pool.query("SELECT * FROM employees WHERE id = $1", [
      res.body.id,
    ]);
    expect(employeeRow.rows).toHaveLength(1);
    expect(employeeRow.rows[0]?.employee_code).toBe("EMP-00006");

    const historyRow = await pool.query(
      "SELECT * FROM salary_history WHERE employee_id = $1",
      [res.body.id]
    );
    expect(historyRow.rows).toHaveLength(1);
    expect(historyRow.rows[0]?.reason).toBe("Initial hire");
  });

  it("generates EMP-00001 as the first employee_code in an empty table", async () => {
    const app = createApp(pool);

    const res = await request(app).post("/employees").send(validBody());

    expect(res.status).toBe(201);
    expect(res.body.employeeCode).toBe("EMP-00001");
  });

  it("returns 409 and does not create a row when the email already exists", async () => {
    await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      email: "priya.nair@example.com",
    });
    const app = createApp(pool);

    const res = await request(app).post("/employees").send(validBody());

    expect(res.status).toBe(409);

    const countResult = await pool.query("SELECT COUNT(*) AS count FROM employees");
    expect(Number(countResult.rows[0]?.count)).toBe(1);
  });

  it.each([
    ["firstName", { firstName: undefined }],
    ["lastName", { lastName: "" }],
    ["email", { email: "not-an-email" }],
    ["country", { country: undefined }],
    ["department", { department: undefined }],
    ["roleTitle", { roleTitle: undefined }],
    ["level", { level: undefined }],
    ["currency", { currency: undefined }],
    ["salaryAmount", { salaryAmount: -1 }],
    ["hireDate", { hireDate: "not-a-date" }],
  ])("returns 400 when %s is missing or invalid", async (_field, overrides) => {
    const app = createApp(pool);

    const res = await request(app).post("/employees").send(validBody(overrides));

    expect(res.status).toBe(400);
  });
});
