import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Plan } from "@prisma/client";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("[stripe webhook] invalid signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.metadata?.clerkId as string | undefined;
      const internalUserId = session.metadata?.userId as string | undefined;
      const plan = (session.metadata?.plan as Plan) || undefined;

      const stripeCustomerId = typeof session.customer === "string" ? session.customer : undefined;
      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as any)?.id || undefined;

      console.log("[stripe webhook] checkout.session.completed", {
        clerkId,
        internalUserId,
        plan,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      const user = clerkId
        ? await db.user.findUnique({ where: { clerkId } })
        : internalUserId
        ? await db.user.findUnique({ where: { id: internalUserId } })
        : null;

      if (!user) {
        console.warn("[stripe webhook] user not found for session metadata", {
          clerkId,
          internalUserId,
        });
        return NextResponse.json({ received: true });
      }

      const business = await db.business.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { subscription: true },
      });

      if (!business) {
        console.warn("[stripe webhook] business not found for user", { userId: user.id });
        return NextResponse.json({ received: true });
      }

      if (business.subscription) {
        await db.subscription.update({
          where: { businessId: business.id },
          data: {
            plan: plan ?? business.subscription.plan,
            status: "ACTIVE",
            stripeCustomerId: stripeCustomerId ?? business.subscription.stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId ?? business.subscription.stripeSubscriptionId,
          },
        });
        console.log("[stripe webhook] subscription updated to ACTIVE", {
          businessId: business.id,
          subscriptionId: business.subscription.id,
        });
      } else {
        await db.subscription.create({
          data: {
            businessId: business.id,
            plan: plan ?? "STARTER",
            status: "ACTIVE",
            stripeCustomerId,
            stripeSubscriptionId,
          },
        });
        console.log("[stripe webhook] subscription created and set to ACTIVE", {
          businessId: business.id,
          stripeCustomerId,
          stripeSubscriptionId,
        });
      }
    }
  } catch (err) {
    console.error("[stripe webhook handler]", err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
