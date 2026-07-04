"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LockedFeaturePromptProps {
  feature: string;
  requiredPlan: string;
}

export default function LockedFeaturePrompt({ feature, requiredPlan }: LockedFeaturePromptProps) {
  return (
    <Card className="border border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle>{feature} is locked</CardTitle>
        <CardDescription>
          Upgrade to {requiredPlan} to unlock this feature.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-amber-900">
        <p>
          Your current plan does not include this capability. Upgrade to get full access.
        </p>
        <Button asChild>
          <Link href="/dashboard/billing">View upgrade options</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
