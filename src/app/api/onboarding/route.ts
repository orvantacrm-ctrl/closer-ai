import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTrialEndDate } from "@/lib/stripe";
import {
  onboardingAiSchema,
  onboardingBusinessSchema,
} from "@/lib/validations/onboarding";

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    const body = await request.json();

    const businessInput = onboardingBusinessSchema.parse({
      name: body.name,
      industry: body.industry,
      phone: body.phone,
      email: body.email,
      timezone: body.timezone,
    });

    const aiInput = onboardingAiSchema.parse({
      aiName: body.aiName || `${body.name} AI Receptionist`,
      aiTone: body.aiTone,
      services: body.services,
      hours: body.hours,
    });

    const existing = await db.business.findFirst({
      where: { userId: user.id },
    });

    if (existing) {
      await db.business.update({
        where: { id: existing.id },
        data: {
          ...businessInput,
          aiName: aiInput.aiName,
          aiTone: aiInput.aiTone,
          servicesJson: JSON.stringify(aiInput.services),
          hoursJson: JSON.stringify(aiInput.hours),
          onboardingDone: true,
        },
      });

      return NextResponse.json({ businessId: existing.id });
    }

    const business = await db.business.create({
      data: {
        userId: user.id,
        ...businessInput,
        aiName: aiInput.aiName,
        aiTone: aiInput.aiTone,
        servicesJson: JSON.stringify(aiInput.services),
        hoursJson: JSON.stringify(aiInput.hours),
        onboardingDone: true,
        subscription: {
          create: {
            plan: "STARTER",
            status: "TRIALING",
            trialEndsAt: getTrialEndDate(),
          },
        },
      },
    });

    return NextResponse.json({ businessId: business.id });
  } catch (error) {
    console.error("[onboarding]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
