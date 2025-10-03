// Pterodactyl API service for fetching real server data
import { config } from '@/config/environment';

interface PterodactylServerStats {
  state: string;
  cpu_percent: number;
  memory_bytes: number;
  disk_bytes: number;
  uptime_ms: number;
  server_identifier: string;
}

interface PterodactylServer {
  id: string;
  name: string;
  game: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  players: number;
  maxPlayers: number;
  uptime: string;
  pterodactylUrl: string;
  specs: string;
  lastSeen: string;
}

export class PterodactylService {
  private static instance: PterodactylService;
  private panelUrl: string;
  private clientKey: string;

  constructor() {
    this.panelUrl = config.pterodactyl.panelUrl || 'https://panel.givrwrldservers.com';
    this.clientKey = config.pterodactyl.clientKey || '';
  }

  static getInstance(): PterodactylService {
    if (!PterodactylService.instance) {
      PterodactylService.instance = new PterodactylService();
    }
    return PterodactylService.instance;
  }

  async getServerStats(serverIdentifier: string): Promise<PterodactylServerStats | null> {
    try {
      const response = await fetch(`${this.panelUrl}/api/client/servers/${serverIdentifier}/resources`, {
        headers: {
          'Authorization': `Bearer ${this.clientKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch server stats for ${serverIdentifier}:`, response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      return {
        state: data.attributes?.current_state || data.attributes?.state || 'unknown',
        cpu_percent: data.attributes?.resources?.cpu_absolute || 0,
        memory_bytes: data.attributes?.resources?.memory_bytes || 0,
        disk_bytes: data.attributes?.resources?.disk_bytes || 0,
        uptime_ms: data.attributes?.resources?.uptime || 0,
        server_identifier: serverIdentifier
      };
    } catch (error) {
      console.error(`Error fetching server stats for ${serverIdentifier}:`, error);
      return null;
    }
  }

  async getServerList(): Promise<PterodactylServer[]> {
    try {
      const response = await fetch(`${this.panelUrl}/api/client`, {
        headers: {
          'Authorization': `Bearer ${this.clientKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch server list:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      
      return data.data.map((server: any) => ({
        id: server.attributes.identifier,
        name: server.attributes.name,
        game: server.attributes.description || 'Unknown',
        status: server.attributes.status === 'running' ? 'online' : 'offline',
        players: 0, // Will be updated by stats
        maxPlayers: 20, // Default
        uptime: '99.9%', // Will be updated by stats
        pterodactylUrl: `${this.panelUrl}/server/${server.attributes.identifier}`,
        specs: `${server.attributes.limits?.memory || 0}MB RAM`,
        lastSeen: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching server list:', error);
      return [];
    }
  }

  async getEnhancedServerData(orders: any[]): Promise<PterodactylServer[]> {
    const enhancedServers: PterodactylServer[] = [];

    for (const order of orders) {
      if (!order.pterodactyl_server_identifier) {
        // If no Pterodactyl server ID, create basic server data
        const planId = order.plan_id || '';
        let game = 'unknown';
        let ram = '4GB';
        
        if (planId.startsWith('mc-')) {
          game = 'minecraft';
          ram = planId.includes('4gb') ? '4GB' : planId.includes('8gb') ? '8GB' : planId.includes('16gb') ? '16GB' : '4GB';
        } else if (planId.startsWith('rust-')) {
          game = 'rust';
          ram = planId.includes('6gb') ? '6GB' : planId.includes('12gb') ? '12GB' : '6GB';
        } else if (planId.startsWith('palworld-')) {
          game = 'palworld';
          ram = planId.includes('8gb') ? '8GB' : planId.includes('16gb') ? '16GB' : '8GB';
        } else {
          // Fallback for old format
          game = planId.split('-')[0] || 'unknown';
          ram = planId.includes('1gb') ? '1GB' : 
                planId.includes('2gb') ? '2GB' :
                planId.includes('4gb') ? '4GB' :
                planId.includes('8gb') ? '8GB' :
                planId.includes('12gb') ? '12GB' :
                planId.includes('16gb') ? '16GB' : '4GB';
        }
        
        enhancedServers.push({
          id: order.id,
          name: order.server_name,
          game: game,
          status: order.status === 'active' ? 'online' : 
                 order.status === 'provisioned' ? 'starting' : 'offline',
          players: 0,
          maxPlayers: 20,
          uptime: '99.9%',
          pterodactylUrl: `https://panel.givrwrldservers.com/server/${order.id}`,
          specs: `${ram} RAM • 2 CPU Cores`,
          lastSeen: order.updated_at || new Date().toISOString()
        });
        continue;
      }

      // Fetch real stats from Pterodactyl
      const stats = await this.getServerStats(order.pterodactyl_server_identifier);
      
      // Handle both old format (minecraft-4gb) and new format (mc-4gb)
      const planId = order.plan_id || '';
      let game = 'unknown';
      let ram = '4GB';
      
      if (planId.startsWith('mc-')) {
        game = 'minecraft';
        ram = planId.includes('4gb') ? '4GB' : planId.includes('8gb') ? '8GB' : planId.includes('16gb') ? '16GB' : '4GB';
      } else if (planId.startsWith('rust-')) {
        game = 'rust';
        ram = planId.includes('6gb') ? '6GB' : planId.includes('12gb') ? '12GB' : '6GB';
      } else if (planId.startsWith('palworld-')) {
        game = 'palworld';
        ram = planId.includes('8gb') ? '8GB' : planId.includes('16gb') ? '16GB' : '8GB';
      } else {
        // Fallback for old format
        game = planId.split('-')[0] || 'unknown';
        ram = planId.includes('1gb') ? '1GB' : 
              planId.includes('2gb') ? '2GB' :
              planId.includes('4gb') ? '4GB' :
              planId.includes('8gb') ? '8GB' :
              planId.includes('12gb') ? '12GB' :
              planId.includes('16gb') ? '16GB' : '4GB';
      }

      const status = stats ? 
        (stats.state === 'running' ? 'online' : 
         stats.state === 'starting' ? 'starting' : 
         stats.state === 'stopping' ? 'stopping' : 'offline') :
        (order.status === 'active' ? 'online' : 
         order.status === 'provisioned' ? 'starting' : 'offline');

      const uptime = stats ? 
        `${((stats.uptime_ms / (1000 * 60 * 60 * 24)) * 100).toFixed(1)}%` : 
        '99.9%';

      enhancedServers.push({
        id: order.id,
        name: order.server_name,
        game: game,
        status: status as 'online' | 'offline' | 'starting' | 'stopping',
        players: 0, // Pterodactyl doesn't provide player count in resources endpoint
        maxPlayers: 20, // Default
        uptime: uptime,
        pterodactylUrl: `${this.panelUrl}/server/${order.pterodactyl_server_identifier}`,
        specs: `${ram} RAM • 2 CPU Cores`,
        lastSeen: new Date().toISOString()
      });
    }

    return enhancedServers;
  }
}

export const pterodactylService = PterodactylService.getInstance();
