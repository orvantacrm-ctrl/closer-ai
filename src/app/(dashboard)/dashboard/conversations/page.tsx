import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ConversationsPage() {
  const business = await requireBusiness();
  const conversations = await db.conversation.findMany({
    where: { businessId: business.id },
    orderBy: { updatedAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-slate-600">SMS, call, and web chat threads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All conversations ({conversations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500">
              No conversations yet. They appear when your AI responds to calls or texts.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">
                      {conversation.customer?.name ?? "Unknown customer"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {conversation.lastMessage ?? conversation.subject}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(conversation.updatedAt, "MMM d, h:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{conversation.channel}</Badge>
                    <Badge
                      variant={
                        conversation.status === "OPEN"
                          ? "default"
                          : conversation.status === "ESCALATED"
                            ? "warning"
                            : "success"
                      }
                    >
                      {conversation.status.toLowerCase()}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
