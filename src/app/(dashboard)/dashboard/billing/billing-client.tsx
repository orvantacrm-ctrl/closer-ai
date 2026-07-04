"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import type { Plan } from "@prisma/client";

interface BillingPageProps {
  currentPlan: Plan;
  status: string;
  trialEndsAt: string | null;
}

export function BillingClient({
  currentPlan,
  status,
  trialEndsAt,
}: BillingPageProps) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: Plan) {
    setLoading(plan);
    setError(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Checkout failed");
      setLoading(null);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-slate-600">Manage your subscription and trial</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {PLANS[currentPlan].name} ·{" "}
            <Badge variant={status === "TRIALING" ? "warning" : "success"}>
              {status.toLowerCase()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {trialEndsAt && status === "TRIALING" && (
            <p>Trial ends {new Date(trialEndsAt).toLocaleDateString()}</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][]).map(
          ([planKey, plan]) => (
            <Card
              key={planKey}
              className={planKey === currentPlan ? "ring-2 ring-indigo-600" : undefined}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>${plan.price}/month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 space-y-1 text-sm text-slate-600">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={planKey === currentPlan ? "secondary" : "default"}
                  disabled={planKey === currentPlan || loading !== null}
                  onClick={() => checkout(planKey)}
                >
                  {loading === planKey
                    ? "Redirecting..."
                    : planKey === currentPlan
                      ? "Current plan"
                      : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
