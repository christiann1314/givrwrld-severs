# Supabase New API Keys - Migration Guide

**Date:** 2025-11-07  
**Status:** ⚠️ **Awareness - No Immediate Action Required**

---

## Overview

Supabase has introduced new API key formats:
- **New Format:** `sb_publishable_...` and `sb_secret_...`
- **Old Format:** JWT tokens (`eyJhbGci...`)

**Good News:** Both formats work! The old keys are still fully functional.

---

## Current Setup

### Frontend
- Uses: `VITE_SUPABASE_ANON_KEY` (old JWT format)
- Location: `src/integrations/supabase/client.ts`
- Status: ✅ Working

### Edge Functions
- Uses: `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (old JWT format)
- Location: Supabase Edge Functions secrets
- Status: ✅ Working

---

## New Keys Available

From Supabase Dashboard:
- **Publishable Key:** `sb_publishable___jaqpjR0s2bgEMxG9gjsg_pgaezEI4`
- **Secret Key:** `sb_secret_2B6kd4tA82dtz2FDCK3YcA_eoU9j4lv`

---

## Compatibility

✅ **Backward Compatible:**
- Old JWT keys (`eyJhbGci...`) still work
- New keys (`sb_publishable_...`) work with existing code
- Supabase client supports both formats
- No code changes required

---

## Migration Path (When Ready)

### Step 1: Update Frontend Environment Variables

**File:** `.env` or production environment
```bash
# Old format (still works)
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# New format (optional migration)
VITE_SUPABASE_ANON_KEY=sb_publishable___jaqpjR0s2bgEMxG9gjsg_pgaezEI4
```

### Step 2: Update Edge Function Secrets

**In Supabase Dashboard:**
1. Go to: Edge Functions → Secrets
2. Update `SUPABASE_ANON_KEY` to new publishable key
3. Update `SUPABASE_SERVICE_ROLE_KEY` to new secret key

**Or via CLI:**
```bash
npx supabase secrets set --project-ref mjhvkvnshnbnxojnandf \
  SUPABASE_ANON_KEY="sb_publishable___jaqpjR0s2bgEMxG9gjsg_pgaezEI4"

npx supabase secrets set --project-ref mjhvkvnshnbnxojnandf \
  SUPABASE_SERVICE_ROLE_KEY="sb_secret_2B6kd4tA82dtz2FDCK3YcA_eoU9j4lv"
```

### Step 3: Test Thoroughly

1. Test frontend authentication
2. Test Edge Function calls
3. Test webhook processing
4. Test server provisioning
5. Monitor for any errors

---

## Recommendation

### ✅ **Keep Using Old Keys (Current Status)**
- Production is working
- No immediate need to migrate
- Old keys are still supported
- No breaking changes

### 🔄 **Plan Migration (Future)**
- Schedule during maintenance window
- Test in staging first
- Update documentation
- Monitor for issues

---

## Benefits of New Keys

1. **Better Security Features**
   - Enhanced key management
   - Better access controls
   - Improved audit logging

2. **Future-Proof**
   - Aligned with Supabase's direction
   - Better long-term support

3. **No Code Changes Required**
   - Drop-in replacement
   - Same functionality

---

## Important Notes

⚠️ **Don't Mix Formats:**
- Use either old keys OR new keys
- Don't mix them in the same environment
- Both work, but consistency is better

⚠️ **Key Rotation:**
- Old keys can be rotated independently
- New keys can be rotated independently
- Plan rotation during low-traffic periods

---

## Current Status

- ✅ **Old keys working:** Yes
- ✅ **New keys available:** Yes
- ✅ **Migration required:** No (optional)
- ✅ **Breaking changes:** No

---

## Next Steps

1. **Immediate:** No action needed - keep using old keys
2. **Short-term:** Monitor Supabase announcements about key deprecation
3. **Long-term:** Plan migration during next maintenance window

---

**Last Updated:** 2025-11-07  
**Status:** ✅ Production working with old keys, new keys available for future migration

