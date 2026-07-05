import "dotenv/config";
import { Pool, types } from "pg";

// DATE columns (OID 1082, e.g. hire_date, effective_date) have no time or
// timezone component. pg's default parser still converts them to a JS Date
// anchored at the Node process's local system midnight, which then shifts
// to the wrong calendar day once serialized to a UTC ISO string for any
// server timezone ahead of UTC. Keep the raw 'YYYY-MM-DD' string instead.
types.setTypeParser(1082, (value: string) => value);

export function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}
