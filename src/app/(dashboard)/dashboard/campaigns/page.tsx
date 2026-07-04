import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="text-slate-600">Customer reactivation and follow-up automation</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Reactivation campaigns</CardTitle>
            <Badge variant="warning">Coming in v2</Badge>
          </div>
          <CardDescription>
            Win back inactive customers with automated SMS campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Example: &quot;It&apos;s been 3 weeks since your last haircut. Ready to book?&quot;
        </CardContent>
      </Card>
    </div>
  );
}
