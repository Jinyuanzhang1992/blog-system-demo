import { Pool } from "pg";

const pool = new Pool({
  user: "jinyuan",
  host: "localhost",
  database: "demo",
  password: "12345",
  port: 5433,
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database");
});

pool.on("error", (err: any) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
