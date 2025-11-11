# Audit Issue: Server Not Showing in Dashboard

## Problem
- ✅ Server exists in Pterodactyl: `givrwrld-paper-1`
- ❌ Dashboard shows "No Servers Yet"
- ❌ User dashboard shows "0 Online Servers"

## What We Know

### Server Exists
- Pterodactyl panel shows server: `givrwrld-paper-1`
- UUID: `8d110130-56b5-4f3b-aac2-6c4b5c49b97e`
- Owner: `admin`
- Status: Active

### Database Issues Found
1. **Column Name Mismatch**: 
   - Code references `pterodactyl_server_id` and `pterodactyl_server_identifier`
   - But queries fail with: `ERROR 1054 (42S22): Unknown column 'pterodactyl_server_id'`
   - Need to check actual column names in `orders` table

2. **User Lookup**:
   - User email: `christianjn14@icloud.com`
   - Need to verify user exists in `users` table
   - Need to verify order is linked to correct user_id

## Files to Audit

### 1. Database Schema
- `sql/app_core.sql` - Check `orders` table schema
- Verify column names: `pterodactyl_server_id`, `pterodactyl_server_identifier`

### 2. API Route
- `api/routes/servers.js` - GET `/api/servers` endpoint
- `api/utils/mysql.js` - `getUserServers()` function

### 3. Frontend
- `src/hooks/useUserServers.ts` - How servers are fetched
- `src/lib/api.ts` - API client `getServers()` method

## Expected Flow

1. User completes payment
2. Webhook creates order with `status = 'paid'`
3. Webhook triggers provisioning
4. Server created in Pterodactyl
5. Order updated with `pterodactyl_server_id` and `pterodactyl_server_identifier`
6. Frontend calls `GET /api/servers`
7. API returns orders with `status = 'provisioned'`
8. Frontend displays servers

## Debugging Steps

### Step 1: Check Orders Table Schema
```sql
DESCRIBE orders;
```

### Step 2: Find the Order
```sql
SELECT * FROM orders 
WHERE server_name LIKE '%paper%' 
   OR server_name LIKE '%givrwrld%'
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 3: Check User
```sql
SELECT * FROM users 
WHERE email LIKE '%christianjn14%' 
   OR email LIKE '%icloud%';
```

### Step 4: Check API Response
```bash
# Need valid JWT token
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/servers
```

### Step 5: Check getUserServers Function
- Verify it queries `orders` table correctly
- Verify it filters by `user_id`
- Verify it returns correct format

## Likely Issues

1. **Column Names**: `orders` table might use different column names
2. **User ID Mismatch**: Order might be linked to wrong user
3. **Status Filter**: API might be filtering out provisioned servers
4. **Response Format**: API response might not match frontend expectations

## Next Steps

1. ✅ All code pushed to repo
2. ⏳ Codex audit needed to:
   - Check `orders` table schema
   - Verify `getUserServers()` function
   - Check API response format
   - Verify frontend expectations
   - Fix any mismatches

