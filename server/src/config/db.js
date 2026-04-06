import { Pool } from "pg";
import { env } from "./env.js";

const ssl = env.databaseSsl ? { rejectUnauthorized: false } : false;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl
});

export async function query(sql, params = []) {
  return pool.query(sql, params);
}
