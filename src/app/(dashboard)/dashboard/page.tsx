import { format } from "date-fns";
import {
  Calendar,
  DollarSign,
  MessageSquare,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardMetrics } from "@/lib/services/metrics";
import { formatCurrency } from "@/lib/utils";

function getTrialDaysLeft(trialEndsAt?: Date | null) {
  if (!trialEndsAt) return null;
  const now = Date.now();
  return Math.max(
    0,
    Math.ceil((trialEndsAt.getTime() - now) / (1000 * 60 * 60 * 24)),
  );
}

export default async function DashboardPage() {
  const business = await requireBusiness();
  const metrics = await getDashboardMetrics(business.id);

  const [recentCalls, recentAppointments, openConversations] = await Promise.all([
    db.call.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
    db.appointment.findMany({
      where: { businessId: business.id, status: "SCHEDULED" },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { customer: true },
    }),
    db.conversation.count({
      where: { businessId: business.id, status: "OPEN" },
    }),
  ]);

  const trialDaysLeft = getTrialDaysLeft(business.subscription?.trialEndsAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            Revenue and activity for {business.aiName ?? business.name}
          </p>
        </div>
        {business.subscription?.status === "TRIALING" && trialDaysLeft !== null && (
          <Badge variant="warning">{trialDaysLeft} days left in trial</Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Revenue Recovered"
          value={metrics.revenueRecovered}
          icon={DollarSign}
          highlight
          trend="Last 30 days"
        />
        <MetricCard
          title="Calls Answered"
          value={metrics.callsAnswered}
          icon={Phone}
          trend="Last 30 days"
        />
        <MetricCard
          title="Missed Calls Recovered"
          value={metrics.missedCallsRecovered}
          icon={MessageSquare}
          trend="SMS sent within 30s"
        />
        <MetricCard
          title="Appointments Booked"
          value={metrics.appointmentsBooked}
          icon={Calendar}
          trend="Last 30 days"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Leads Converted"
          value={metrics.leadsConverted}
          icon={Users}
        />
        <MetricCard
          title="Reviews Generated"
          value={metrics.reviewsGenerated}
          icon={Star}
        />
        <MetricCard
          title="Open Conversations"
          value={openConversations}
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <p className="text-sm text-slate-500">No calls yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentCalls.map((call) => (
                  <li
                    key={call.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {call.customer?.name ?? call.fromNumber}
                      </p>
                      <p className="text-slate-500">
                        {format(call.createdAt, "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        call.status === "RECOVERED"
                          ? "success"
                          : call.status === "MISSED"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {call.status.toLowerCase()}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming appointments.</p>
            ) : (
              <ul className="space-y-3">
                {recentAppointments.map((appt) => (
                  <li
                    key={appt.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{appt.title}</p>
                      <p className="text-slate-500">
                        {appt.customer?.name ?? "Walk-in"} ·{" "}
                        {format(appt.scheduledAt, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {metrics.revenueRecovered > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Estimated monthly impact
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {formatCurrency(metrics.revenueRecovered)}
              </p>
            </div>
            <Badge variant="success">ROI positive</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
