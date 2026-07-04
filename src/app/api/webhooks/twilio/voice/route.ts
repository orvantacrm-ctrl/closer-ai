import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  const now = new Date().toISOString();
  console.log("[twilio voice] incoming call", { from, to, time: now });

  const business = await db.business.findFirst({
    where: {
      OR: [{ twilioPhone: to }, { phone: to }],
    },
  });

  const businessName = business?.name ?? "our business";
  const responseText = `Thank you for calling ${businessName}. How can I help you today?`;

  return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>${responseText}</Say></Response>`);
}
