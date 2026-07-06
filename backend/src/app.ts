import cors from "cors";
import express, { type Express } from "express";
import type { Pool } from "pg";
import { createEmployeesRouter } from "./routes/employees";
import { createAnalyticsRouter } from "./routes/analytics";
import { requestLogger } from "./middleware/requestLogger";

// Frontend and backend are served from different origins (localhost:5173 vs
// localhost:3000 in dev; separate Vercel/Render domains in production), so
// the browser blocks the frontend's fetch calls without this. Defaults to
// the Vite dev server's port for local development; set CORS_ORIGIN in
// production to the deployed frontend's URL.
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

export function createApp(pool: Pool): Express {
  const app = express();
  app.use(requestLogger);
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  app.use("/employees", createEmployeesRouter(pool));
  app.use("/analytics", createAnalyticsRouter(pool));
  return app;
}
