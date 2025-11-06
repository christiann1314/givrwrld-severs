-- Check ptero_nodes table
SELECT 
  id,
  pterodactyl_node_id,
  region,
  total_ram_gb,
  reserved_ram_gb,
  enabled,
  created_at
FROM ptero_nodes
ORDER BY region, enabled DESC;

-- Check external_accounts table (sample)
SELECT 
  id,
  user_id,
  pterodactyl_user_id,
  panel_username,
  created_at
FROM external_accounts
ORDER BY created_at DESC
LIMIT 10;

-- Check if users have external accounts
SELECT 
  u.id as user_id,
  u.email,
  CASE WHEN ea.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_panel_account,
  ea.pterodactyl_user_id,
  ea.panel_username
FROM auth.users u
LEFT JOIN external_accounts ea ON ea.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 20;

-- Count nodes by region
SELECT 
  region,
  COUNT(*) as total_nodes,
  SUM(CASE WHEN enabled THEN 1 ELSE 0 END) as enabled_nodes,
  SUM(total_ram_gb) as total_ram_gb,
  SUM(reserved_ram_gb) as reserved_ram_gb,
  SUM(total_ram_gb - reserved_ram_gb) as available_ram_gb
FROM ptero_nodes
GROUP BY region;

