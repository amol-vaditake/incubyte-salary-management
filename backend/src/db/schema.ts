import fs from "node:fs";
import path from "node:path";
import type { Pool } from "pg";

const SCHEMA_PATH = path.join(__dirname, "schema.sql");

export async function applySchema(pool: Pool): Promise<void> {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf-8");
  await pool.query(schemaSql);
}
