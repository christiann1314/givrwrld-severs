-- =====================================================
-- CLEANUP MIGRATION: Remove Modpack Support
-- =====================================================
-- This migration removes all modpack functionality since
-- modpacks are not offered as a service.

-- Step 1: Remove foreign key constraint from orders.modpack_id
ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS orders_modpack_id_fkey;

-- Step 2: Set all modpack_id values to NULL in existing orders
UPDATE public.orders 
  SET modpack_id = NULL 
  WHERE modpack_id IS NOT NULL;

-- Step 3: Drop the modpacks table (cascade will handle any remaining references)
DROP TABLE IF EXISTS public.modpacks CASCADE;

-- Step 4: Remove modpack_id column from orders table
ALTER TABLE public.orders 
  DROP COLUMN IF EXISTS modpack_id;

-- Step 5: Remove modpack_id from user_servers if it exists
ALTER TABLE public.user_servers 
  DROP CONSTRAINT IF EXISTS user_servers_modpack_id_fkey;

ALTER TABLE public.user_servers 
  DROP COLUMN IF EXISTS modpack_id;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify cleanup:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'modpack_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_servers' AND column_name = 'modpack_id';
-- SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modpacks');

