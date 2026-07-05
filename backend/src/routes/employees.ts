import { Router } from "express";
import type { Pool } from "pg";
import {
  createEmployee,
  findEmployeeByEmail,
  findEmployeeById,
  findEmployees,
  nextEmployeeCode,
  updateEmployeeSalary,
} from "../repositories/employeeRepository";
import {
  createSalaryHistoryEntry,
  findSalaryHistoryByEmployeeId,
} from "../repositories/salaryHistoryRepository";
import { withTransaction } from "../db/transaction";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface SalaryUpdateInput {
  salaryAmount: number;
  currency: string;
  effectiveDate: string;
  reason: string;
}

function parseSalaryUpdateBody(
  body: unknown,
  currentCurrency: string
): SalaryUpdateInput | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "request body is required" };
  }

  const { salaryAmount, currency, effectiveDate, reason } =
    body as Record<string, unknown>;

  if (typeof salaryAmount !== "number" || !Number.isFinite(salaryAmount) || salaryAmount <= 0) {
    return { error: "salaryAmount must be a positive number" };
  }
  if (currency !== undefined && (typeof currency !== "string" || currency.length === 0)) {
    return { error: "currency must be a non-empty string" };
  }
  if (typeof effectiveDate !== "string" || !DATE_PATTERN.test(effectiveDate)) {
    return { error: "effectiveDate must be a valid date in YYYY-MM-DD format" };
  }
  if (typeof reason !== "string" || reason.trim().length === 0) {
    return { error: "reason is required" };
  }

  return {
    salaryAmount,
    currency: typeof currency === "string" ? currency : currentCurrency,
    effectiveDate,
    reason,
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  department: string;
  roleTitle: string;
  level: string;
  currency: string;
  salaryAmount: number;
  hireDate: string;
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseCreateEmployeeBody(
  body: unknown
): CreateEmployeeInput | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "request body is required" };
  }

  const {
    firstName,
    lastName,
    email,
    country,
    department,
    roleTitle,
    level,
    currency,
    salaryAmount,
    hireDate,
  } = body as Record<string, unknown>;

  const fields: Record<string, string | null> = {
    firstName: requiredString(firstName),
    lastName: requiredString(lastName),
    country: requiredString(country),
    department: requiredString(department),
    roleTitle: requiredString(roleTitle),
    level: requiredString(level),
    currency: requiredString(currency),
  };
  for (const [name, value] of Object.entries(fields)) {
    if (value === null) return { error: `${name} is required` };
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return { error: "email must be a valid email address" };
  }
  if (
    typeof salaryAmount !== "number" ||
    !Number.isFinite(salaryAmount) ||
    salaryAmount <= 0
  ) {
    return { error: "salaryAmount must be a positive number" };
  }
  if (typeof hireDate !== "string" || !DATE_PATTERN.test(hireDate)) {
    return { error: "hireDate must be a valid date in YYYY-MM-DD format" };
  }

  return {
    firstName: fields.firstName!,
    lastName: fields.lastName!,
    email,
    country: fields.country!,
    department: fields.department!,
    roleTitle: fields.roleTitle!,
    level: fields.level!,
    currency: fields.currency!,
    salaryAmount,
    hireDate,
  };
}

function parsePositiveInt(value: unknown, fallback: number): number | null {
  if (value === undefined) return fallback;
  if (typeof value !== "string") return null;
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return parsed >= 1 ? parsed : null;
}

function parseStringFilter(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function createEmployeesRouter(pool: Pool): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const input = parseCreateEmployeeBody(req.body);
      if ("error" in input) {
        res.status(400).json({ error: input.error });
        return;
      }

      const existing = await findEmployeeByEmail(pool, input.email);
      if (existing) {
        res.status(409).json({ error: "An employee with this email already exists" });
        return;
      }

      const { employee, historyEntry } = await withTransaction(pool, async (client) => {
        const employeeCode = await nextEmployeeCode(client);
        const created = await createEmployee(client, { ...input, employeeCode });
        const entry = await createSalaryHistoryEntry(client, {
          employeeId: created.id,
          salaryAmount: input.salaryAmount,
          currency: input.currency,
          effectiveDate: input.hireDate,
          reason: "Initial hire",
        });
        return { employee: created, historyEntry: entry };
      });

      res.status(201).json({ ...employee, salaryHistory: [historyEntry] });
    } catch (err) {
      next(err);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const page = parsePositiveInt(req.query.page, 1);
      const pageSize = parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE);

      if (page === null) {
        res.status(400).json({ error: "page must be a positive integer" });
        return;
      }
      if (pageSize === null) {
        res.status(400).json({ error: "pageSize must be a positive integer" });
        return;
      }
      if (pageSize > MAX_PAGE_SIZE) {
        res
          .status(400)
          .json({ error: `pageSize must not exceed ${MAX_PAGE_SIZE}` });
        return;
      }

      const filters = {
        country: parseStringFilter(req.query.country),
        department: parseStringFilter(req.query.department),
        status: parseStringFilter(req.query.status),
      };

      const result = await findEmployees(pool, filters, { page, pageSize });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id || !UUID_PATTERN.test(id)) {
        res.status(400).json({ error: "id must be a valid UUID" });
        return;
      }

      const employee = await findEmployeeById(pool, id);
      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      const salaryHistory = await findSalaryHistoryByEmployeeId(pool, id);
      res.json({ ...employee, salaryHistory });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/salary", async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id || !UUID_PATTERN.test(id)) {
        res.status(400).json({ error: "id must be a valid UUID" });
        return;
      }

      const employee = await findEmployeeById(pool, id);
      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }
      if (employee.status !== "active") {
        res
          .status(400)
          .json({ error: "Cannot update salary for an inactive employee" });
        return;
      }

      const input = parseSalaryUpdateBody(req.body, employee.currency);
      if ("error" in input) {
        res.status(400).json({ error: input.error });
        return;
      }

      const existingHistory = await findSalaryHistoryByEmployeeId(pool, id);
      const latestEntry = existingHistory[existingHistory.length - 1];
      if (latestEntry && input.effectiveDate < latestEntry.effectiveDate) {
        res.status(400).json({
          error: "effectiveDate cannot be before the most recent salary_history entry",
        });
        return;
      }

      const { updatedEmployee, newEntry } = await withTransaction(pool, async (client) => {
        const updated = await updateEmployeeSalary(client, id, {
          salaryAmount: input.salaryAmount,
          currency: input.currency,
        });
        const entry = await createSalaryHistoryEntry(client, {
          employeeId: id,
          salaryAmount: input.salaryAmount,
          currency: input.currency,
          effectiveDate: input.effectiveDate,
          reason: input.reason,
        });
        return { updatedEmployee: updated, newEntry: entry };
      });

      res.json({
        ...updatedEmployee,
        salaryHistory: [...existingHistory, newEntry],
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
