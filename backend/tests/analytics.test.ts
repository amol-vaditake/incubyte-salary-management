import request from "supertest";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import { createTestPool } from "./helpers/testDb";
import { insertEmployee } from "./helpers/fixtures";

describe("GET /analytics/summary", () => {
  let pool: Pool;

  beforeEach(async () => {
    pool = await createTestPool();

    // Engineering/India/INR: 100000, 200000, 300000 -> avg 200000, count 3
    await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      country: "India",
      department: "Engineering",
      level: "Junior",
      currency: "INR",
      salaryAmount: 100_000,
      status: "active",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00002",
      country: "India",
      department: "Engineering",
      level: "Mid",
      currency: "INR",
      salaryAmount: 200_000,
      status: "active",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00003",
      country: "India",
      department: "Engineering",
      level: "Senior",
      currency: "INR",
      salaryAmount: 300_000,
      status: "active",
    });
    // Sales/India/INR: 400000 -> avg 400000, count 1
    await insertEmployee(pool, {
      employeeCode: "EMP-00004",
      country: "India",
      department: "Sales",
      level: "Mid",
      currency: "INR",
      salaryAmount: 400_000,
      status: "active",
    });
    // Engineering/USA/USD: 100, 200 -> avg 150, count 2
    await insertEmployee(pool, {
      employeeCode: "EMP-00005",
      country: "USA",
      department: "Engineering",
      level: "Mid",
      currency: "USD",
      salaryAmount: 100,
      status: "active",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00006",
      country: "USA",
      department: "Engineering",
      level: "Lead",
      currency: "USD",
      salaryAmount: 200,
      status: "active",
    });
    // Inactive - must be excluded from every aggregate, and would badly
    // skew Engineering/INR and India/INR averages if it leaked in.
    await insertEmployee(pool, {
      employeeCode: "EMP-00007",
      country: "India",
      department: "Engineering",
      level: "Senior",
      currency: "INR",
      salaryAmount: 999_999_999,
      status: "inactive",
    });
  });

  it("computes average salary by department, grouped by currency", async () => {
    const app = createApp(pool);
    const res = await request(app).get("/analytics/summary");

    expect(res.status).toBe(200);
    expect(res.body.averageSalaryByDepartment).toEqual(
      expect.arrayContaining([
        { department: "Engineering", currency: "INR", averageSalary: 200_000, count: 3 },
        { department: "Engineering", currency: "USD", averageSalary: 150, count: 2 },
        { department: "Sales", currency: "INR", averageSalary: 400_000, count: 1 },
      ])
    );
    expect(res.body.averageSalaryByDepartment).toHaveLength(3);
  });

  it("computes average salary by country, grouped by currency", async () => {
    const app = createApp(pool);
    const res = await request(app).get("/analytics/summary");

    expect(res.status).toBe(200);
    expect(res.body.averageSalaryByCountry).toEqual(
      expect.arrayContaining([
        { country: "India", currency: "INR", averageSalary: 250_000, count: 4 },
        { country: "USA", currency: "USD", averageSalary: 150, count: 2 },
      ])
    );
    expect(res.body.averageSalaryByCountry).toHaveLength(2);
  });

  it("computes headcount by department", async () => {
    const app = createApp(pool);
    const res = await request(app).get("/analytics/summary");

    expect(res.status).toBe(200);
    expect(res.body.headcountByDepartment).toEqual(
      expect.arrayContaining([
        { department: "Engineering", count: 5 },
        { department: "Sales", count: 1 },
      ])
    );
    expect(res.body.headcountByDepartment).toHaveLength(2);
  });

  it("computes headcount by level", async () => {
    const app = createApp(pool);
    const res = await request(app).get("/analytics/summary");

    expect(res.status).toBe(200);
    expect(res.body.headcountByLevel).toEqual(
      expect.arrayContaining([
        { level: "Junior", count: 1 },
        { level: "Mid", count: 3 },
        { level: "Senior", count: 1 },
        { level: "Lead", count: 1 },
      ])
    );
    expect(res.body.headcountByLevel).toHaveLength(4);
  });

  it("excludes inactive employees from every aggregate", async () => {
    const app = createApp(pool);
    const res = await request(app).get("/analytics/summary");

    const totalHeadcount = res.body.headcountByDepartment.reduce(
      (sum: number, row: { count: number }) => sum + row.count,
      0
    );
    expect(totalHeadcount).toBe(6);

    const engineeringInr = res.body.averageSalaryByDepartment.find(
      (row: { department: string; currency: string }) =>
        row.department === "Engineering" && row.currency === "INR"
    );
    expect(engineeringInr.averageSalary).toBe(200_000);
    expect(engineeringInr.count).toBe(3);
  });
});
