import { createPool } from "../db/pool";
import { applySchema } from "../db/schema";
import { seedDatabase } from "./seedDatabase";

const EMPLOYEE_COUNT = 10_000;

async function main(): Promise<void> {
  const pool = createPool();

  console.log("Applying schema...");
  await applySchema(pool);

  console.log(`Seeding ${EMPLOYEE_COUNT} employees...`);
  const start = Date.now();
  await seedDatabase(pool, EMPLOYEE_COUNT);
  console.log(`Done in ${Date.now() - start}ms.`);

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
