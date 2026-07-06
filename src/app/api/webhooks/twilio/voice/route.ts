import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleTwilioVoiceInteraction } from "@/lib/services/twilio-call";

function twimlResponse(content: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const from = String(formData.get("From") ?? "");
  const to = String(formData.get("To") ?? "");
  const callSid = String(formData.get("CallSid") ?? "");
  const callStatus = String(formData.get("CallStatus") ?? "ringing");
  const speechResult = String(formData.get("SpeechResult") ?? "");
  const now = new Date().toISOString();

  console.log("[twilio voice] incoming call", {
    from,
    to,
    callSid,
    callStatus,
    speechResult,
    time: now,
  });

  const business = await db.business.findFirst({
    where: {
      OR: [{ twilioPhone: to }, { phone: to }],
    },
  });

  if (!business) {
    return twimlResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, we could not find the business for this number. Goodbye.</Say></Response>`
    );
  }

  if (!speechResult) {
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" speechTimeout="auto" timeout="5" action="/api/webhooks/twilio/voice" method="POST"><Say>Thank you for calling ${business.name}. Please say your name, the service you need, and your preferred date and time for the appointment.</Say></Gather><Say>We did not receive your message. Goodbye.</Say></Response>`);
  }

  try {
    const result = await handleTwilioVoiceInteraction({
      from,
      to,
      callSid,
      transcription: speechResult,
      callStatus,
      durationSeconds: undefined,
    });

    const responseText = result.aiText ||
      "Thanks. Your appointment request has been recorded. Someone will follow up with you soon.";

    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>${responseText}</Say></Response>`);
  } catch (error) {
    console.error("[twilio voice] error", error);
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, there was an error processing your request. Please try again later.</Say></Response>`);
  }
}
