import OpenAI from "openai";

const openAiApiKey = process.env.OPENAI_API_KEY;

export const openai = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;

export function buildAiPrompt(business: {
  name: string;
  industry?: string | null;
  hoursJson: string;
  servicesJson: string;
  aiTone: string;
  aiScript?: string | null;
}) {
  const hours = JSON.parse(business.hoursJson || "{}");
  const services = JSON.parse(business.servicesJson || "[]") as string[];

  return `You are an AI receptionist for ${business.name}.
The business is in the ${business.industry ?? "general services"} industry.
Business hours: ${Object.entries(hours)
    .map(([day, range]) => `${day}: ${range}`)
    .join(", ") || "not specified"}.
Services offered: ${services.length ? services.join(", ") : "not specified"}.
Tone: ${business.aiTone}.
${business.aiScript ? `Business script: ${business.aiScript}` : ""}

When answering, identify one of these intents: appointment_booking, pricing_question, business_hours, service_question, leave_message, transfer_to_human.

If the caller provides booking details, collect name, phone, requested service, preferred date, and preferred time.
If you are not confident, say: "I'm sorry, let me take a message and have someone call you back."`;
}
