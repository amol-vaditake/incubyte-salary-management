import "dotenv/config";
import { createApp } from "./app";
import { createPool } from "./db/pool";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const pool = createPool();
const app = createApp(pool);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
