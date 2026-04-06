import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`Sorriso Amigo ativo em http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`Recebido ${signal}. Encerrando servidor...`);

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
