import crypto from "node:crypto";
import { faker } from "@faker-js/faker";
import {
  COUNTRY_WEIGHTS,
  DEPARTMENT_WEIGHTS,
  LEVEL_WEIGHTS,
  CURRENCY_BY_COUNTRY,
  ROLE_TITLE_BY_DEPARTMENT,
  SALARY_BANDS,
  TENURE_YEARS_BY_LEVEL,
  INACTIVE_STATUS_RATE,
  type Country,
  type Department,
  type Level,
} from "./salaryBands";

export interface SeedEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: Country;
  department: Department;
  roleTitle: string;
  level: Level;
  currency: string;
  salaryAmount: number;
  hireDate: string;
  status: "active" | "inactive";
}

function pickWeighted<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;

  for (const [key, weight] of entries) {
    if (roll < weight) return key;
    roll -= weight;
  }

  return entries[entries.length - 1]![0];
}

function randomIntInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToNearestWithinBand(value: number, step: number, min: number, max: number): number {
  const rounded = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, rounded));
}

function randomHireDate(level: Level): string {
  const [minYears, maxYears] = TENURE_YEARS_BY_LEVEL[level];
  const daysAgo = randomIntInRange(minYears * 365, maxYears * 365);

  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function buildEmail(firstName: string, lastName: string, employeeCode: string): string {
  return `${slugify(firstName)}.${slugify(lastName)}.${employeeCode.toLowerCase()}@acmecorp.example`;
}

export function generateEmployees(count: number): SeedEmployee[] {
  const employees: SeedEmployee[] = [];

  for (let i = 0; i < count; i++) {
    const employeeCode = `EMP-${String(i + 1).padStart(5, "0")}`;
    const country = pickWeighted(COUNTRY_WEIGHTS);
    const department = pickWeighted(DEPARTMENT_WEIGHTS);
    const level = pickWeighted(LEVEL_WEIGHTS);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const [min, max] = SALARY_BANDS[country][level];
    const salaryAmount = roundToNearestWithinBand(
      randomIntInRange(min, max),
      500,
      min,
      max
    );

    employees.push({
      id: crypto.randomUUID(),
      employeeCode,
      firstName,
      lastName,
      email: buildEmail(firstName, lastName, employeeCode),
      country,
      department,
      roleTitle: `${level} ${ROLE_TITLE_BY_DEPARTMENT[department]}`,
      level,
      currency: CURRENCY_BY_COUNTRY[country],
      salaryAmount,
      hireDate: randomHireDate(level),
      status: Math.random() < INACTIVE_STATUS_RATE ? "inactive" : "active",
    });
  }

  return employees;
}
