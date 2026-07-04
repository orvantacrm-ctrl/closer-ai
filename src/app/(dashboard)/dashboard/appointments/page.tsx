import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AppointmentsPage() {
  const business = await requireBusiness();
  const appointments = await db.appointment.findMany({
    where: { businessId: business.id },
    orderBy: { scheduledAt: "asc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-slate-600">Bookings made by your AI receptionist</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All appointments ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No appointments booked yet. Your AI will schedule them from calls and texts.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{appt.title}</p>
                    <p className="text-sm text-slate-500">
                      {appt.customer?.name ?? "Walk-in"} ·{" "}
                      {format(appt.scheduledAt, "EEEE, MMM d · h:mm a")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      appt.status === "SCHEDULED"
                        ? "default"
                        : appt.status === "COMPLETED"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {appt.status.toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
