import dotenv from "dotenv";

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

const requiredKeys = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Variavel obrigatoria ausente: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: parseBoolean(process.env.DATABASE_SSL, false),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN || ""
};
