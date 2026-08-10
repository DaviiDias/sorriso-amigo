import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { env } from "../config/env.js";
import { sendSms } from "./sms.js";

export function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Cria (ou substitui) o codigo de verificacao de um telefone para um proposito
 * e dispara o SMS correspondente.
 */
export async function createVerification(phone, purpose, payload = {}) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.sms.codeTtlMinutes * 60_000);

  // Invalida codigos anteriores ainda pendentes para o mesmo telefone/proposito.
  await query(
    `
    UPDATE phone_verifications
    SET consumed_at = NOW()
    WHERE phone = $1 AND purpose = $2 AND consumed_at IS NULL
    `,
    [phone, purpose]
  );

  const result = await query(
    `
    INSERT INTO phone_verifications (phone, purpose, code_hash, payload, expires_at)
    VALUES ($1, $2, $3, $4::jsonb, $5)
    RETURNING id, expires_at
    `,
    [phone, purpose, codeHash, JSON.stringify(payload), expiresAt]
  );

  const message =
    purpose === "register"
      ? `Sorriso Amigo: seu codigo de confirmacao e ${code}. Valido por ${env.sms.codeTtlMinutes} minutos.`
      : `Sorriso Amigo: seu codigo de recuperacao de senha e ${code}. Valido por ${env.sms.codeTtlMinutes} minutos.`;

  await sendSms(phone, message);

  return {
    id: result.rows[0].id,
    expiresAt: result.rows[0].expires_at,
    devCode: env.sms.exposeCode ? code : undefined
  };
}

/**
 * Valida o codigo informado. Retorna { ok: false, message } quando invalido
 * e { ok: true, verification } quando correto (ja marcado como consumido).
 */
export async function consumeVerification(phone, purpose, code) {
  const result = await query(
    `
    SELECT id, code_hash, payload, attempts, expires_at
    FROM phone_verifications
    WHERE phone = $1 AND purpose = $2 AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [phone, purpose]
  );

  if (!result.rowCount) {
    return { ok: false, status: 400, message: "Nenhum codigo pendente para este numero. Solicite um novo." };
  }

  const verification = result.rows[0];

  if (new Date(verification.expires_at).getTime() < Date.now()) {
    await query(`UPDATE phone_verifications SET consumed_at = NOW() WHERE id = $1`, [verification.id]);
    return { ok: false, status: 400, message: "Codigo expirado. Solicite um novo codigo." };
  }

  if (verification.attempts >= env.sms.maxAttempts) {
    await query(`UPDATE phone_verifications SET consumed_at = NOW() WHERE id = $1`, [verification.id]);
    return { ok: false, status: 429, message: "Numero de tentativas excedido. Solicite um novo codigo." };
  }

  const isValid = await bcrypt.compare(String(code || ""), verification.code_hash);

  if (!isValid) {
    await query(`UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = $1`, [verification.id]);
    return { ok: false, status: 400, message: "Codigo incorreto." };
  }

  await query(`UPDATE phone_verifications SET consumed_at = NOW() WHERE id = $1`, [verification.id]);

  return { ok: true, verification };
}

/**
 * Emite um token de curta duracao que autoriza a troca de senha apos a
 * validacao do codigo de recuperacao.
 */
export async function issueResetToken(verificationId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60_000);

  await query(
    `
    UPDATE phone_verifications
    SET reset_token = $2, reset_token_expires_at = $3
    WHERE id = $1
    `,
    [verificationId, token, expiresAt]
  );

  return token;
}

export async function consumeResetToken(phone, token) {
  const result = await query(
    `
    SELECT id
    FROM phone_verifications
    WHERE phone = $1
      AND purpose = 'password_reset'
      AND reset_token = $2
      AND reset_token_expires_at > NOW()
    LIMIT 1
    `,
    [phone, String(token || "")]
  );

  if (!result.rowCount) {
    return null;
  }

  await query(
    `UPDATE phone_verifications SET reset_token = NULL, reset_token_expires_at = NULL WHERE id = $1`,
    [result.rows[0].id]
  );

  return result.rows[0].id;
}
