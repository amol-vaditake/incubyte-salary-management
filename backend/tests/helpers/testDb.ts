import { newDb } from "pg-mem";
import type { Pool } from "pg";
import { applySchema } from "../../src/db/schema";

export async function createTestPool(): Promise<Pool> {
  const db = newDb({ noAstCoverageCheck: true });
  const { Pool: MemPool } = db.adapters.createPg();
  const pool = new MemPool() as unknown as Pool;

  await applySchema(pool);

  return pool;
}
