import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken } from "../utils/jwt.js";
import { maskPhone, normalizePhone } from "../utils/phone.js";
import {
  consumeResetToken,
  consumeVerification,
  createVerification,
  issueResetToken
} from "../utils/verification.js";

const router = express.Router();

function isValidUsername(username) {
  return /^[\p{L}0-9._' -]{3,60}$/u.test(String(username || "").trim());
}

function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function publicUserFields(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role
  };
}

/**
 * Etapa 1 do cadastro: valida os dados, garante que o telefone ainda nao esta
 * em uso e dispara o SMS de confirmacao. O usuario so e criado apos a validacao.
 */
router.post("/register/start", async (req, res, next) => {
  try {
    const { username, password, confirmPassword, phone } = req.body;

    if (!isValidUsername(username)) {
      return res.status(400).json({
        message: "Informe um nome de usuario valido com 3 a 60 caracteres."
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "A senha precisa ter no minimo 8 caracteres." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "As senhas precisam ser iguais." });
    }

    const safePhone = normalizePhone(phone);

    if (!safePhone) {
      return res.status(400).json({ message: "Informe um numero de telefone valido com DDD." });
    }

    const existing = await query(`SELECT id FROM users WHERE phone = $1`, [safePhone]);

    if (existing.rowCount) {
      return res.status(409).json({ message: "Este numero de telefone ja possui um cadastro." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const verification = await createVerification(safePhone, "register", {
      username: String(username).trim(),
      passwordHash
    });

    return res.status(201).json({
      message: `Enviamos um codigo de confirmacao para ${maskPhone(safePhone)}.`,
      phone: safePhone,
      maskedPhone: maskPhone(safePhone),
      expiresAt: verification.expiresAt,
      devCode: verification.devCode
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Etapa 2 do cadastro: confere o codigo do SMS e cria o usuario de fato.
 */
router.post("/register/verify", async (req, res, next) => {
  try {
    const safePhone = normalizePhone(req.body?.phone);

    if (!safePhone) {
      return res.status(400).json({ message: "Informe um numero de telefone valido com DDD." });
    }

    const check = await consumeVerification(safePhone, "register", req.body?.code);

    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const { username, passwordHash } = check.verification.payload || {};

    if (!username || !passwordHash) {
      return res.status(400).json({ message: "Cadastro expirado. Refaca o processo." });
    }

    const result = await query(
      `
      INSERT INTO users (full_name, username, email, phone, phone_verified_at, password_hash, role, accepted_terms_at)
      VALUES ($1, $1, NULL, $2, NOW(), $3, 'caregiver', NOW())
      RETURNING id, full_name, username, email, phone, role, created_at
      `,
      [username, safePhone, passwordHash]
    );

    const user = result.rows[0];

    return res.status(201).json({ token: signToken(user), user: publicUserFields(user) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Este numero de telefone ja possui um cadastro." });
    }

    return next(error);
  }
});

/**
 * Reenvia o codigo de cadastro reaproveitando os dados ja informados.
 */
router.post("/register/resend", async (req, res, next) => {
  try {
    const safePhone = normalizePhone(req.body?.phone);

    if (!safePhone) {
      return res.status(400).json({ message: "Informe um numero de telefone valido com DDD." });
    }

    const pending = await query(
      `
      SELECT payload
      FROM phone_verifications
      WHERE phone = $1 AND purpose = 'register' AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [safePhone]
    );

    if (!pending.rowCount) {
      return res.status(400).json({ message: "Nenhum cadastro pendente para este numero." });
    }

    const verification = await createVerification(safePhone, "register", pending.rows[0].payload);

    return res.json({
      message: `Novo codigo enviado para ${maskPhone(safePhone)}.`,
      expiresAt: verification.expiresAt,
      devCode: verification.devCode
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Login pelo telefone (identificador unico) + senha.
 */
router.post("/login", async (req, res, next) => {
  try {
    const safePhone = normalizePhone(req.body?.phone);
    const password = req.body?.password;

    if (!safePhone || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Informe o telefone cadastrado e a senha." });
    }

    const result = await query(
      `
      SELECT id, full_name, username, email, phone, role, password_hash
      FROM users
      WHERE phone = $1
      `,
      [safePhone]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Telefone nao cadastrado." });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    return res.json({ token: signToken(user), user: publicUserFields(user) });
  } catch (error) {
    return next(error);
  }
});

/**
 * Etapa 1 da recuperacao: dispara o SMS com o codigo de recuperacao.
 */
router.post("/password/forgot", async (req, res, next) => {
  try {
    const safePhone = normalizePhone(req.body?.phone);

    if (!safePhone) {
      return res.status(400).json({ message: "Informe um numero de telefone valido com DDD." });
    }

    const user = await query(`SELECT id FROM users WHERE phone = $1`, [safePhone]);

    if (!user.rowCount) {
      return res.status(404).json({ message: "Telefone nao cadastrado." });
    }

    const verification = await createVerification(safePhone, "password_reset", { userId: user.rows[0].id });

    return res.json({
      message: `Enviamos um codigo de recuperacao para ${maskPhone(safePhone)}.`,
      phone: safePhone,
      maskedPhone: maskPhone(safePhone),
      expiresAt: verification.expiresAt,
      devCode: verification.devCode
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Etapa 2 da recuperacao: valida o codigo e devolve o token de troca de senha.
 */
router.post("/password/verify", async (req, res, next) => {
  try {
    const safePhone = normalizePhone(req.body?.phone);

    if (!safePhone) {
      return res.status(400).json({ message: "Informe um numero de telefone valido com DDD." });
    }

    const check = await consumeVerification(safePhone, "password_reset", req.body?.code);

    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const resetToken = await issueResetToken(check.verification.id);

    return res.json({ resetToken, phone: safePhone });
  } catch (error) {
    return next(error);
  }
});

/**
 * Etapa 3 da recuperacao: grava a nova senha usando o token emitido.
 */
router.post("/password/reset", async (req, res, next) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;
    const safePhone = normalizePhone(req.body?.phone);

    if (!safePhone || !resetToken) {
      return res.status(400).json({ message: "Sessao de recuperacao invalida. Refaca o processo." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "A senha precisa ter no minimo 8 caracteres." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "As senhas precisam ser iguais." });
    }

    const consumed = await consumeResetToken(safePhone, resetToken);

    if (!consumed) {
      return res.status(400).json({ message: "Sessao de recuperacao expirada. Refaca o processo." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      UPDATE users
      SET password_hash = $2
      WHERE phone = $1
      RETURNING id, full_name, username, email, phone, role
      `,
      [safePhone, passwordHash]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Telefone nao cadastrado." });
    }

    const user = result.rows[0];

    return res.json({
      message: "Senha atualizada com sucesso.",
      token: signToken(user),
      user: publicUserFields(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT id, full_name, username, email, phone, role, created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.sub]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Usuario nao encontrado." });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;
