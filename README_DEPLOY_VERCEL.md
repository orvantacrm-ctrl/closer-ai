# Deploy to Vercel (Quick Guide)

This project is a Next.js App Router app. Follow these steps to deploy to Vercel and configure environment variables required for Stripe, Clerk, Twilio, and OpenAI.

1) Connect repo to Vercel
- Go to https://vercel.com/new and import this repository, or use the Vercel CLI.

2) Set environment variables (Vercel dashboard)
- In your Vercel project > Settings > Environment Variables, add the following keys (set for `Production`):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
  - `OPENAI_API_KEY`
  - `DATABASE_URL` (if using hosted DB)
  - `NEXT_PUBLIC_APP_URL` (e.g., `https://your-app.vercel.app`)

3) Deploy using Vercel CLI (optional)
```bash
# Install Vercel CLI if you haven't
npm i -g vercel
# Login
vercel login
# From repo root
vercel --prod
```

4) Configure Stripe webhooks
- Add webhook endpoint in Stripe dashboard:
  - `https://<your-vercel-domain>/api/webhooks/stripe` (or the route used in your project)
- Use the returned signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel.

5) Configure Twilio voice webhook
- In Twilio Console, set the Voice webhook URL for the Twilio phone number to:
  - `https://<your-vercel-domain>/api/webhooks/twilio/voice` (HTTP POST)

6) Replace localhost/ngrok in documentation
- Search for `localhost` or `ngrok` in repo and replace in docs or `.env` files with your production `NEXT_PUBLIC_APP_URL`.

7) Verify endpoints
- After deployment, confirm `https://<your-vercel-domain>/api/webhooks/twilio/voice` is reachable (curl or Postman) and returns XML `<Response><Say>...`.

Example curl test:
```bash
curl -X POST https://<your-vercel-domain>/api/webhooks/twilio/voice -d "From=+1234567890&To=<YOUR_TWILIO_NUMBER>"
```

If you want, I can attempt a deploy from this environment using the Vercel CLI — provide a Vercel token or confirm you want me to run `vercel` interactively here.
