import express, { type Express } from "express";
import type { Pool } from "pg";
import { createEmployeesRouter } from "./routes/employees";

export function createApp(pool: Pool): Express {
  const app = express();
  app.use(express.json());
  app.use("/employees", createEmployeesRouter(pool));
  return app;
}
