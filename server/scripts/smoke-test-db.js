/* eslint-disable no-console */
import assert from "node:assert/strict";

const API_BASE = process.env.API_BASE || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - ${data.message || "sem mensagem"}`);
  }

  return data;
}

async function run() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const email = `smoke.${Date.now()}@sorriso.local`;
  const password = "SmokeTest123!";

  console.log("[1/4] Registrando usuario de teste...");
  const register = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Smoke Test User",
      email,
      password,
      role: "caregiver",
      acceptTerms: true
    })
  });

  assert.ok(register.token, "Token nao retornado no register");
  const token = register.token;

  console.log("[2/4] Gravando checklist do dia...");
  await request(`/checklists/${date}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      morning: true,
      afternoon: true,
      night: true,
      resistanceLevel: "light",
      notes: "Registro de smoke test"
    })
  });

  console.log("[3/4] Lendo checklist gravado...");
  const list = await request(`/checklists?start=${date}&end=${date}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.ok(Array.isArray(list.items), "Lista de checklist nao retornada");
  assert.ok(list.items.length >= 1, "Nenhum item retornado");

  const todayEntry = list.items.find((item) => item.checklist_date === date);
  assert.ok(todayEntry, "Registro gravado nao encontrado na leitura");

  console.log("[4/4] Validando dashboard/stats...");
  const month = date.slice(0, 7);
  const stats = await request(`/checklists/stats?month=${month}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(typeof stats.completedBrushings, "number");
  assert.equal(typeof stats.adherenceRate, "number");

  console.log("Smoke test concluido com sucesso.");
}

run().catch((error) => {
  console.error("Falha no smoke test:", error.message);
  process.exit(1);
});
