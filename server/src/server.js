import os from "node:os";
import { app } from "./app.js";
import { env } from "./config/env.js";

// IPs da rede local, para abrir a aplicacao pelo celular durante os testes.
function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((iface) => iface && iface.family === "IPv4" && !iface.internal)
    .map((iface) => iface.address);
}

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`Sorriso Amigo ativo em http://localhost:${env.port}`);
  lanAddresses().forEach((address) => {
    console.log(`  na rede local:            http://${address}:${env.port}`);
  });
  console.log(`  SMS provider:             ${env.sms.provider}`);
  console.log(`  PUBLIC_ACCESS_MODE:       ${env.publicAccessMode}`);

  if (env.publicAccessMode) {
    console.warn("  [aviso] PUBLIC_ACCESS_MODE=true faz o backend ignorar o login. Use false para testar autenticacao.");
  }
});

function shutdown(signal) {
  console.log(`Recebido ${signal}. Encerrando servidor...`);

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
