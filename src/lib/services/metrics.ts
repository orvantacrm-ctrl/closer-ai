import { db } from "@/lib/db";
import { startOfDay, subDays } from "date-fns";

export interface DashboardMetrics {
  revenueRecovered: number;
  callsAnswered: number;
  missedCallsRecovered: number;
  appointmentsBooked: number;
  leadsConverted: number;
  reviewsGenerated: number;
  customersReactivated: number;
}

export async function getDashboardMetrics(
  businessId: string,
  days = 30
): Promise<DashboardMetrics> {
  const since = startOfDay(subDays(new Date(), days));

  const metrics = await db.dailyMetric.findMany({
    where: {
      businessId,
      date: { gte: since },
    },
  });

  return metrics.reduce<DashboardMetrics>(
    (acc, row) => ({
      revenueRecovered: acc.revenueRecovered + row.revenueRecovered,
      callsAnswered: acc.callsAnswered + row.callsAnswered,
      missedCallsRecovered: acc.missedCallsRecovered + row.missedCallsRecovered,
      appointmentsBooked: acc.appointmentsBooked + row.appointmentsBooked,
      leadsConverted: acc.leadsConverted + row.leadsConverted,
      reviewsGenerated: acc.reviewsGenerated + row.reviewsGenerated,
      customersReactivated: acc.customersReactivated,
    }),
    {
      revenueRecovered: 0,
      callsAnswered: 0,
      missedCallsRecovered: 0,
      appointmentsBooked: 0,
      leadsConverted: 0,
      reviewsGenerated: 0,
      customersReactivated: 0,
    }
  );
}

export async function incrementMetric(
  businessId: string,
  field: keyof Omit<DashboardMetrics, "customersReactivated">,
  amount = 1
): Promise<void> {
  const today = startOfDay(new Date());

  await db.dailyMetric.upsert({
    where: {
      businessId_date: { businessId, date: today },
    },
    create: {
      businessId,
      date: today,
      [field]: amount,
    },
    update: {
      [field]: { increment: amount },
    },
  });
}
