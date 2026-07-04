import type { Plan } from "@prisma/client";

export const APP_NAME = "Closer AI";
export const APP_TAGLINE = "The AI Employee That Never Misses a Customer";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/conversations", label: "Conversations", icon: "MessageSquare" },
  { href: "/dashboard/calls", label: "Calls", icon: "Phone" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "Calendar" },
  { href: "/dashboard/customers", label: "Customers", icon: "Users" },
  { href: "/dashboard/reviews", label: "Reviews", icon: "Star" },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: "Megaphone" },
  { href: "/dashboard/ai-builder", label: "AI Builder", icon: "Bot" },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: "Store" },
  { href: "/dashboard/billing", label: "Billing", icon: "CreditCard" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
] as const;

export const PLANS: Record<
  Plan,
  {
    name: string;
    price: number;
    description: string;
    features: string[];
    highlighted?: boolean;
  }
> = {
  STARTER: {
    name: "Starter",
    price: 99,
    description: "Perfect for single-location businesses getting started.",
    features: [
      "1 AI receptionist",
      "SMS support",
      "Call answering",
      "Basic dashboard",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 299,
    description: "Full automation for growing service businesses.",
    features: [
      "Everything in Starter",
      "Lead automation",
      "Follow-up campaigns",
      "Customer reactivation",
      "Review generation",
      "Analytics dashboard",
    ],
    highlighted: true,
  },
  AGENCY: {
    name: "Agency",
    price: 999,
    description: "Manage unlimited businesses with white-label access.",
    features: [
      "Unlimited businesses",
      "White labeling",
      "Marketplace publishing",
      "Team access",
      "Priority support",
    ],
  },
};

export const INDUSTRIES = [
  "HVAC",
  "Plumbing",
  "Roofing",
  "Electrical",
  "Auto Repair",
  "Barbershop / Salon",
  "Dental / Medical",
  "Real Estate",
  "Insurance",
  "Church / Nonprofit",
  "Other",
] as const;

export const AI_TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
] as const;

export const TRIAL_DAYS = 7;
