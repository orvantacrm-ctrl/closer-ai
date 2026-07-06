import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type { Plan, SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";

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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("[stripe webhook]", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[stripe webhook] event received", { type: event.type, id: event.id });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.metadata?.businessId;
      const plan = session.metadata?.plan as Plan | undefined;
      const clerkId = session.metadata?.clerkId as string | undefined;
      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : undefined;
      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as Stripe.Subscription)?.id;

      console.log("[stripe webhook] checkout.session.completed", {
        businessId,
        plan,
        clerkId,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      if (businessId && plan) {
        await db.subscription.update({
          where: { businessId },
          data: {
            plan,
            stripeSubscriptionId,
            stripeCustomerId,
            status: "ACTIVE",
          },
        });
      } else if (clerkId) {
        const user = await db.user.findUnique({ where: { clerkId } });
        if (user) {
          const business = await db.business.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: { subscription: true },
          });

          if (business) {
            if (business.subscription) {
              await db.subscription.update({
                where: { businessId: business.id },
                data: {
                  plan: plan ?? business.subscription.plan,
                  stripeSubscriptionId,
                  stripeCustomerId,
                  status: "ACTIVE",
                },
              });
            } else {
              await db.subscription.create({
                data: {
                  businessId: business.id,
                  plan: plan ?? "STARTER",
                  status: "ACTIVE",
                  stripeSubscriptionId,
                  stripeCustomerId,
                },
              });
            }
          }
        }
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const businessId = subscription.metadata?.businessId;
      const planFromMetadata = subscription.metadata?.plan as Plan | undefined;
      const stripeCustomerId =
        typeof subscription.customer === "string" ? subscription.customer : undefined;
      const stripeSubscriptionId = subscription.id;
      const statusMap: Record<string, SubscriptionStatus> = {
        trialing: "TRIALING",
        active: "ACTIVE",
        past_due: "PAST_DUE",
        canceled: "CANCELED",
        unpaid: "PAST_DUE",
      };
      const newStatus = statusMap[subscription.status] ?? "CANCELED";
      const subscriptionWithCurrentPeriod = subscription as unknown as {
        current_period_end?: number;
      };
      const currentPeriodEnd =
        subscriptionWithCurrentPeriod.current_period_end != null
          ? new Date(subscriptionWithCurrentPeriod.current_period_end * 1000)
          : null;

      console.log(`[stripe webhook] ${event.type}`, {
        businessId,
        planFromMetadata,
        stripeCustomerId,
        stripeSubscriptionId,
        status: subscription.status,
        mappedStatus: newStatus,
        currentPeriodEnd,
      });

      if (businessId) {
        const updateData: Partial<{
          plan: Plan;
          status: SubscriptionStatus;
          stripeCustomerId: string | undefined;
          stripeSubscriptionId: string;
          currentPeriodEnd: Date | null;
        }> = {
          status: newStatus,
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodEnd,
        };

        if (planFromMetadata) {
          updateData.plan = planFromMetadata;
        }

        await db.subscription.upsert({
          where: { businessId },
          update: updateData,
          create: {
            businessId,
            plan: planFromMetadata ?? "STARTER",
            status: newStatus,
            stripeCustomerId,
            stripeSubscriptionId,
            currentPeriodEnd,
          },
        });
      }
      break;
    }
    default: {
      console.log("[stripe webhook] unhandled event type", { type: event.type });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
