import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireBusiness } from "@/lib/auth";

export default async function AiBuilderPage() {
  const business = await requireBusiness();
  const services = JSON.parse(business.servicesJson || "[]") as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Builder</h1>
        <p className="text-slate-600">Configure your AI receptionist</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{business.aiName ?? "Your AI Receptionist"}</CardTitle>
            <Badge variant="success">Active</Badge>
          </div>
          <CardDescription>
            Full visual builder coming in v2. Current config from onboarding:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">Tone:</span> {business.aiTone}
          </p>
          <p>
            <span className="font-medium">Services:</span>{" "}
            {services.length ? services.join(", ") : "None configured"}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {business.phone ?? "Not set"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
