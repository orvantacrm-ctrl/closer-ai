import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPhone } from "@/lib/utils";

export default async function CallsPage() {
  const business = await requireBusiness();
  const calls = await db.call.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calls</h1>
        <p className="text-slate-600">Answered, missed, and recovered calls</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call log ({calls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <p className="text-sm text-slate-500">
              No calls yet. Connect Twilio in Settings to start receiving calls.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {calls.map((call) => (
                <li key={call.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">
                      {call.customer?.name ?? formatPhone(call.fromNumber)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(call.createdAt, "MMM d, h:mm a")}
                      {call.durationSeconds
                        ? ` · ${Math.ceil(call.durationSeconds / 60)} min`
                        : ""}
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
                    {call.recovered ? "recovered" : call.status.toLowerCase()}
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
