import { generateEmployees } from "../../src/seed/generateEmployees";
import {
  COUNTRIES,
  DEPARTMENTS,
  LEVELS,
  CURRENCY_BY_COUNTRY,
  SALARY_BANDS,
} from "../../src/seed/salaryBands";

describe("generateEmployees", () => {
  it("generates exactly the requested number of employees", () => {
    const employees = generateEmployees(500);
    expect(employees).toHaveLength(500);
  });

  it("assigns unique, sequential, zero-padded employee codes", () => {
    const employees = generateEmployees(50);
    const expectedCodes = Array.from(
      { length: 50 },
      (_, i) => `EMP-${String(i + 1).padStart(5, "0")}`
    );

    expect(employees.map((e) => e.employeeCode)).toEqual(expectedCodes);
  });

  it("assigns unique emails and ids", () => {
    const employees = generateEmployees(500);

    expect(new Set(employees.map((e) => e.email)).size).toBe(500);
    expect(new Set(employees.map((e) => e.id)).size).toBe(500);
  });

  it("pairs each employee's currency with their country", () => {
    const employees = generateEmployees(500);

    for (const employee of employees) {
      expect(employee.currency).toBe(CURRENCY_BY_COUNTRY[employee.country]);
    }
  });

  it("keeps salaryAmount within the band for the employee's country and level", () => {
    const employees = generateEmployees(1000);

    for (const employee of employees) {
      const [min, max] = SALARY_BANDS[employee.country][employee.level];
      expect(employee.salaryAmount).toBeGreaterThanOrEqual(min);
      expect(employee.salaryAmount).toBeLessThanOrEqual(max);
    }
  });

  it("only uses the defined countries, departments, and levels", () => {
    const employees = generateEmployees(1000);

    for (const employee of employees) {
      expect(COUNTRIES).toContain(employee.country);
      expect(DEPARTMENTS).toContain(employee.department);
      expect(LEVELS).toContain(employee.level);
    }
  });

  it("produces a hireDate in the past, formatted as YYYY-MM-DD", () => {
    const employees = generateEmployees(200);
    const today = new Date();

    for (const employee of employees) {
      expect(employee.hireDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(employee.hireDate).getTime()).toBeLessThan(today.getTime());
    }
  });

  it("marks a small minority of employees as inactive, the rest active", () => {
    const employees = generateEmployees(2000);

    const statuses = new Set(employees.map((e) => e.status));
    expect(statuses).toEqual(new Set(["active", "inactive"]));

    const inactiveCount = employees.filter((e) => e.status === "inactive").length;
    expect(inactiveCount).toBeGreaterThan(0);
    expect(inactiveCount).toBeLessThan(employees.length * 0.2);
  });

  it("uses every defined country, department, and level at a scale of 1000", () => {
    const employees = generateEmployees(1000);

    expect(new Set(employees.map((e) => e.country))).toEqual(new Set(COUNTRIES));
    expect(new Set(employees.map((e) => e.department))).toEqual(
      new Set(DEPARTMENTS)
    );
    expect(new Set(employees.map((e) => e.level))).toEqual(new Set(LEVELS));
  });
});
