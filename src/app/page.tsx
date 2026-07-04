import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calendar,
  MessageSquare,
  Phone,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@prisma/client";
import { APP_NAME, APP_TAGLINE, PLANS } from "@/lib/constants";
import StartTrialButton from "@/components/start-trial-button";

const features = [
  {
    icon: Bot,
    title: "AI Receptionist",
    description:
      "Answers calls and texts 24/7, books appointments, and follows your business scripts.",
  },
  {
    icon: Phone,
    title: "Missed Call Recovery",
    description:
      "Automatically texts missed callers within 30 seconds with booking options.",
  },
  {
    icon: MessageSquare,
    title: "Instant Lead Response",
    description:
      "Responds to website forms, ads, and DMs instantly — qualify and book on autopilot.",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description:
      "Your AI checks availability and books customers without back-and-forth.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Dashboard",
    description:
      "Track recovered revenue, booked appointments, and ROI in one place.",
  },
  {
    icon: Star,
    title: "Review Generation",
    description:
      "Automatically request Google and Facebook reviews after every completed job.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              C
            </div>
            <span className="text-lg font-semibold">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <StartTrialButton>Start free trial</StartTrialButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          Deploy in under 10 minutes
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          {APP_TAGLINE}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Closer AI answers calls, recovers missed leads, books appointments, and
          generates revenue for local businesses — without hiring a receptionist.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <StartTrialButton size="lg">
            Start 7-day free trial
            <ArrowRight className="h-4 w-4" />
          </StartTrialButton>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">View pricing</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          No setup fees · Full access during trial · Cancel anytime
        </p>
      </section>

      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Everything your front desk should do — automatically
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 p-6"
              >
                <feature.icon className="h-8 w-8 text-indigo-600" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Simple pricing that pays for itself
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Most businesses recover the subscription cost from a single missed call.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl border p-6 ${
                  plan.highlighted
                    ? "border-indigo-600 bg-indigo-50/50 shadow-lg ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Most popular
                  </span>
                )}
                <h3 className="mt-2 text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-slate-500">/month</span>
                </p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-emerald-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <StartTrialButton
                  plan={key}
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Start free trial
                </StartTrialButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
