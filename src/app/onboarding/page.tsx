"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_TONES, APP_NAME, INDUSTRIES } from "@/lib/constants";

const STEPS = ["Business", "AI Setup", "Go Live"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    phone: "",
    email: "",
    timezone: "America/New_York",
    aiName: "",
    aiTone: "professional",
    services: "",
  });

  async function completeOnboarding() {
    setLoading(true);
    setError(null);

    const services = form.services
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        services,
        hours: {
          monday: { open: "09:00", close: "17:00" },
          tuesday: { open: "09:00", close: "17:00" },
          wednesday: { open: "09:00", close: "17:00" },
          thursday: { open: "09:00", close: "17:00" },
          friday: { open: "09:00", close: "17:00" },
        },
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
          C
        </div>
        <h1 className="text-2xl font-bold">Welcome to {APP_NAME}</h1>
        <p className="mt-2 text-slate-600">
          Set up your AI receptionist in under 10 minutes.
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              index === step
                ? "bg-indigo-600 text-white"
                : index < step
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "Tell us about your business."}
            {step === 1 && "Configure your AI receptionist personality."}
            {step === 2 && "Review and launch your AI employee."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mike's HVAC"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  id="industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Business phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Business email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@mikeshvac.com"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label htmlFor="aiName">AI receptionist name</Label>
                <Input
                  id="aiName"
                  value={form.aiName}
                  onChange={(e) => setForm({ ...form, aiName: e.target.value })}
                  placeholder={`${form.name || "Your business"} AI Receptionist`}
                />
              </div>
              <div>
                <Label htmlFor="aiTone">Tone of voice</Label>
                <Select
                  id="aiTone"
                  value={form.aiTone}
                  onChange={(e) => setForm({ ...form, aiTone: e.target.value })}
                >
                  {AI_TONES.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="services">Services (one per line)</Label>
                <textarea
                  id="services"
                  className="mt-1 flex min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.services}
                  onChange={(e) => setForm({ ...form, services: e.target.value })}
                  placeholder={"AC Repair\nFurnace Installation\nMaintenance Plans"}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
              <p>
                <span className="font-medium">Business:</span> {form.name}
              </p>
              <p>
                <span className="font-medium">Industry:</span> {form.industry}
              </p>
              <p>
                <span className="font-medium">AI Name:</span>{" "}
                {form.aiName || `${form.name} AI Receptionist`}
              </p>
              <p>
                <span className="font-medium">Trial:</span> 7 days free, then $99/mo
                Starter plan
              </p>
              <p className="text-slate-600">
                Connect Twilio and Stripe in Settings after launch to enable live
                calls and billing.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={completeOnboarding} disabled={loading}>
                {loading ? "Launching..." : "Launch AI Receptionist"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
