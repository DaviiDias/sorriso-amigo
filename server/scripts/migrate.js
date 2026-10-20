import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../sql/migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function run() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureMigrationsTable(client);

    const files = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    if (!files.length) {
      console.log("Nenhuma migracao encontrada.");
      await client.query("COMMIT");
      return;
    }

    for (const filename of files) {
      const applied = await client.query(
        "SELECT filename, checksum FROM schema_migrations WHERE filename = $1",
        [filename]
      );
      const sql = await readFile(path.join(migrationsDir, filename), "utf-8");
      const checksum = String(sql.length);

      if (applied.rowCount > 0) {
        console.log(`Migracao ja aplicada: ${filename}`);
        continue;
      }

      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
        [filename, checksum]
      );
      console.log(`Migracao aplicada: ${filename}`);
    }

    await client.query("COMMIT");
    console.log("Migracoes concluidas. seed.sql nao foi executado.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Falha ao migrar banco:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
