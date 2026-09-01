import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.COMTELE_API_KEY;
const smsRoute = Number(process.env.COMTELE_SMS_ROUTE || 17);
const receiver = process.env.COMTELE_TEST_RECEIVER;

if (!apiKey) {
  throw new Error("Defina COMTELE_API_KEY no ambiente antes de rodar este teste.");
}

if (!receiver) {
  throw new Error("Defina COMTELE_TEST_RECEIVER com um telefone brasileiro em formato apenas numerico, por exemplo 5511999999999.");
}

async function sendTestSms() {
  const response = await fetch("https://api.comtele.com.br/messages/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      receivers: [receiver],
      contactGroups: [],
      route: smsRoute,
      message: "Teste de envio da integracao Comtele do Sorriso Amigo"
    })
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

sendTestSms().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
