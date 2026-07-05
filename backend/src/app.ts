import express, { type Express } from "express";
import type { Pool } from "pg";
import { createEmployeesRouter } from "./routes/employees";
import { createAnalyticsRouter } from "./routes/analytics";

export function createApp(pool: Pool): Express {
  const app = express();
  app.use(express.json());
  app.use("/employees", createEmployeesRouter(pool));
  app.use("/analytics", createAnalyticsRouter(pool));
  return app;
}
