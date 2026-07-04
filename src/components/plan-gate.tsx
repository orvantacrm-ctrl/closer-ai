"use client";

import { isPlanAtLeast, getPlanName } from "@/lib/plan";
import type { Plan } from "@prisma/client";
import LockedFeaturePrompt from "@/components/locked-feature-prompt";

interface PlanGateProps {
  currentPlan: Plan;
  requiredPlan: Plan;
  feature: string;
  children: React.ReactNode;
}

export default function PlanGate({
  currentPlan,
  requiredPlan,
  feature,
  children,
}: PlanGateProps) {
  if (isPlanAtLeast(currentPlan, requiredPlan)) {
    return <>{children}</>;
  }

  return (
    <LockedFeaturePrompt
      feature={feature}
      requiredPlan={getPlanName(requiredPlan)}
    />
  );
}
