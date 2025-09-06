-- Create games catalog table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  banner_url TEXT,
  docker_image TEXT NOT NULL,
  egg_id INTEGER,
  startup_command TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create plans catalog table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_quarterly TEXT,
  stripe_price_id_biannual TEXT,
  stripe_price_id_annual TEXT,
  cpu_cores INTEGER NOT NULL,
  ram_gb INTEGER NOT NULL,
  disk_gb INTEGER NOT NULL,
  bandwidth_tb DECIMAL(5,2),
  max_players INTEGER,
  pterodactyl_limits JSONB DEFAULT '{}',
  pterodactyl_env JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bundles catalog table
CREATE TABLE public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_quarterly TEXT,
  stripe_price_id_biannual TEXT,
  stripe_price_id_annual TEXT,
  features JSONB DEFAULT '[]',
  pterodactyl_env JSONB DEFAULT '{}',
  pterodactyl_limits_patch JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create modpacks catalog table
CREATE TABLE public.modpacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  stripe_price_id_monthly TEXT,
  download_url TEXT,
  modpack_id TEXT,
  version TEXT,
  pterodactyl_env JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create addons catalog table
CREATE TABLE public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT,
  category TEXT, -- 'backup', 'integration', 'performance', etc.
  pterodactyl_env JSONB DEFAULT '{}',
  pterodactyl_limits_patch JSONB DEFAULT '{}',
  post_install_script TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update user_servers table to include new fields
ALTER TABLE public.user_servers 
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS pterodactyl_server_id TEXT,
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.bundles(id),
ADD COLUMN IF NOT EXISTS modpack_id UUID REFERENCES public.modpacks(id),
ADD COLUMN IF NOT EXISTS addon_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_term TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS env_vars JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS server_limits JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS order_payload JSONB DEFAULT '{}';

