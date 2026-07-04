import { requireBusiness } from "@/lib/auth";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const business = await requireBusiness();

  return (
    <BillingClient
      currentPlan={business.subscription?.plan ?? "STARTER"}
      status={business.subscription?.status ?? "TRIALING"}
      trialEndsAt={business.subscription?.trialEndsAt?.toISOString() ?? null}
    />
  );
}
