import type { NextFunction, Request, Response } from "express";

// Simple console logging, not a metrics/observability system - Render's
// free tier gives less than one full CPU, so Node's cluster module (or any
// multi-process setup) would add complexity without a real benefit at this
// project's scale. Logs after the response finishes, so the real status
// code and duration are known.
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
}
