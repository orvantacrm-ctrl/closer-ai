import { PLANS } from "@/lib/constants";
import type { Plan } from "@prisma/client";

export const PLAN_ORDER: Record<Plan, number> = {
  STARTER: 0,
  PROFESSIONAL: 1,
  AGENCY: 2,
};

export function isPlanAtLeast(plan: Plan, requiredPlan: Plan) {
  return PLAN_ORDER[plan] >= PLAN_ORDER[requiredPlan];
}

export const ROUTE_PLAN_REQUIREMENTS: Record<string, Plan> = {
  "/dashboard/reviews": "PROFESSIONAL",
  "/dashboard/campaigns": "PROFESSIONAL",
  "/dashboard/marketplace": "AGENCY",
};

export function getPlanName(plan: Plan) {
  return PLANS[plan]?.name ?? plan;
}

export function getRequiredPlanName(route: string): string | null {
  const plan = ROUTE_PLAN_REQUIREMENTS[route];
  return plan ? getPlanName(plan) : null;
}
