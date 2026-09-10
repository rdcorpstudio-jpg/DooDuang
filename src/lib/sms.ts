export type SmsSendInput = {
  to: string;
  message: string;
};

function smsProvider() {
  return (process.env.SMS_PROVIDER || "log").trim().toLowerCase();
}

function assertNotLogInProduction(provider: string) {
  if (provider === "log" && process.env.NODE_ENV === "production") {
    throw new Error("SMS is not configured");
  }
}

async function sendTwilio(input: SmsSendInput) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) {
    throw new Error("SMS is not configured");
  }

  const body = new URLSearchParams({
    To: input.to,
    From: from,
    Body: input.message,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Twilio SMS failed:", res.status, text);
    throw new Error("SMS send failed");
  }
}

async function sendHttp(input: SmsSendInput) {
  const url = process.env.SMS_HTTP_URL;
  if (!url) {
    throw new Error("SMS is not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.SMS_HTTP_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone: input.to, message: input.message }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("HTTP SMS failed:", res.status, text);
    throw new Error("SMS send failed");
  }
}

export async function sendSms(input: SmsSendInput) {
  const provider = smsProvider();
  assertNotLogInProduction(provider);

  if (provider === "log") {
    console.info(`[sms:log] to=${input.to} message=${input.message}`);
    return;
  }

  if (provider === "twilio") {
    await sendTwilio(input);
    return;
  }

  if (provider === "http") {
    await sendHttp(input);
    return;
  }

  throw new Error("SMS is not configured");
}

export function otpSmsMessage(code: string, expiresInSec: number) {
  const minutes = Math.max(1, Math.round(expiresInSec / 60));
  return `รหัสยืนยันดูดวง: ${code} หมดอายุใน ${minutes} นาที ห้ามบอกรหัสนี้กับใคร`;
}
