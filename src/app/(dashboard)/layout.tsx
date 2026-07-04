import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { DashboardSidebar, MobileNav } from "@/components/dashboard/sidebar";
import { getActiveBusiness, getOrCreateUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser();
  const business = await getActiveBusiness(user.id);

  if (!business?.onboardingDone) {
    redirect("/onboarding");
  }

  if (!business?.subscription || business.subscription.status !== "ACTIVE") {
    console.warn("[dashboard] access denied, redirecting to pricing", {
      businessId: business?.id,
      subscriptionStatus: business?.subscription?.status,
    });
    redirect("/pricing");
  }

  console.log("[dashboard] access granted", {
    businessId: business.id,
    subscriptionStatus: business.subscription.status,
    plan: business.subscription.plan,
  });

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        businessName={business.name}
        currentPlan={business.subscription.plan}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          businessName={business.name}
          currentPlan={business.subscription.plan}
        />
        <header className="hidden h-16 items-center justify-end border-b border-slate-200 bg-white px-6 lg:flex">
          <UserButton />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
