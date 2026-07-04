"use client";

import React, { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { Plan } from "@prisma/client";

type Props = {
  children?: React.ReactNode;
  size?: ButtonProps["size"];
  className?: string;
  variant?: ButtonProps["variant"];
  plan?: Plan;
};

export default function StartTrialButton({
  children,
  size,
  className,
  variant,
  plan = "STARTER",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    console.log("[StartTrialButton] calling /api/stripe/checkout", { plan });

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      console.log("[StartTrialButton] response", { status: res.status, ok: res.ok, data });

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      const message = data?.error || "No checkout URL returned";
      console.error("[StartTrialButton] checkout failed", message);
      setError(message);
    } catch (err) {
      console.error("[StartTrialButton] fetch error", err);
      setError(err instanceof Error ? err.message : "Checkout request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting..." : children}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
