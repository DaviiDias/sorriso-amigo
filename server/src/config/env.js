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
const smsProvider = (process.env.SMS_PROVIDER || "").toLowerCase();

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

  if (!smsProvider) {
    throw new Error("SMS_PROVIDER e obrigatorio em producao. Configure 'comtele' ou 'twilio'.");
  }

  if (smsProvider === "console") {
    throw new Error("SMS_PROVIDER=console nao e permitido em producao. Configure 'comtele' ou 'twilio'.");
  }
}

if (smsProvider && !["comtele", "twilio", "console"].includes(smsProvider)) {
  throw new Error(`SMS_PROVIDER invalido: ${smsProvider}. Use 'comtele', 'twilio' ou 'console'.`);
}

if (smsProvider === "comtele") {
  if (!process.env.COMTELE_API_KEY) {
    throw new Error("COMTELE_API_KEY e obrigatoria quando SMS_PROVIDER=comtele.");
  }

  const comteleRoute = Number(process.env.COMTELE_SMS_ROUTE);

  if (!process.env.COMTELE_SMS_ROUTE || !Number.isInteger(comteleRoute) || comteleRoute <= 0) {
    throw new Error("COMTELE_SMS_ROUTE deve ser um numero inteiro positivo quando SMS_PROVIDER=comtele.");
  }
}

if (smsProvider === "twilio") {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    throw new Error("TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_FROM_NUMBER sao obrigatorios quando SMS_PROVIDER=twilio.");
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
    provider: smsProvider || "console",
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
