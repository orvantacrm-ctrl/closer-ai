import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";
import type { CallIntent } from "@/lib/types";

type VoiceReceptionistPayload = {
  intent: CallIntent;
  responseText: string;
  name?: string | null;
  service?: string | null;
  date?: string | null;
  time?: string | null;
  notes?: string | null;
};

function parseJsonPayload(raw: string): VoiceReceptionistPayload | null {
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[1]) as VoiceReceptionistPayload;
  } catch (error) {
    console.warn("[twilio-call] failed to parse JSON payload", { error, raw });
    return null;
  }
}

function parseDateTime(date?: string | null, time?: string | null): Date | null {
  const datePart = date?.trim();
  const timePart = time?.trim();

  if (!datePart && !timePart) {
    return null;
  }

  const fallbackDate = new Date().toISOString().slice(0, 10);
  const normalizedDate = datePart || fallbackDate;
  const normalizedTime = timePart || "09:00";
  const candidate = new Date(`${normalizedDate} ${normalizedTime}`);

  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

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
  });

  if (!business) {
    throw new Error("No business for number");
  }

  if (!openai) {
    throw new Error("OpenAI API key is not configured.");
  }

  const systemMessage = `You are an AI receptionist for ${business.name}. Use the transcription from the caller to determine whether they are requesting an appointment. Return only valid JSON with these fields: intent, responseText, name, service, date, time, notes. If the caller is requesting an appointment, set intent to appointment_booking and include the requested name, service, date in YYYY-MM-DD format, time in HH:MM format, and notes. If they are not requesting an appointment, set intent to leave_message and responseText should tell the caller that the message is recorded.`;
  const userMessage = `Caller transcription: "${params.transcription ?? ""}"`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    max_tokens: 400,
    temperature: 0,
  });

  const aiText = response?.choices?.[0]?.message?.content?.trim() ?? "";
  const payload = parseJsonPayload(aiText) ?? {
    intent: "leave_message" as CallIntent,
    responseText:
      "Thank you. Your message has been recorded and someone will follow up with you soon.",
    notes: aiText,
  };

  const appointmentBooked = payload.intent === "appointment_booking";
  let appointmentId: string | null = null;
  let customerId: string | undefined;

  if (appointmentBooked) {
    const existingCustomer = await db.customer.findFirst({
      where: { businessId: business.id, phone: params.from },
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await db.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: payload.name ?? existingCustomer.name,
          lastContactAt: new Date(),
        },
      });
    } else {
      const customer = await db.customer.create({
        data: {
          businessId: business.id,
          name: payload.name ?? "Appointment Caller",
          phone: params.from,
          lastContactAt: new Date(),
        },
      });
      customerId = customer.id;
    }

    const scheduledAt = parseDateTime(payload.date, payload.time) ?? new Date();
    const appointment = await db.appointment.create({
      data: {
        businessId: business.id,
        customerId,
        title: payload.service?.trim() || "Appointment request",
        scheduledAt,
        status: "SCHEDULED",
        notes: payload.notes ?? params.transcription ?? "",
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
      intent: payload.intent,
      appointmentBooked,
      recovered: payload.intent !== "leave_message",
    },
  });

  return {
    aiText: payload.responseText,
    intent: payload.intent,
    appointmentId,
    callId: call.id,
  };
}
