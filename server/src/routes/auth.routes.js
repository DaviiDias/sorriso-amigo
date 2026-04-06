import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken } from "../utils/jwt.js";

const router = express.Router();

const allowedRoles = ["caregiver", "family", "professional"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

router.post("/register", async (req, res, next) => {
  try {
    const { fullName, email, password, role, acceptTerms } = req.body;

    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ message: "Informe o nome completo." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Informe um e-mail valido." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "A senha precisa ter no minimo 8 caracteres."
      });
    }

    if (!acceptTerms) {
      return res.status(400).json({
        message: "E necessario aceitar os termos de uso e consentimento."
      });
    }

    const safeRole = allowedRoles.includes(role) ? role : "caregiver";
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      INSERT INTO users (full_name, email, password_hash, role, accepted_terms_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, full_name, email, role, created_at
      `,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, safeRole]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Este e-mail ja esta cadastrado." });
    }

    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ message: "Credenciais invalidas." });
    }

    const result = await query(
      `
      SELECT id, full_name, email, role, password_hash
      FROM users
      WHERE email = $1
      `,
      [email.toLowerCase().trim()]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT id, full_name, email, role, created_at
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
