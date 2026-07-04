import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-slate-600">
          Install industry-specific AI receptionist templates
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>AI Template Marketplace</CardTitle>
            <Badge variant="warning">Coming in v3</Badge>
          </div>
          <CardDescription>
            Browse, rate, and one-click install templates like &quot;Best HVAC Receptionist&quot;
            or &quot;Luxury Barber AI&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Creators earn commissions when others install their templates.
        </CardContent>
      </Card>
    </div>
  );
}
