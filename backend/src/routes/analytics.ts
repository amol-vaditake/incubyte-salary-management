import { Router } from "express";
import type { Pool } from "pg";
import { getAnalyticsSummary } from "../repositories/analyticsRepository";

export function createAnalyticsRouter(pool: Pool): Router {
  const router = Router();

  router.get("/summary", async (_req, res, next) => {
    try {
      const summary = await getAnalyticsSummary(pool);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
