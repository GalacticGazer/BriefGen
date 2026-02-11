# BriefGen.ai (Chunks 1-5)

BriefGen.ai is a Next.js App Router project with Tailwind CSS and TypeScript.
Chunks 1-5 include homepage UI, Stripe checkout/webhook flow, AI report generation, PDF creation, email delivery, and an admin dashboard for manual premium fulfillment.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Implemented routes

- `/` Homepage with category selection + checkout actions
- `/success?report_id=...` Polling status screen
- `/report/[id]` Placeholder report page
- `/api/create-checkout` Creates report + Stripe Checkout session
- `/api/webhook` Handles Stripe events and triggers generation
- `/api/generate-report` Generates report content + PDF + storage upload
- `/api/report-status?id=...` Returns `status`, `pdfUrl`, `reportType` for polling
- Delivery emails are sent through Resend after report generation
- `/admin` Password-protected operator dashboard
- `/api/admin/login` Sets admin session cookie
- `/api/admin/stats` Dashboard metrics
- `/api/admin/reports` Filterable report listing for admin
- `/api/admin/deliver` Manual premium fulfillment + PDF + delivery email

## Supabase setup

1. Create project and run `/Users/faz/briefgen/supabase/schema.sql`.
2. Create public Storage bucket named `reports`.

## Required environment variables

Use `/Users/faz/briefgen/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_URL`
- `INTERNAL_API_SECRET`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (recommended; e.g. `BriefGen.ai <reports@briefgen.ai>`)
- `ADMIN_PASSWORD`
- `OPERATOR_EMAIL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- Optional: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

## AI model switch

Edit one line in `/Users/faz/briefgen/lib/config.ts`:

- `AI_CONFIG.model`

## Stripe webhook local testing

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Testing

Run the fast unit + route integration suite:

```bash
npm run test
```

Run once (CI mode):

```bash
npm run test:run
```

Run with coverage:

```bash
npm run test:coverage
```

Run the low-cost browser smoke test (manual/on-demand):

```bash
npx playwright install chromium
npm run test:smoke
```

## Validation

```bash
npm run test:run
npm run lint
npm run build
```
