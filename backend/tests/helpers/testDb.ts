import fs from "node:fs";
import path from "node:path";
import { newDb } from "pg-mem";
import type { Pool } from "pg";

const SCHEMA_PATH = path.join(__dirname, "../../src/db/schema.sql");

export async function createTestPool(): Promise<Pool> {
  const db = newDb({ noAstCoverageCheck: true });
  const { Pool: MemPool } = db.adapters.createPg();
  const pool = new MemPool() as unknown as Pool;

  const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf-8");
  await pool.query(schemaSql);

  return pool;
}
