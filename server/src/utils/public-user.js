import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const PUBLIC_USER_NAME = "Visitante";
const PUBLIC_USER_USERNAME = "visitante";
const PUBLIC_USER_ROLE = "caregiver";
const PUBLIC_USER_PASSWORD = "public-access-only";
const PUBLIC_USER_PHONE = "00000000000";

async function createPublicUser() {
  const passwordHash = await bcrypt.hash(PUBLIC_USER_PASSWORD, 12);

  try {
    const result = await query(
      `
      INSERT INTO users (full_name, username, email, phone, password_hash, role, accepted_terms_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, full_name, username, email, phone, role, created_at
      `,
      [PUBLIC_USER_NAME, PUBLIC_USER_USERNAME, null, PUBLIC_USER_PHONE, passwordHash, PUBLIC_USER_ROLE]
    );

    return normalizePublicUser(result.rows[0]);
  } catch (error) {
    if (error.code !== "23505") {
      throw error;
    }

    const result = await query(
      `
      SELECT id, full_name, username, email, phone, role, created_at
      FROM users
      WHERE phone = $1
      `,
      [PUBLIC_USER_PHONE]
    );

    return normalizePublicUser(result.rows[0]);
  }
}

export async function getPublicUser() {
  const existing = await query(
    `
    SELECT id, full_name, username, email, phone, role, created_at
    FROM users
    WHERE phone = $1
    `,
    [PUBLIC_USER_PHONE]
  );

  if (existing.rowCount) {
    return normalizePublicUser(existing.rows[0]);
  }

  return createPublicUser();
}

function normalizePublicUser(user) {
  if (!user) {
    return user;
  }

  return {
    ...user,
    sub: user.sub ?? user.id
  };
}