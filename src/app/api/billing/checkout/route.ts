import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripePriceId, isStripeConfigured, stripe } from "@/lib/stripe";
import { isClerkConfigured } from "@/lib/clerk";
import type { Plan } from "@prisma/client";

export async function POST(request: Request) {
  try {
    if (!isClerkConfigured()) {
      return NextResponse.json(
        { error: "Clerk is not configured. Add Clerk env vars." },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL is not configured." },
        { status: 503 }
      );
    }

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add keys to .env." },
        { status: 503 }
      );
    }

    const business = await requireBusiness();
    const { plan } = (await request.json()) as { plan: Plan };

    if (!business.subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    let customerId = business.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.email ?? undefined,
        name: business.name,
        metadata: { businessId: business.id },
      });
      customerId = customer.id;

      await db.subscription.update({
        where: { id: business.subscription.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: getStripePriceId(plan), quantity: 1 }],
      subscription_data: {
        trial_period_days: business.subscription.status === "TRIALING" ? 7 : undefined,
        metadata: { businessId: business.id, plan },
      },
      success_url: `${appUrl}/dashboard/billing?success=1`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
      metadata: { businessId: business.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NO_BUSINESS") {
        return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
      }
      if (error.message.startsWith("Missing Stripe price ID")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes("Clerk")) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
    }
    console.error("[checkout]", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
