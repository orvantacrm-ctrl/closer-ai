interface SendSmsParams {
  to: string;
  body: string;
  from?: string | null;
}

export async function sendSms(params: SendSmsParams): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = params.from ?? process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.info("[SMS stub]", { to: params.to, body: params.body });
    return true;
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: params.to,
        From: fromNumber,
        Body: params.body,
      }),
    }
  );

  if (!response.ok) {
    console.error("[SMS failed]", await response.text());
    return false;
  }

  return true;
}
