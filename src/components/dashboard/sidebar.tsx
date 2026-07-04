"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Phone,
  Settings,
  Star,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { ROUTE_PLAN_REQUIREMENTS, isPlanAtLeast, getRequiredPlanName } from "@/lib/plan";
import type { Plan } from "@prisma/client";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  MessageSquare,
  Phone,
  Calendar,
  Users,
  Star,
  Megaphone,
  Bot,
  Store,
  CreditCard,
  Settings,
};

export function DashboardSidebar({
  businessName,
  currentPlan,
}: {
  businessName: string;
  currentPlan: Plan;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          C
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{APP_NAME}</p>
          <p className="truncate text-xs text-slate-500">{businessName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const requiredPlan = ROUTE_PLAN_REQUIREMENTS[item.href];
          const locked = requiredPlan && !isPlanAtLeast(currentPlan, requiredPlan);

          if (locked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex flex-1 items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    {getRequiredPlanName(item.href)}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({
  businessName,
  currentPlan,
}: {
  businessName: string;
  currentPlan: Plan;
}) {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 bg-white lg:hidden">
      <div className="flex h-14 items-center px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          C
        </div>
        <div className="ml-2 min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{businessName}</p>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 pb-2">
        {NAV_ITEMS.slice(0, 6).map((item) => {
          const active = pathname.startsWith(item.href);
          const requiredPlan = ROUTE_PLAN_REQUIREMENTS[item.href];
          const locked = requiredPlan && !isPlanAtLeast(currentPlan, requiredPlan);

          return locked ? (
            <div
              key={item.href}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              {item.label}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
