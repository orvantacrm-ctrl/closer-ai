
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe, isStripeConfigured, getStripePriceId } from "@/lib/stripe";
import { TRIAL_DAYS } from "@/lib/constants";
import { getOrCreateUser, getActiveBusiness, getOrCreateBusiness } from "@/lib/auth";
import type { Plan } from "@prisma/client";

export async function POST(request: Request) {
	try {
		console.log("[stripe/checkout] route called");
		if (!isStripeConfigured() || !stripe) {
			console.error("[stripe/checkout] Stripe is not configured");
			return NextResponse.json(
				{ error: "Stripe is not configured. Add keys to .env." },
				{ status: 503 }
			);
		}

		let selectedPlan: Plan = "STARTER";
		const bodyText = await request.text();
		let parsedBody: { plan?: Plan } | null = null;
		if (bodyText) {
			try {
				parsedBody = JSON.parse(bodyText) as { plan?: Plan };
				selectedPlan = parsedBody.plan ?? "STARTER";
			} catch (parseError) {
				console.warn("[stripe/checkout] invalid request body, falling back to STARTER", {
					bodyText,
					parseError,
				});
			}
		}
		const priceId = getStripePriceId(selectedPlan);
		console.log("[stripe/checkout] selected plan", {
			selectedPlan,
			parsedBody,
			priceId,
		});

		const user = await getOrCreateUser();
		const business = await getOrCreateBusiness(user.id);
		console.log("[stripe/checkout] clerk user id", user.clerkId);
		console.log("[stripe/checkout] business used for checkout", {
			businessId: business.id,
			created: business.createdAt.getTime() === business.updatedAt.getTime(),
		});

		const clerkUser = await currentUser();
		const email = clerkUser?.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
			?.emailAddress;

		const stripeCustomerId = business.subscription?.stripeCustomerId;
		const params: Record<string, any> = {
			mode: "subscription",
			payment_method_types: ["card"],
			line_items: [{ price: priceId, quantity: 1 }],
			subscription_data: {
				trial_period_days: TRIAL_DAYS,
				metadata: { userId: user.id, clerkId: user.clerkId, plan: selectedPlan },
			},
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
			metadata: { userId: user.id, clerkId: user.clerkId, email: email ?? undefined, plan: selectedPlan },
		};

		if (stripeCustomerId) {
			params.customer = stripeCustomerId;
			console.log("[stripe/checkout] using Stripe customer", {
				mode: "customer",
				stripeCustomerId,
			});
		} else {
			if (!email) {
				console.error("[stripe/checkout] No customer email available");
				return NextResponse.json({ error: "No customer email available" }, { status: 400 });
			}
			params.customer_email = email;
			console.log("[stripe/checkout] using customer_email", {
				mode: "customer_email",
				email,
			});
		}

		const session = await stripe.checkout.sessions.create(params);

		console.log("[stripe/checkout] stripe session created", {
			sessionId: session.id,
			sessionUrl: session.url,
		});

		if (!session?.url) {
			console.error("[stripe/checkout] Stripe session created without url", { session });
			return NextResponse.json({ error: "Checkout session created without a redirect URL" }, { status: 500 });
		}

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("[stripe/checkout] error", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 });
	}
}

