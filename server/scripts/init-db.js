import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool, query } from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../sql/schema.sql");
const seedPath = path.resolve(__dirname, "../sql/seed.sql");

async function run() {
  try {
    const schemaSql = await readFile(schemaPath, "utf-8");
    const seedSql = await readFile(seedPath, "utf-8");

    await query(schemaSql);
    await query(seedSql);

    console.log("Banco inicializado com sucesso.");
  } catch (error) {
    console.error("Falha ao inicializar banco:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
