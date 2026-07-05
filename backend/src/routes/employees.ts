import { Router } from "express";
import type { Pool } from "pg";
import { findEmployeeById, findEmployees } from "../repositories/employeeRepository";
import { findSalaryHistoryByEmployeeId } from "../repositories/salaryHistoryRepository";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  return router;
}
