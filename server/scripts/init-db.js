import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { setTimeout as delay } from "node:timers/promises";
import { pool, query } from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const maxAttempts = 30;
const retryDelayMs = 2000;

const schemaPath = path.resolve(__dirname, "../sql/schema.sql");
const seedPath = path.resolve(__dirname, "../sql/seed.sql");

async function waitForDatabase() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.log(`Banco ainda nao respondeu, tentando novamente (${attempt}/${maxAttempts})...`);
      console.log(`Motivo: ${error.message}`);
      await delay(retryDelayMs);
    }
  }
}

async function run() {
  try {
    await waitForDatabase();

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
