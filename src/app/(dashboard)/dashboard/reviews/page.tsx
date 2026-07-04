import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-slate-600">Automated review requests after completed jobs</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Review generation</CardTitle>
            <Badge variant="warning">Coming in v2</Badge>
          </div>
          <CardDescription>
            Google, Facebook, SMS, and email review requests with tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Included in the Professional plan. We&apos;ll wire this up in the next sprint.
        </CardContent>
      </Card>
    </div>
  );
}