-- Create orders table for detailed order tracking
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  server_id UUID REFERENCES public.user_servers(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
  order_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modpacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for catalog tables (public read access)
CREATE POLICY "games_public_read" ON public.games FOR SELECT USING (true);
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (true);
CREATE POLICY "bundles_public_read" ON public.bundles FOR SELECT USING (true);
CREATE POLICY "modpacks_public_read" ON public.modpacks FOR SELECT USING (true);
CREATE POLICY "addons_public_read" ON public.addons FOR SELECT USING (true);

-- Create policies for orders table
CREATE POLICY "orders_user_read" ON public.orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_plans_game_id ON public.plans(game_id);
CREATE INDEX idx_modpacks_game_id ON public.modpacks(game_id);
CREATE INDEX idx_user_servers_user_id ON public.user_servers(user_id);
CREATE INDEX idx_user_servers_stripe_session ON public.user_servers(stripe_session_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);

-- Insert sample data
INSERT INTO public.games (name, slug, description, icon_url, docker_image, startup_command) VALUES
('Minecraft', 'minecraft', 'Build, explore, and survive in infinite worlds', '/src/assets/minecraft-icon.png', 'itzg/minecraft-server', 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}'),
('Rust', 'rust', 'Survival game in a post-apocalyptic world', '/src/assets/rust-icon.png', 'didstopia/rust-server', './RustDedicated -batchmode +server.port {{SERVER_PORT}} +server.identity "rust"'),
('Palworld', 'palworld', 'Monster collection and survival adventure', '/src/assets/palworld-icon.png', 'thijsvanloef/palworld-server-docker', './PalServer.sh -port={{SERVER_PORT}} -publicport={{SERVER_PORT}}');

-- Insert sample plans (using the game IDs from above)
INSERT INTO public.plans (game_id, name, slug, description, price_monthly, cpu_cores, ram_gb, disk_gb, max_players, pterodactyl_limits, pterodactyl_env)
SELECT 
  g.id,
  p.name,
  p.slug,
  p.description,
  p.price_monthly,
  p.cpu_cores,
  p.ram_gb,
  p.disk_gb,
  p.max_players,
  p.pterodactyl_limits::jsonb,
  p.pterodactyl_env::jsonb
FROM public.games g
CROSS JOIN (VALUES
  ('Starter', 'starter', 'Perfect for small groups', 9.99, 2, 4, 20, 10, '{"memory": 4096, "cpu": 200, "disk": 20480}', '{"SERVER_MEMORY": "4G", "MAX_PLAYERS": "10"}'),
  ('Standard', 'standard', 'Great for medium communities', 19.99, 4, 8, 50, 20, '{"memory": 8192, "cpu": 400, "disk": 51200}', '{"SERVER_MEMORY": "8G", "MAX_PLAYERS": "20"}'),
  ('Premium', 'premium', 'High performance for large servers', 39.99, 8, 16, 100, 50, '{"memory": 16384, "cpu": 800, "disk": 102400}', '{"SERVER_MEMORY": "16G", "MAX_PLAYERS": "50"}')
) AS p(name, slug, description, price_monthly, cpu_cores, ram_gb, disk_gb, max_players, pterodactyl_limits, pterodactyl_env);

-- Insert sample bundles
INSERT INTO public.bundles (name, slug, description, price_monthly, features, pterodactyl_env, pterodactyl_limits_patch) VALUES
('GIVRwrld Essentials', 'essentials', 'Daily backups, Discord integration, and analytics', 6.99, 
 '["Daily automatic backups (7-day retention)", "Discord bridge integration", "Analytics dashboard"]'::jsonb,
 '{"BACKUPS_ENABLED": "1", "BACKUPS_RETENTION_DAYS": "7", "DISCORD_BRIDGE": "1", "ANALYTICS_ENABLED": "1"}'::jsonb,
 '{"feature_limits": {"backups": 7}}'::jsonb),
('Game Expansion Pack', 'expansion', 'Cross-deploy between games with shared resources', 14.99,
 '["Cross-deploy to supported game types", "Shared resource allocation", "Cross-game player management tools"]'::jsonb,
 '{"CROSS_DEPLOY_ENABLED": "1", "PRESERVE_LIMITS_ON_GAME_SWITCH": "1"}'::jsonb,
 '{}'::jsonb),
('Community Pack', 'community', 'Priority support and community features', 4.99,
 '["Priority support queue", "Creator spotlight eligibility", "Private Discord channels/roles"]'::jsonb,
 '{}'::jsonb,
 '{}'::jsonb);

-- Insert sample modpacks for Minecraft
INSERT INTO public.modpacks (game_id, name, slug, description, price_monthly, download_url, modpack_id, pterodactyl_env)
SELECT 
  g.id,
  m.name,
  m.slug,
  m.description,
  m.price_monthly,
  m.download_url,
  m.modpack_id,
  m.pterodactyl_env::jsonb
FROM public.games g
CROSS JOIN (VALUES
  ('Vanilla', 'vanilla', 'Pure Minecraft experience', 0, null, null, '{}'),
  ('RLCraft', 'rlcraft', 'Hardcore survival modpack', 2.99, 'https://www.curseforge.com/minecraft/modpacks/rlcraft', 'rlcraft', '{"MODPACK_URL": "https://www.curseforge.com/minecraft/modpacks/rlcraft", "AUTO_INSTALL_MODPACK": "1"}'),
  ('All The Mods 9', 'atm9', 'Kitchen sink modpack with 400+ mods', 3.99, 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-9', 'atm9', '{"MODPACK_URL": "https://www.curseforge.com/minecraft/modpacks/all-the-mods-9", "AUTO_INSTALL_MODPACK": "1"}')
) AS m(name, slug, description, price_monthly, download_url, modpack_id, pterodactyl_env)
WHERE g.slug = 'minecraft';

-- Insert sample addons
INSERT INTO public.addons (name, slug, description, price_monthly, category, pterodactyl_env, post_install_script) VALUES
('Daily Backups', 'daily_backups', 'Automated daily backups with 30-day retention', 3.99, 'backup', 
 '{"BACKUP_ENABLED": "1", "BACKUP_FREQUENCY": "daily", "BACKUP_RETENTION": "30"}'::jsonb,
 'echo "Setting up backup cron job..."; (crontab -l 2>/dev/null; echo "0 2 * * * /backup.sh") | crontab -'),
('Discord Integration', 'discord_integration', 'Real-time Discord notifications and commands', 2.99, 'integration',
 '{"DISCORD_WEBHOOK": "", "DISCORD_BOT_TOKEN": ""}'::jsonb,
 'echo "Installing Discord bot..."; npm install discord.js'),
('Performance Monitoring', 'performance_monitoring', 'Real-time server performance metrics', 1.99, 'performance',
 '{"MONITORING_ENABLED": "1", "METRICS_INTERVAL": "60"}'::jsonb,
 'echo "Installing monitoring agent..."; curl -O https://monitoring.example.com/agent.sh && bash agent.sh');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_modpacks_updated_at BEFORE UPDATE ON public.modpacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();