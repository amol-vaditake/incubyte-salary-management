import { createApp } from "./app";
import { createPool } from "./db/pool";
import { applySchema } from "./db/schema";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function main(): Promise<void> {
  const pool = createPool();
  await applySchema(pool);

  const app = createApp(pool);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
