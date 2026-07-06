import request from "supertest";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import { createTestPool } from "./helpers/testDb";
import { insertEmployee } from "./helpers/fixtures";

describe("GET /employees", () => {
  let pool: Pool;

  beforeEach(async () => {
    pool = await createTestPool();

    await insertEmployee(pool, {
      employeeCode: "EMP-00001",
      country: "India",
      department: "Engineering",
      status: "active",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00002",
      country: "India",
      department: "Sales",
      status: "active",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00003",
      country: "USA",
      department: "Engineering",
      status: "active",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00004",
      country: "USA",
      department: "Engineering",
      status: "inactive",
    });
    await insertEmployee(pool, {
      employeeCode: "EMP-00005",
      country: "UK",
      department: "HR",
      status: "active",
    });
  });

  it("search matches a substring of first or last name, case-insensitively", async () => {
    await insertEmployee(pool, {
      employeeCode: "EMP-00006",
      firstName: "Priya",
      lastName: "Nair",
      email: "priya.nair@acme.example",
      country: "India",
      department: "Finance",
      status: "active",
    });
    const app = createApp(pool);

    const res = await request(app).get("/employees?search=riy");

    expect(res.status).toBe(200);
    expect(res.body.data.map((e: { employeeCode: string }) => e.employeeCode)).toEqual([
      "EMP-00006",
    ]);
  });

  it("search matches a substring of email", async () => {
    await insertEmployee(pool, {
      employeeCode: "EMP-00006",
      firstName: "Priya",
      lastName: "Nair",
      email: "priya.nair@acme.example",
      country: "India",
      department: "Finance",
      status: "active",
    });
    const app = createApp(pool);

    const res = await request(app).get("/employees?search=acme.example");

    expect(res.status).toBe(200);
    expect(res.body.data.map((e: { employeeCode: string }) => e.employeeCode)).toEqual([
      "EMP-00006",
    ]);
  });

  it("returns a paginated page of employees ordered by employee_code", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees?page=1&pageSize=2");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((e: { employeeCode: string }) => e.employeeCode)).toEqual([
      "EMP-00001",
      "EMP-00002",
    ]);
    expect(res.body.pagination).toEqual({
      page: 1,
      pageSize: 2,
      total: 5,
      totalPages: 3,
    });
  });

  it("returns the second page when requested", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees?page=2&pageSize=2");

    expect(res.status).toBe(200);
    expect(res.body.data.map((e: { employeeCode: string }) => e.employeeCode)).toEqual([
      "EMP-00003",
      "EMP-00004",
    ]);
  });

  it("defaults to page 1 with a default page size when no query params are given", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.pagination.page).toBe(1);
  });

  it("filters by country", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees?country=India");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(
      res.body.data.every((e: { country: string }) => e.country === "India")
    ).toBe(true);
  });

  it("filters by department and status together", async () => {
    const app = createApp(pool);

    const res = await request(app).get(
      "/employees?department=Engineering&status=active"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.map((e: { employeeCode: string }) => e.employeeCode)).toEqual([
      "EMP-00001",
      "EMP-00003",
    ]);
  });

  it("returns an empty page when no employees match the filters", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees?country=Germany");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it("returns 400 for a non-positive page", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees?page=0");

    expect(res.status).toBe(400);
  });

  it("returns 400 for a pageSize exceeding the maximum", async () => {
    const app = createApp(pool);

    const res = await request(app).get("/employees?pageSize=1000");

    expect(res.status).toBe(400);
  });
});
