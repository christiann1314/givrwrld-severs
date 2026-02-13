# GIVRwrld Servers Monorepo

This repository is now organized as a **frontend + backend monorepo** so you can run local development exactly like production architecture.

## Project layout

```text
givrwrld-severs/
├── frontend/   # Vite + React + Tailwind UI
├── backend/    # Node/Express API (auth, checkout, orders, servers)
├── supabase/   # SQL/functions history and migration artifacts
└── package.json # root dev orchestrator scripts
```

## Local setup (first-time)

1. Install root tooling (runs both services from one command):
   ```bash
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   npm install --prefix frontend
   ```
3. Install backend dependencies:
   ```bash
   npm install --prefix backend
   ```
4. Configure frontend env:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```
   - Set `VITE_API_URL=http://localhost:3001`
   - Set Stripe publishable key for your environment.
5. Configure backend env:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in DB, Stripe, JWT, and panel credentials.

## Run locally

Start both apps together:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3001/health`

## Production readiness snapshot

You are **close on core product plumbing**, but still need a strict go-live pass in these areas:

1. **Security hardening**
   - final CORS allowlist
   - rate limiting + abuse protection
   - secret rotation and vaulting
2. **Billing reliability**
   - webhook replay/idempotency verification
   - refund/cancellation handling
   - failed payment lifecycle automation
3. **Provisioning reliability**
   - retry queues for panel provisioning
   - reconciliation jobs for drifted server state
   - operational alerts on provisioning failures
4. **Operations / SRE baseline**
   - centralized logs + dashboards
   - uptime checks + on-call playbook
   - backup/restore runbooks tested
5. **Go-live quality gate**
   - end-to-end purchase test in live-like env
   - load test on checkout/provisioning path
   - rollback plan with documented owner actions

## Suggested execution order

1. Stabilize local/dev parity (done by this repo layout).
2. Lock auth + billing edge cases.
3. Validate one-click provisioning reliability.
4. Add observability + incident runbooks.
5. Run staged beta, then public launch.
