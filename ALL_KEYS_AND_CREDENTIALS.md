# All Keys and Credentials Found in Codebase

**Date:** 2025-11-09  
**⚠️ SECURITY NOTE:** Some keys are public-safe (publishable), others are SECRET and should never be exposed.

---

## 🔑 Frontend Keys (Public-Safe)

### Supabase Configuration

**Project URL:**
```
https://mjhvkvnshnbnxojnandf.supabase.co
```

**Functions URL:**
```
https://mjhvkvnshnbnxojnandf.functions.supabase.co
```

**Anon Key (JWT - Public Safe):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw
```

**Location:**
- `src/config/environment.ts`
- `src/config/env.ts`
- `src/integrations/supabase/client.ts`

---

### Stripe Configuration

**Publishable Key (LIVE - Public Safe):**
```
pk_live_51RZPGzB3VffY65l6PSOmZdnbQsnPQmXdaHvXkPwzq2Ieq5CvzY9PlQaxf97C8PMLj8YfhQtW9AUrK4rofbj7ZXTY004OFKWBqh
```

**Location:**
- `src/config/environment.ts` (fallback)

**Status:** ✅ LIVE Mode (not test)

---

### Pterodactyl Configuration

**Panel URL:**
```
https://panel.givrwrldservers.com
```

**Location:**
- `src/config/environment.ts`
- `src/config/env.ts`

---

## 🔐 Backend Secrets (Set in Supabase Edge Functions)

### Supabase Secrets

**Required Environment Variables:**
- `SUPABASE_URL` = `https://mjhvkvnshnbnxojnandf.supabase.co`
- `SUPABASE_ANON_KEY` = (JWT format - same as frontend)
- `SUPABASE_SERVICE_ROLE_KEY` = (Set in Supabase Dashboard → Edge Functions → Secrets)
- `SUPABASE_DB_URL` = (PostgreSQL connection string)

**Status:** ⚠️ **Service Role Key is SECRET** - Not in codebase (correct)

---

### Stripe Secrets

