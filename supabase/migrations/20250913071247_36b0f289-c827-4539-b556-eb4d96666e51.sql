-- Insert sample bundles with Stripe price IDs
INSERT INTO public.bundles (name, slug, description, price_monthly, features, pterodactyl_env, pterodactyl_limits_patch, stripe_price_id_monthly) VALUES
('GIVRwrld Essentials', 'essentials', 'Daily backups, Discord bridge, analytics', 6.99, 
 '["Daily automatic backups (7-day retention)", "Discord bridge integration (status + start/stop alerts)", "Analytics dashboard (basic player/CPU/RAM metrics)"]'::jsonb,
 '{"BACKUPS_ENABLED": "1", "BACKUPS_RETENTION_DAYS": "7", "DISCORD_BRIDGE": "1", "ANALYTICS_ENABLED": "1"}'::jsonb,
 '{"backups": 10}'::jsonb,
 'price_1QGcN5BorjAQs4fhmQfZSKZH'),
('Game Expansion Pack', 'expansion', 'Cross-deploy capabilities and management', 14.99,
 '["Cross-deploy to supported game types (Minecraft/Rust/Palworld)", "Shared resource allocation (keeps plan limits when switching games)", "Cross-game player management tools"]'::jsonb,
 '{"CROSS_DEPLOY_ENABLED": "1", "PRESERVE_LIMITS_ON_GAME_SWITCH": "1"}'::jsonb,
 '{"databases": 5, "allocations": 3}'::jsonb,
 'price_1QGcN5BorjAQs4fhZcLGciAm'),
('Community Pack', 'community', 'Priority support and creator benefits', 4.99,
 '["Priority support queue", "Creator spotlight eligibility & dev blog access", "Private Discord channels/roles"]'::jsonb,
 '{}'::jsonb,
 '{}'::jsonb,
 'price_1QGcN5BorjAQs4fhqgu1OpXK');

-- Insert sample addons  
INSERT INTO public.addons (name, slug, description, price_monthly, category, pterodactyl_env, pterodactyl_limits_patch) VALUES
('Automatic Backups', 'backups', 'Daily backups with 7-day retention', 2.99, 'backup',
 '{"BACKUPS_ENABLED": "1", "BACKUP_RETENTION": "7"}'::jsonb,
 '{}'::jsonb),
('Discord Integration', 'discord', 'Sync server status with Discord', 1.49, 'integration', 
 '{"DISCORD_INTEGRATION": "1"}'::jsonb,
 '{}'::jsonb),
('Advanced Analytics', 'analytics', 'Real-time player and performance stats', 3.99, 'monitoring',
 '{"ANALYTICS_ENABLED": "1", "METRICS_COLLECTION": "1"}'::jsonb,
 '{}'::jsonb),
('Additional SSD Storage (+50GB)', 'storage-50gb', 'Expand your storage capacity', 2.50, 'storage',
 '{}'::jsonb,
 '{"disk": 51200}'::jsonb);

-- Insert sample modpacks
INSERT INTO public.modpacks (name, slug, description, price_monthly, pterodactyl_env, game_id) VALUES
('Popular Mods', 'popular-mods', 'Curated collection of popular mods', 3.99,
 '{"MODPACK_TYPE": "popular", "AUTO_UPDATE": "1"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'minecraft' LIMIT 1)),
('Workshop IDs', 'workshop-ids', 'Steam Workshop integration', 2.99,
 '{"WORKSHOP_ENABLED": "1"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'rust' LIMIT 1)),
('uMod/Oxide + Plugins', 'umod-oxide', 'Complete uMod/Oxide setup with plugins', 4.99,
 '{"UMOD_ENABLED": "1", "OXIDE_ENABLED": "1"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'rust' LIMIT 1)),
('RLCraft', 'rlcraft', 'Complete RLCraft modpack', 4.99,
 '{"MODPACK_TYPE": "rlcraft", "MEMORY_RECOMMENDED": "4096"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'minecraft' LIMIT 1)),
('All the Mods', 'all-the-mods', 'Comprehensive modpack with hundreds of mods', 3.99,
 '{"MODPACK_TYPE": "atm", "MEMORY_RECOMMENDED": "6144"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'minecraft' LIMIT 1)),
('SkyFactory', 'skyfactory', 'Popular skyblock survival modpack', 3.99,
 '{"MODPACK_TYPE": "skyfactory", "WORLD_TYPE": "skyblock"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'minecraft' LIMIT 1)),
('Custom', 'custom', 'Custom modpack configuration', 2.99,
 '{"MODPACK_TYPE": "custom"}'::jsonb,
 (SELECT id FROM games WHERE slug = 'minecraft' LIMIT 1));