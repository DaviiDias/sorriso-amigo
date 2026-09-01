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

const isProduction = process.env.NODE_ENV === "production";

// Defaults seguros: se a variavel faltar no deploy, o sistema fica protegido.
const publicAccessMode = parseBoolean(process.env.PUBLIC_ACCESS_MODE, false);
const exposeCode = parseBoolean(process.env.SMS_EXPOSE_CODE, false);

// Em producao, opcoes de desenvolvimento nunca podem ficar ligadas.
if (isProduction) {
  if (publicAccessMode) {
    throw new Error("PUBLIC_ACCESS_MODE=true em producao deixaria o sistema sem login. Use false.");
  }

  if (exposeCode) {
    throw new Error("SMS_EXPOSE_CODE=true em producao devolveria o codigo de verificacao na resposta. Use false.");
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET precisa ter ao menos 32 caracteres em producao.");
  }

  if (!process.env.FRONTEND_ORIGIN) {
    throw new Error("FRONTEND_ORIGIN e obrigatorio em producao para restringir o CORS.");
  }
}

export const env = {
  isProduction,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: parseBoolean(process.env.DATABASE_SSL, false),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "",
  publicAccessMode,
  sms: {
    provider: (process.env.SMS_PROVIDER || "console").toLowerCase(),
    comteleApiKey: process.env.COMTELE_API_KEY || "",
    comteleSmsRoute: Number(process.env.COMTELE_SMS_ROUTE || 17),
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || "",
    codeTtlMinutes: Number(process.env.SMS_CODE_TTL_MINUTES || 10),
    maxAttempts: Number(process.env.SMS_CODE_MAX_ATTEMPTS || 5),
    // Em modo console o codigo volta na resposta para facilitar testes locais.
    exposeCode
  }
};
