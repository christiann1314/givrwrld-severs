# Audit Issue: Purchase Completed But No Server Created

## Problem
- ✅ Payment completed successfully (user saw success page)
- ❌ No server created in Pterodactyl
- ❌ Dashboard shows "No Servers Yet"
- ⚠️  Note: `givrwrld-paper-1` in Pterodactyl is just a test server, not from this purchase

## What to Check

### 1. Order Creation
- Was an order created in the `orders` table?
- Check `order_sessions` table for checkout session
- Verify order has correct `user_id`, `plan_id`, `status`

### 2. Webhook Processing
- Was Stripe webhook received?
- Check `stripe_events_log` table for `checkout.session.completed` event
- Verify webhook processed the payment correctly

### 3. Provisioning Trigger
- Did webhook call `provisionServer()` function?
- Check API logs for provisioning attempts
- Check for any errors in provisioning process

### 4. Database Schema
- Verify `orders` table has correct columns
- Check for `pterodactyl_server_id` and `pterodactyl_server_identifier` columns
- Verify `status` column values

## Debugging Queries

### Check Recent Orders
```sql
SELECT id, user_id, plan_id, status, server_name, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Stripe Events
```sql
SELECT event_id, type, received_at 
FROM stripe_events_log 
ORDER BY received_at DESC 
LIMIT 10;
```

### Check Order Sessions
```sql
SELECT order_id, stripe_session_id, status, created_at 
FROM order_sessions 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Orders Table Schema
```sql
DESCRIBE orders;
```

## Expected Flow

1. User completes checkout → Order created (`status = 'pending'`)
2. Payment completed → Webhook received
3. Webhook updates order (`status = 'paid'`)
4. Webhook calls `provisionServer(orderId)`
5. Server created in Pterodactyl
6. Order updated (`status = 'provisioned'`, `pterodactyl_server_id` set)
7. Frontend fetches servers → Shows in dashboard

## Files to Audit

### 1. Webhook Handler
- `api/routes/stripe.js` - Webhook processing
- Verify it calls `provisionServer()` after payment
- Check error handling

### 2. Provisioning Function
- `api/routes/servers.js` - `provisionServer()` function
- Verify it creates server in Pterodactyl
- Check error handling and logging

### 3. Database Schema
- `sql/app_core.sql` - Orders table definition
- Verify all required columns exist

### 4. API Logs
- Check API server logs for errors
- Look for provisioning attempts
- Check for Pterodactyl API errors

## Likely Issues

1. **Webhook not received**: Stripe webhook endpoint not configured correctly
2. **Webhook not processing**: Webhook received but failed to process
3. **Provisioning not triggered**: Webhook didn't call `provisionServer()`
4. **Provisioning failed**: Server creation failed silently
5. **Order not linked**: Order created but not linked to user correctly

## Next Steps

1. Check if order was created
2. Check if webhook was received
3. Check if provisioning was triggered
4. Check API logs for errors
5. Verify database schema matches code expectations
