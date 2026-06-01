import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const PUBLIC_USER_EMAIL = "visitante@sorrisoamigo.org";
const PUBLIC_USER_NAME = "Visitante";
const PUBLIC_USER_ROLE = "caregiver";
const PUBLIC_USER_PASSWORD = "public-access-only";

async function createPublicUser() {
  const passwordHash = await bcrypt.hash(PUBLIC_USER_PASSWORD, 12);

  try {
    const result = await query(
      `
      INSERT INTO users (full_name, email, password_hash, role, accepted_terms_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, full_name, email, role, created_at
      `,
      [PUBLIC_USER_NAME, PUBLIC_USER_EMAIL, passwordHash, PUBLIC_USER_ROLE]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code !== "23505") {
      throw error;
    }

    const result = await query(
      `
      SELECT id, full_name, email, role, created_at
      FROM users
      WHERE email = $1
      `,
      [PUBLIC_USER_EMAIL]
    );

    return result.rows[0];
  }
}

export async function getPublicUser() {
  const existing = await query(
    `
    SELECT id, full_name, email, role, created_at
    FROM users
    WHERE email = $1
    `,
    [PUBLIC_USER_EMAIL]
  );

  if (existing.rowCount) {
    return existing.rows[0];
  }

  return createPublicUser();
}