**Required Environment Variables:**
- `STRIPE_SECRET_KEY` = (Should start with `sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` = (Should start with `whsec_...`)

**Status:** ⚠️ **Both are SECRET** - Not in codebase (correct)

**Usage:**
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-checkout-session/index.ts`

---

### Pterodactyl Secrets

**Required Environment Variables:**
- `PANEL_URL` = `https://panel.givrwrldservers.com` (or `PTERODACTYL_URL`)
- `PTERO_APP_KEY` = (Application API key, starts with `ptla_...`)
- `PTERODACTYL_API_KEY` = (Fallback name, same as `PTERO_APP_KEY`)
- `PTERO_CLIENT_KEY` = (Optional, starts with `ptlc_...`)

**Status:** ⚠️ **API Keys are SECRET** - Not in codebase (correct)

**Usage:**
- `supabase/functions/servers-provision/index.ts`
- `supabase/functions/sync-all-data/index.ts`
- `supabase/functions/start-server/index.ts`
- `supabase/functions/stop-server/index.ts`

---

## 💳 Stripe Price IDs (From Documentation)

### Minecraft Plans
- `mc-1gb` → `price_1SPmR6B3VffY65l6oa9Vc1T4`
- `mc-2gb` → `price_1SPmR6B3VffY65l6Ya3UxaOt`
- `mc-4gb` → `price_1SPmR7B3VffY65l61o7vcnLj`
- `mc-8gb` → `price_1SPmR7B3VffY65l68V9C5v6W`
- `mc-16gb` → `price_1SPmR8B3VffY65l6eqd679dM`

### Rust Plans
- `rust-3gb` → `price_1SPmUhB3VffY65l6HJUM5I6P`
- `rust-6gb` → `price_1SPmUiB3VffY65l6Yax8JGJT`
- `rust-8gb` → `price_1SPmUiB3VffY65l6zkKjQcsP`
- `rust-12gb` → `price_1SPmUjB3VffY65l6lRm0CDLF`

### Palworld Plans
- `palworld-4gb` → `price_1SQK3YB3VffY65l6mttysyH7`
- `palworld-8gb` → `price_1SQK3aB3VffY65l65HvxiHLC`
- `palworld-16gb` → `price_1SQK3cB3VffY65l6s3NcHy0Y`

### ARK Plans
- `ark-4gb` → `price_1SPmWnB3VffY65l61pDqOIFb`
- `ark-8gb` → `price_1SPmWnB3VffY65l67sv6bQRF`
- `ark-16gb` → `price_1SPmWoB3VffY65l6IuunmP51`

### Terraria Plans
- `terraria-1gb` → `price_1SPmWoB3VffY65l6h8gabJi1`
- `terraria-2gb` → `price_1SPmWpB3VffY65l6MEZw3ob6`
- `terraria-4gb` → `price_1SPmWpB3VffY65l6LVSBoOrj`

### Factorio Plans
- `factorio-2gb` → `price_1SPmbFB3VffY65l6UJpNHuoD`
- `factorio-4gb` → `price_1SPmbFB3VffY65l6WnwX5pkK`
- `factorio-8gb` → `price_1SPmbGB3VffY65l6hH7aNUc1`

### Among Us Plans
- `among-us-1gb` → (Check database)
- `among-us-2gb` → (Check database)
- `among-us-4gb` → `price_1SPmbNB3VffY65l68KrkZAJT`

**Note:** More price IDs exist in SQL archive files. Verify in database.

---

## 📋 Environment Variables Summary

### Frontend (VITE_*)
```bash
VITE_SUPABASE_URL=https://mjhvkvnshnbnxojnandf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw
VITE_SUPABASE_FUNCTIONS_URL=https://mjhvkvnshnbnxojnandf.functions.supabase.co
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RZPGzB3VffY65l6PSOmZdnbQsnPQmXdaHvXkPwzq2Ieq5CvzY9PlQaxf97C8PMLj8YfhQtW9AUrK4rofbj7ZXTY004OFKWBqh
VITE_PANEL_URL=https://panel.givrwrldservers.com
VITE_APP_URL=https://givrwrldservers.com
VITE_APP_NAME=GIVRWRLD Servers
```

### Backend (Supabase Edge Functions Secrets)
```bash
# Supabase
SUPABASE_URL=https://mjhvkvnshnbnxojnandf.supabase.co
SUPABASE_ANON_KEY=(Same as frontend)
SUPABASE_SERVICE_ROLE_KEY=(SECRET - Set in Dashboard)
SUPABASE_DB_URL=(SECRET - PostgreSQL connection string)

# Stripe
STRIPE_SECRET_KEY=(SECRET - Should be sk_live_...)
STRIPE_WEBHOOK_SECRET=(SECRET - Should be whsec_...)

# Pterodactyl
PANEL_URL=https://panel.givrwrldservers.com
PTERO_APP_KEY=(SECRET - Should be ptla_...)
PTERODACTYL_API_KEY=(SECRET - Same as PTERO_APP_KEY, fallback)
PTERO_CLIENT_KEY=(Optional - Should be ptlc_...)

# CORS
ALLOW_ORIGINS=https://givrwrldservers.com,https://www.givrwrldservers.com,http://localhost:5173

# Alerts (Optional)
ALERTS_WEBHOOK=(Optional - Discord/Slack webhook URL)
```

---

## 🔒 Security Status

### ✅ Public Keys (Safe to Expose)
- ✅ Supabase Anon Key (JWT)
- ✅ Stripe Publishable Key (`pk_live_...`)
- ✅ Supabase URLs
- ✅ Pterodactyl Panel URL

### ⚠️ Secret Keys (NOT in Codebase - Correct)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - Set in Supabase Dashboard
- ⚠️ `STRIPE_SECRET_KEY` - Set in Supabase Dashboard
- ⚠️ `STRIPE_WEBHOOK_SECRET` - Set in Supabase Dashboard
- ⚠️ `PTERO_APP_KEY` - Set in Supabase Dashboard
- ⚠️ `PTERODACTYL_API_KEY` - Set in Supabase Dashboard

**Status:** ✅ **All secrets are properly stored in Supabase Edge Functions secrets, not in codebase.**

---

## 📍 Key Locations

### Frontend Configuration Files
1. `src/config/environment.ts` - Main config with fallbacks
2. `src/config/env.ts` - Alternative config
3. `src/integrations/supabase/client.ts` - Supabase client initialization

### Backend Configuration
- All secrets accessed via `Deno.env.get()` in Edge Functions
- Set in Supabase Dashboard → Edge Functions → Secrets

### Documentation Files (Reference Only)
- `PRODUCTION_ENV_SETUP.md`
- `LIVE_BACKEND_VERIFICATION.md`
- `QUICK_SETUP_GUIDE.md`
- Various SQL files with Stripe price IDs

---

## ✅ Verification Checklist

- [x] Supabase Anon Key found (public-safe)
- [x] Stripe Publishable Key found (LIVE mode)
- [x] Supabase URLs found
- [x] Pterodactyl Panel URL found
- [x] No secret keys in codebase (correct)
- [x] All secrets should be in Supabase Dashboard

---

**Generated:** 2025-11-09  
**Note:** Secret keys are intentionally NOT in codebase. They should be set in Supabase Dashboard → Edge Functions → Secrets.



