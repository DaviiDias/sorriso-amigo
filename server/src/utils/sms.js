import { env } from "../config/env.js";

/**
 * Envia SMS pelo provedor configurado.
 * Provedores suportados: "comtele", "twilio", "console".
 */
export async function sendSms(phone, message) {
  if (env.sms.provider === "comtele") {
    return sendViaComtele(phone, message);
  }

  if (env.sms.provider === "twilio") {
    return sendViaTwilio(phone, message);
  }

  console.log(`[sms:console] para +55${phone}: ${message}`);
  return { provider: "console", delivered: true };
}

async function sendViaComtele(phone, message) {
  const { comteleApiKey, comteleSmsRoute } = env.sms;

  if (!comteleApiKey) {
    console.error("[sms:comtele] erro: COMTELE_API_KEY nao foi informada no arquivo .env");
    throw Object.assign(new Error("Servico de SMS (Comtele) nao configurado. Informe a chave COMTELE_API_KEY."), { status: 503 });
  }

  if (!Number.isInteger(comteleSmsRoute) || comteleSmsRoute <= 0) {
    throw Object.assign(new Error("Servico de SMS (Comtele) nao configurado. Informe COMTELE_SMS_ROUTE com a rota numerica do envio SMS."), { status: 503 });
  }

  // Remove caracteres nao numericos
  const cleanDigits = String(phone || "").replace(/\D/g, "");
  const receivers = cleanDigits.length === 11 || cleanDigits.length === 10 ? `55${cleanDigits}` : cleanDigits;

  console.log(`[sms:comtele] Disparando SMS para ${receivers}...`);

  // Endpoint oficial da API Comtele conforme a documentacao atual.
  const endpoint = "https://api.comtele.com.br/messages/sms/send";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": comteleApiKey
      },
      body: JSON.stringify({
        receivers: [receivers],
        contactGroups: [],
        message,
        route: comteleSmsRoute
      })
    });

    const responseText = await response.text().catch(() => "");
    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      // Ignora erro se nao for JSON
    }

    const hasError = data.hasError === true || data.hasError === "true";

    if (!response.ok || hasError) {
      console.error("[sms:comtele] resposta de erro da Comtele:", response.status, responseText);
      const errMsg = responseText || data.message || data.Message || `Falha no envio via Comtele (status ${response.status}).`;
      throw Object.assign(new Error(errMsg), { status: response.status === 401 ? 401 : 502 });
    }

    console.log(`[sms:comtele] SMS enviado com SUCESSO para ${receivers}:`, data);
    return { provider: "comtele", delivered: true, data };
  } catch (error) {
    if (error.status) throw error;
    console.error("[sms:comtele] erro de conexao ao enviar SMS:", error);
    throw Object.assign(new Error("Nao foi possivel conectar ao servidor da Comtele: " + error.message), { status: 502 });
  }
}

async function sendViaTwilio(phone, message) {
  const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = env.sms;

  if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
    throw Object.assign(new Error("Servico de SMS (Twilio) nao configurado."), { status: 503 });
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
      To: `+55${phone.replace(/\D/g, "")}`,
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
