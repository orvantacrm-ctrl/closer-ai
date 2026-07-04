import { db } from "@/lib/db";
import type { Business } from "@prisma/client";

const RECOVERY_SMS =
  "Sorry we missed your call from {businessName}. How can we help you today? Reply to book an appointment or ask a question.";

export async function handleMissedCall(params: {
  businessId: string;
  fromNumber: string;
  toNumber: string;
}): Promise<{ callId: string; smsSent: boolean }> {
  const business = await db.business.findUnique({
    where: { id: params.businessId },
  });

  if (!business) {
    throw new Error("Business not found");
  }

  let customer = await db.customer.findFirst({
    where: { businessId: params.businessId, phone: params.fromNumber },
  });

  if (!customer) {
    customer = await db.customer.create({
      data: {
        businessId: params.businessId,
        name: "Unknown Caller",
        phone: params.fromNumber,
      },
    });
  }

  const call = await db.call.create({
    data: {
      businessId: params.businessId,
      customerId: customer.id,
      fromNumber: params.fromNumber,
      toNumber: params.toNumber,
      status: "MISSED",
    },
  });

  const message = RECOVERY_SMS.replace("{businessName}", business.name);
  const smsSent = await sendRecoverySms({
    business,
    to: params.fromNumber,
    message,
  });

  if (smsSent) {
    await db.call.update({
      where: { id: call.id },
      data: { recovered: true, status: "RECOVERED" },
    });

    const conversation = await db.conversation.create({
      data: {
        businessId: params.businessId,
        customerId: customer.id,
        channel: "SMS",
        status: "OPEN",
        subject: "Missed call recovery",
        lastMessage: message,
        messages: {
          create: {
            role: "assistant",
            content: message,
          },
        },
      },
    });

    await db.customer.update({
      where: { id: customer.id },
      data: { lastContactAt: new Date() },
    });

    void conversation;
  }

  return { callId: call.id, smsSent };
}

async function sendRecoverySms(params: {
  business: Business;
  to: string;
  message: string;
}): Promise<boolean> {
  const { sendSms } = await import("@/lib/services/sms");
  return sendSms({
    to: params.to,
    body: params.message,
    from: params.business.twilioPhone ?? process.env.TWILIO_PHONE_NUMBER,
  });
}
