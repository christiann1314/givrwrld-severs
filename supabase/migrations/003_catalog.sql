-- Plans table for game servers and VPS
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('game', 'vps')),
  game TEXT NULL, -- minecraft, rust, palworld (null for VPS)
  ram_gb INTEGER NOT NULL,
  vcores INTEGER NOT NULL,
  ssd_gb INTEGER NOT NULL,
  stripe_price_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Addons table for additional services
CREATE TABLE IF NOT EXISTS public.addons (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('game', 'vps')),
  display_name TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modpacks table for game server configurations
CREATE TABLE IF NOT EXISTS public.modpacks (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pterodactyl nodes for capacity management
CREATE TABLE IF NOT EXISTS public.ptero_nodes (
  id SERIAL PRIMARY KEY,
  pterodactyl_node_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  max_ram_gb INTEGER NOT NULL,
  max_disk_gb INTEGER NOT NULL,
  reserved_headroom_gb INTEGER DEFAULT 2,
  enabled BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table (updated schema)
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('game', 'vps')),
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  term TEXT NOT NULL CHECK (term IN ('monthly', 'quarterly', 'yearly')),
  region TEXT NOT NULL,
  server_name TEXT NOT NULL,
  modpack_id TEXT NULL REFERENCES public.modpacks(id),
  addons JSONB DEFAULT '[]'::jsonb,
  stripe_sub_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'provisioning', 'provisioned', 'error', 'canceled')),
  node_id INTEGER REFERENCES public.ptero_nodes(id),
  pterodactyl_server_id INTEGER,
  pterodactyl_server_identifier TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- External accounts for Pterodactyl integration
CREATE TABLE IF NOT EXISTS public.external_accounts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pterodactyl_user_id INTEGER,
  panel_username TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliates table for referral system
CREATE TABLE IF NOT EXISTS public.affiliates (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  credits_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modpacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptero_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders (users can only see their own)
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for external accounts
CREATE POLICY "Users can view own external accounts" ON public.external_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own external accounts" ON public.external_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own external accounts" ON public.external_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for affiliates
CREATE POLICY "Users can view own affiliate data" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate data" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate data" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for catalog tables
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active addons" ON public.addons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active modpacks" ON public.modpacks
  FOR SELECT USING (is_active = true);

-- Service role access for ptero_nodes
CREATE POLICY "Service role can manage ptero_nodes" ON public.ptero_nodes
  FOR ALL TO service_role;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON public.orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_sub_id ON public.orders(stripe_sub_id);
CREATE INDEX IF NOT EXISTS idx_ptero_nodes_region ON public.ptero_nodes(region);
CREATE INDEX IF NOT EXISTS idx_ptero_nodes_enabled ON public.ptero_nodes(enabled);
CREATE INDEX IF NOT EXISTS idx_plans_game ON public.plans(game);
CREATE INDEX IF NOT EXISTS idx_plans_item_type ON public.plans(item_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(code);

-- Trigger for updated_at on orders
CREATE TRIGGER handle_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data for plans (replace with your actual Stripe price IDs)
INSERT INTO public.plans (id, item_type, game, ram_gb, vcores, ssd_gb, stripe_price_id, display_name) VALUES
  -- Minecraft Plans
  ('mc-1gb', 'game', 'minecraft', 1, 1, 10, 'price_minecraft_1gb_monthly', 'Minecraft 1GB'),
  ('mc-2gb', 'game', 'minecraft', 2, 1, 20, 'price_minecraft_2gb_monthly', 'Minecraft 2GB'),
  ('mc-4gb', 'game', 'minecraft', 4, 2, 40, 'price_minecraft_4gb_monthly', 'Minecraft 4GB'),
  ('mc-8gb', 'game', 'minecraft', 8, 4, 80, 'price_minecraft_8gb_monthly', 'Minecraft 8GB'),
  -- Rust Plans
  ('rust-3gb', 'game', 'rust', 3, 2, 20, 'price_rust_3gb_monthly', 'Rust 3GB'),
  ('rust-6gb', 'game', 'rust', 6, 3, 40, 'price_rust_6gb_monthly', 'Rust 6GB'),
  ('rust-8gb', 'game', 'rust', 8, 4, 60, 'price_rust_8gb_monthly', 'Rust 8GB'),
  ('rust-12gb', 'game', 'rust', 12, 6, 80, 'price_rust_12gb_monthly', 'Rust 12GB'),
  -- Palworld Plans
  ('palworld-4gb', 'game', 'palworld', 4, 2, 25, 'price_palworld_4gb_monthly', 'Palworld 4GB'),
  ('palworld-8gb', 'game', 'palworld', 8, 4, 50, 'price_palworld_8gb_monthly', 'Palworld 8GB'),
  ('palworld-16gb', 'game', 'palworld', 16, 8, 100, 'price_palworld_16gb_monthly', 'Palworld 16GB'),
  -- VPS Plans
  ('vps-basic', 'vps', null, 4, 2, 40, 'price_vps_basic_monthly', 'Basic VPS'),
  ('vps-standard', 'vps', null, 8, 4, 80, 'price_vps_standard_monthly', 'Standard VPS'),
  ('vps-premium', 'vps', null, 16, 8, 160, 'price_vps_premium_monthly', 'Premium VPS')
ON CONFLICT (id) DO NOTHING;

-- Seed data for addons
INSERT INTO public.addons (id, item_type, display_name, stripe_price_id) VALUES
  ('backup-daily', 'game', 'Daily Backups', 'price_backup_daily'),
  ('backup-hourly', 'game', 'Hourly Backups', 'price_backup_hourly'),
  ('ddos-protection', 'game', 'DDoS Protection', 'price_ddos_protection'),
  ('priority-support', 'game', 'Priority Support', 'price_priority_support'),
  ('vps-backup', 'vps', 'VPS Backups', 'price_vps_backup'),
  ('vps-monitoring', 'vps', 'Advanced Monitoring', 'price_vps_monitoring')
ON CONFLICT (id) DO NOTHING;

-- Seed data for modpacks
INSERT INTO public.modpacks (id, game, display_name, slug) VALUES
  ('vanilla', 'minecraft', 'Vanilla Minecraft', 'vanilla'),
  ('forge-latest', 'minecraft', 'Forge (Latest)', 'forge-latest'),
  ('fabric-latest', 'minecraft', 'Fabric (Latest)', 'fabric-latest'),
  ('ftb-academy', 'minecraft', 'FTB Academy', 'ftb-academy'),
  ('all-mods-7', 'minecraft', 'All The Mods 7', 'all-mods-7'),
  ('rust-vanilla', 'rust', 'Vanilla Rust', 'rust-vanilla'),
  ('rust-modded', 'rust', 'Modded Rust', 'rust-modded'),
  ('palworld-vanilla', 'palworld', 'Vanilla Palworld', 'palworld-vanilla')
ON CONFLICT (id) DO NOTHING;

-- Seed data for pterodactyl nodes (update with your actual node IDs)
INSERT INTO public.ptero_nodes (pterodactyl_node_id, name, region, max_ram_gb, max_disk_gb) VALUES
  (1, 'US-East-1', 'east', 64, 1000),
  (2, 'US-West-1', 'west', 64, 1000),
  (3, 'EU-Central-1', 'eu', 64, 1000)
ON CONFLICT (pterodactyl_node_id) DO NOTHING;
