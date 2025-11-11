// Servers Route
import express from 'express';
import { 
  getUserServers, 
  updateOrderStatus, 
  getDecryptedSecret,
  getNodeForRegion,
  getOrCreatePterodactylUser,
  getAvailableAllocation
} from '../utils/mysql.js';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/servers
 * Get user's servers
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const servers = await getUserServers(req.userId);
    res.json({
      success: true,
      servers
    });
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({
      error: 'Failed to fetch servers',
      message: error.message
    });
  }
});

/**
 * Provision server function (can be called directly or via HTTP)
 */
export async function provisionServer(orderId) {
  try {
    if (!orderId) {
      throw new Error('order_id is required');
    }

    // Get order details
    const [orders] = await pool.execute(
      `SELECT o.*, p.game, p.ptero_egg_id, p.ram_gb, p.vcores, p.ssd_gb
       FROM orders o
       LEFT JOIN plans p ON p.id = o.plan_id
       WHERE o.id = ?`,
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = orders[0];

    if (order.status !== 'paid') {
      return res.status(400).json({
        error: 'Order is not in paid status'
      });
    }

    // Update status to provisioning
    await updateOrderStatus(order_id, 'provisioning');

    // Get Pterodactyl API credentials
    const aesKey = process.env.AES_KEY;
    if (!aesKey) {
      throw new Error('AES_KEY environment variable not set');
    }

    const panelUrl = await getDecryptedSecret('panel', 'PANEL_URL', aesKey);
    const panelAppKey = await getDecryptedSecret('panel', 'PANEL_APP_KEY', aesKey);

    if (!panelUrl || !panelAppKey) {
      throw new Error('Pterodactyl credentials not found');
    }

    // Validate plan has egg ID
    if (!order.ptero_egg_id) {
      await updateOrderStatus(order_id, 'error', null, null, 'Plan does not have ptero_egg_id configured');
      return res.status(400).json({
        error: 'Plan does not have ptero_egg_id configured'
      });
    }

    // Get node for region
    const node = await getNodeForRegion(order.region);
    if (!node) {
      await updateOrderStatus(order_id, 'error', null, null, `No node found for region: ${order.region}`);
      return res.status(400).json({
        error: `No node found for region: ${order.region}`
      });
    }

    // Get user details
    const [users] = await pool.execute(
      `SELECT id, email, display_name FROM users WHERE id = ?`,
      [order.user_id]
    );

    if (users.length === 0) {
      await updateOrderStatus(order_id, 'error', null, null, 'User not found');
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = users[0];

    // Get or create Pterodactyl user
    const pteroUserId = await getOrCreatePterodactylUser(
      user.id,
      user.email,
      user.display_name || user.email.split('@')[0],
      panelUrl,
      panelAppKey
    );

    // Get egg details from MySQL
    const [eggs] = await pool.execute(
      `SELECT ptero_egg_id, name, docker_image, startup_cmd
       FROM ptero_eggs
       WHERE ptero_egg_id = ?`,
      [order.ptero_egg_id]
    );

    if (eggs.length === 0) {
      await updateOrderStatus(order_id, 'error', null, null, `Egg not found: ${order.ptero_egg_id}`);
      return res.status(404).json({
        error: `Egg not found: ${order.ptero_egg_id}`
      });
    }

    const egg = eggs[0];

    // Get available allocation
    const allocation = await getAvailableAllocation(node.ptero_node_id, panelUrl, panelAppKey);

    // Build environment variables (game-specific)
    const environment = {
      SERVER_JARFILE: 'server.jar',
      TZ: 'UTC',
      EULA: 'TRUE',
      VERSION: 'latest',
    };

    // Create server in Pterodactyl
    try {
      const serverResponse = await fetch(`${panelUrl}/api/application/servers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${panelAppKey}`,
          'Content-Type': 'application/json',
          'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
        body: JSON.stringify({
          name: order.server_name,
          description: `GIVRwrld ${order.game} server for ${order.server_name}`,
          user: pteroUserId,
          egg: order.ptero_egg_id,
          docker_image: egg.docker_image || 'ghcr.io/pterodactyl/yolks:java_17',
          startup: egg.startup_cmd || 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
          environment: environment,
          limits: {
            memory: order.ram_gb * 1024,
            swap: 0,
            disk: order.ssd_gb * 1024,
            io: 500,
            cpu: order.vcores * 100,
          },
          feature_limits: {
            databases: 1,
            backups: 5,
            allocations: 1,
          },
          allocation: {
            default: allocation.attributes.id,
          },
          deploy: {
            locations: [node.ptero_node_id],
            dedicated_ip: false,
            port_range: [],
          },
          start_on_completion: true,
          skip_scripts: false,
        }),
      });

      if (!serverResponse.ok) {
        const errorText = await serverResponse.text();
        await updateOrderStatus(order_id, 'error', null, null, `Pterodactyl API error: ${errorText}`);
        return res.status(500).json({
          error: 'Failed to create server in Pterodactyl',
          message: errorText
        });
      }

      const serverData = await serverResponse.json();
      const pteroServerId = serverData.attributes?.id;
      const pteroIdentifier = serverData.attributes?.identifier;

      // Update order with server details
      await updateOrderStatus(
        order_id,
        'provisioned',
        pteroServerId,
        pteroIdentifier
      );

      console.log(`✅ Server provisioned: ${pteroIdentifier} (ID: ${pteroServerId}) for order ${orderId}`);

      return {
        success: true,
        order_id: orderId,
        server_id: pteroServerId,
        server_identifier: pteroIdentifier,
        message: 'Server provisioned successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateOrderStatus(orderId, 'error', null, null, errorMessage);
      console.error('Provisioning error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Provision error:', error);
    throw error;
  }
}

/**
 * POST /api/servers/provision
 * Provision a new server (called by webhook or manually)
 */
router.post('/provision', async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        error: 'order_id is required'
      });
    }

    const result = await provisionServer(order_id);
    res.json(result);
  } catch (error) {
    console.error('Provision API error:', error);
    res.status(500).json({
      error: 'Failed to provision server',
      message: error.message
    });
  }
});

export default router;


