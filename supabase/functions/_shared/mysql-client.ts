// MySQL Client for Supabase Edge Functions
// Connects to MySQL database on VPS

import mysql from 'npm:mysql2@^3.6.0/promise';

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

let connectionPool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool {
  if (connectionPool) {
    return connectionPool;
  }

  const config: MySQLConfig = {
    host: Deno.env.get('MYSQL_HOST') || '127.0.0.1',
    port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
    user: Deno.env.get('MYSQL_USER') || 'app_rw',
    password: Deno.env.get('MYSQL_PASSWORD') || '',
    database: Deno.env.get('MYSQL_DATABASE') || 'app_core',
  };

  connectionPool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return connectionPool;
}

export async function decryptSecret(
  scope: string,
  keyName: string,
  aesKey: string
): Promise<string | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.execute(
    `SELECT CAST(AES_DECRYPT(value_enc, ?) AS CHAR) AS value
     FROM secrets
     WHERE scope = ? AND key_name = ?`,
    [aesKey, scope, keyName]
  ) as any[];

  if (rows && rows.length > 0) {
    return rows[0].value;
  }
  return null;
}

export async function getPlan(planId: string) {
  const pool = getMySQLPool();
  const [rows] = await pool.execute(
    `SELECT id, item_type, game, ram_gb, vcores, ssd_gb, price_monthly,
            ptero_egg_id, stripe_product_id, stripe_price_id, display_name
     FROM plans
     WHERE id = ? AND is_active = 1`,
    [planId]
  ) as any[];

  return rows && rows.length > 0 ? rows[0] : null;
}

export async function createOrder(orderData: {
  id: string;
  user_id: string;
  item_type: 'game' | 'vps';
  plan_id: string;
  term: 'monthly' | 'quarterly' | 'yearly';
  region: string;
  server_name: string;
  status: 'pending' | 'paid' | 'provisioning' | 'provisioned' | 'error' | 'canceled';
  stripe_sub_id?: string;
  stripe_customer_id?: string;
}) {
  const pool = getMySQLPool();
  await pool.execute(
    `INSERT INTO orders (id, user_id, item_type, plan_id, term, region, server_name, status, stripe_sub_id, stripe_customer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderData.id,
      orderData.user_id,
      orderData.item_type,
      orderData.plan_id,
      orderData.term,
      orderData.region,
      orderData.server_name,
      orderData.status,
      orderData.stripe_sub_id || null,
      orderData.stripe_customer_id || null,
    ]
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  pteroServerId?: number,
  pteroIdentifier?: string,
  errorMessage?: string
) {
  const pool = getMySQLPool();
  await pool.execute(
    `UPDATE orders
     SET status = ?,
         ptero_server_id = ?,
         ptero_identifier = ?,
         error_message = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      status,
      pteroServerId || null,
      pteroIdentifier || null,
      errorMessage || null,
      orderId,
    ]
  );
}

export async function getNodeForRegion(regionCode: string) {
  const pool = getMySQLPool();
  const [rows] = await pool.execute(
    `SELECT n.ptero_node_id, n.name, n.max_ram_gb, n.max_disk_gb
     FROM region_node_map rnm
     JOIN ptero_nodes n ON n.ptero_node_id = rnm.ptero_node_id
     WHERE rnm.region_code = ?
     ORDER BY rnm.weight DESC
     LIMIT 1`,
    [regionCode]
  ) as any[];

  return rows && rows.length > 0 ? rows[0] : null;
}



