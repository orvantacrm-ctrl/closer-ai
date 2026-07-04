import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";

export default async function SettingsPage() {
  const business = await requireBusiness();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-600">Business profile and integrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name:</span> {business.name}
          </p>
          <p>
            <span className="font-medium">Industry:</span> {business.industry}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {business.phone}
          </p>
          <p>
            <span className="font-medium">Email:</span> {business.email}
          </p>
          <p>
            <span className="font-medium">Timezone:</span> {business.timezone}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Add API keys to `.env` to enable live integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-900">Twilio</span> — SMS and voice
            for missed call recovery
          </p>
          <p>
            <span className="font-medium text-slate-900">Stripe</span> — Subscription
            billing and 7-day trial
          </p>
          <p>
            <span className="font-medium text-slate-900">OpenAI</span> — AI receptionist
            responses (coming next)
          </p>
          <p className="text-xs text-slate-400">
            Twilio webhook: POST /api/webhooks/twilio/voice
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
