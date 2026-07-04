import { db } from "@/lib/db";
import { buildAiPrompt, openai } from "@/lib/openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";

import type { CallIntent } from "@/lib/types";

export async function handleTwilioVoiceInteraction(params: {
  from: string;
  to: string;
  callSid: string;
  transcription?: string;
  callStatus: string;
  durationSeconds?: number;
}) {
  const business = await db.business.findFirst({
    where: { OR: [{ twilioPhone: params.to }, { phone: params.to }] },
    include: { subscription: true },
  });

  if (!business) {
    throw new Error("No business for number");
  }

  const prompt = buildAiPrompt(business);
  const history = [`Business answer: Thank you for calling ${business.name}. How can I help you today?\n`];
  if (params.transcription) {
    history.push(`Caller: ${params.transcription}`);
  }

  const system = prompt;
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    { role: "user", content: history.join("\n") },
  ];

  const response = await openai?.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    max_tokens: 500,
  });

  const aiText = response?.choices?.[0]?.message?.content ?? "";
  const normalized = aiText?.trim() ?? "";

  let intent: CallIntent = "leave_message";
  if (/appointment|book|schedule/i.test(normalized)) {
    intent = "appointment_booking";
  } else if (/price|cost|how much/i.test(normalized)) {
    intent = "pricing_question";
  } else if (/hours|open|close|when.*open/i.test(normalized)) {
    intent = "business_hours";
  } else if (/service|repair|install|work on|offer/i.test(normalized)) {
    intent = "service_question";
  } else if (/human|person|representative|someone/i.test(normalized)) {
    intent = "transfer_to_human";
  }

  const appointmentBooked = intent === "appointment_booking";
  let appointmentId: string | null = null;
  if (appointmentBooked) {
    const serviceMatch = normalized.match(/(?:service|for|about)\s+([\w\s]+)/i);
    const dateMatch = normalized.match(/(\d{4}-\d{2}-\d{2})/);
    const timeMatch = normalized.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);

    const title = serviceMatch?.[1]?.trim() ?? "Appointment request";
    const datetime = dateMatch ? new Date(`${dateMatch[1]} ${timeMatch?.[1] ?? "09:00"}`) : new Date();

    const appointment = await db.appointment.create({
      data: {
        businessId: business.id,
        customerId: undefined,
        title,
        scheduledAt: datetime,
        status: "SCHEDULED",
        notes: normalized,
      },
    });
    appointmentId = appointment.id;
  }

  const call = await db.call.create({
    data: {
      businessId: business.id,
      twilioCallSid: params.callSid,
      fromNumber: params.from,
      toNumber: params.to,
      status: params.callStatus === "completed" ? "ANSWERED" : "MISSED",
      durationSeconds: params.durationSeconds,
      transcript: params.transcription,
      intent,
      appointmentBooked,
      recovered: intent !== "leave_message",
    },
  });

  return {
    aiText: normalized,
    intent,
    appointmentId,
    callId: call.id,
  };
}
