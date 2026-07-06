import request from "supertest";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import { createTestPool } from "./helpers/testDb";
import { insertEmployee } from "./helpers/fixtures";

describe("GET /employees/options", () => {
  let pool: Pool;

  beforeEach(async () => {
    pool = await createTestPool();
  });

  it("returns distinct, sorted countries/departments/levels actually present in the data - not a hardcoded list", async () => {
    await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      country: "India",
      department: "Engineering",
      level: "Senior",
    });
    // Duplicates of the same values must collapse to one entry each.
    await insertEmployee(pool, {
      employeeCode: "EMP-00002",
      country: "India",
      department: "Engineering",
      level: "Junior",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00003",
      country: "USA",
      department: "Sales",
      level: "Mid",
    });

    const app = createApp(pool);
    const res = await request(app).get("/employees/options");

    expect(res.status).toBe(200);
    expect(res.body.countries).toEqual(["India", "USA"]);
    expect(res.body.departments).toEqual(["Engineering", "Sales"]);
    expect(res.body.levels).toEqual(["Junior", "Mid", "Senior"]);
  });

  it("returns empty arrays when there are no employees yet", async () => {
    const app = createApp(pool);
    const res = await request(app).get("/employees/options");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ countries: [], departments: [], levels: [] });
  });

  it("reflects a department that exists in the data but isn't in any hardcoded list", async () => {
    // Simulates the real bug: a value present in the database that a
    // frontend-hardcoded array might not (yet) include - this endpoint must
    // still surface it, since it reads directly from the table.
    await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      country: "Brazil",
      department: "Legal",
      level: "Staff",
    });

    const app = createApp(pool);
    const res = await request(app).get("/employees/options");

    expect(res.status).toBe(200);
    expect(res.body.countries).toContain("Brazil");
    expect(res.body.departments).toContain("Legal");
    expect(res.body.levels).toContain("Staff");
  });
});
