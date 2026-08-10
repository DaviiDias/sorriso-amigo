import { env } from "../config/env.js";

/**
 * Envia SMS pelo provedor configurado.
 * O provider "console" apenas registra a mensagem no log (uso em desenvolvimento).
 */
export async function sendSms(phone, message) {
  if (env.sms.provider === "twilio") {
    return sendViaTwilio(phone, message);
  }

  console.log(`[sms:console] para +55${phone}: ${message}`);
  return { provider: "console", delivered: true };
}

async function sendViaTwilio(phone, message) {
  const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = env.sms;

  if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
    throw Object.assign(new Error("Servico de SMS nao configurado."), { status: 503 });
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
  const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      To: `+55${phone}`,
      From: twilioFromNumber,
      Body: message
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[sms:twilio] falha ao enviar:", response.status, detail);
    throw Object.assign(new Error("Nao foi possivel enviar o SMS agora."), { status: 502 });
  }

  return { provider: "twilio", delivered: true };
}
