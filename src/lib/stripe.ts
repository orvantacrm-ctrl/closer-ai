import Stripe from "stripe";
import { PLANS, TRIAL_DAYS } from "@/lib/constants";
import type { Plan } from "@prisma/client";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PRICE_IDS: Record<Plan, string | undefined> = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID,
  PROFESSIONAL: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  AGENCY: process.env.STRIPE_AGENCY_PRICE_ID,
};

export function getStripePriceId(plan: Plan): string {
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID for plan: ${plan}`);
  }
  return priceId;
}

export function isStripeConfigured(): boolean {
  return Boolean(stripe && process.env.STRIPE_SECRET_KEY);
}

export function getTrialEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL_DAYS);
  return date;
}

export function getPlanDetails(plan: Plan) {
  return PLANS[plan];
}
