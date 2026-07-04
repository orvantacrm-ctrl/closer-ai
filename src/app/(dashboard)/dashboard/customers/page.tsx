import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPhone } from "@/lib/utils";

export default async function CustomersPage() {
  const business = await requireBusiness();
  const customers = await db.customer.findMany({
    where: { businessId: business.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-slate-600">Contacts captured by your AI receptionist</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer list ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-slate-500">No customers yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <li key={customer.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-slate-500">
                      {customer.phone ? formatPhone(customer.phone) : "No phone"}
                      {customer.email ? ` · ${customer.email}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {customer.lastContactAt
                      ? `Last contact ${format(customer.lastContactAt, "MMM d")}`
                      : "New"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
