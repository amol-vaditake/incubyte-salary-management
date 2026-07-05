import type { Pool, PoolClient } from "pg";

// Repository functions that must work both standalone (via the shared Pool)
// and inside a transaction (via a single checked-out client) accept this
// instead of Pool directly - Pool and PoolClient both expose a compatible
// .query().
export type Queryable = Pool | PoolClient;

export async function withTransaction<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
