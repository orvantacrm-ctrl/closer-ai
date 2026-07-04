# Closer AI

**The AI Employee That Never Misses a Customer**

Closer AI is a SaaS platform for local businesses to deploy an AI receptionist in under 10 minutes. It answers calls, recovers missed calls via SMS, books appointments, and tracks revenue impact.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Full-stack React, API routes, SSR for dashboard |
| Auth | Clerk | Production SaaS auth, social login, session management |
| Database | Prisma + SQLite (dev) | Type-safe ORM; swap `DATABASE_URL` for PostgreSQL in prod |
| Billing | Stripe | Subscriptions + 7-day trial |
| SMS/Voice | Twilio | Industry standard; stub mode when keys missing |
| UI | Tailwind 4 + Lucide | Mobile-first, minimal custom CSS |

## MVP (v1) — What's Built

- Landing page with pricing
- Clerk auth (sign up / sign in)
- 3-step onboarding wizard
- Dashboard with revenue metrics
- Conversations, Calls, Appointments, Customers
- Missed call recovery service + Twilio webhook
- Stripe checkout + webhook handlers
- Billing page with plan selection
- Settings + integration docs
- Seed script with demo data

## v2 / v3 (Placeholders)

- Reviews, Campaigns, AI Builder UI → v2
- Marketplace → v3

## Quick Start

### 1. Prerequisites

Node.js 20+ and npm.

### 2. Install

```bash
cd ~/Projects/closer-ai
npm install
```

### 3. Environment

Copy `.env.example` to `.env` and fill in keys:

- **Clerk** — [dashboard.clerk.com](https://dashboard.clerk.com) (required to run auth)
- **Stripe** — optional until you test billing
- **Twilio** — optional; SMS runs in stub mode without keys

### 4. Database

```bash
npm run db:push
npm run db:seed   # optional demo data
```

### 5. Run

```bash
npm run dev
```

When running locally, open http://localhost:3000. After deployment, your app will be available at `https://<your-vercel-domain>`.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/   # Protected app pages
│   ├── api/                     # Onboarding, billing, webhooks
│   ├── onboarding/              # Setup wizard
│   └── page.tsx                 # Landing
├── components/
│   ├── dashboard/               # Sidebar, metric cards
│   └── ui/                      # Button, Card, Input, Badge
└── lib/
    ├── auth.ts                  # User + business helpers
    ├── services/                # SMS, missed-call, metrics
    └── stripe.ts                # Billing helpers
prisma/
└── schema.prisma                # Data model
```

## Webhooks

| Endpoint | Purpose |
|----------|---------|
| `POST /api/webhooks/twilio/voice` | Missed call detection → SMS recovery |
| `POST /api/webhooks/stripe` | Subscription lifecycle |

## Architecture Notes

- **One business per user** in v1 (Agency multi-business comes later)
- **Service layer** in `lib/services/` keeps Twilio/Stripe logic out of route handlers
- **Metrics** aggregated in `DailyMetric` for fast dashboard reads
- **Stub mode** for Twilio when env vars are missing — logs SMS instead of sending

## Next Steps

1. Add Clerk keys and sign up
2. Complete onboarding
3. Connect Twilio for live missed-call recovery
4. Create Stripe products + price IDs for billing
5. Wire OpenAI for conversational AI responses
