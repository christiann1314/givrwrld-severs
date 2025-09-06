import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  banner_url: string;
  docker_image: string;
  startup_command: string;
}

export interface Plan {
  id: string;
  game_id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  cpu_cores: number;
  ram_gb: number;
  disk_gb: number;
  max_players: number;
  pterodactyl_limits: any;
  pterodactyl_env: any;
  games: Game;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  features: string[];
  pterodactyl_env: any;
  pterodactyl_limits_patch: any;
}

export interface Modpack {
  id: string;
  game_id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  download_url?: string;
  modpack_id?: string;
  pterodactyl_env: any;
}

export interface Addon {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  category: string;
  pterodactyl_env: any;
  pterodactyl_limits_patch: any;
}

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Game[];
    }
  });
};

export const usePlans = (gameId?: string) => {
  return useQuery({
    queryKey: ['plans', gameId],
    queryFn: async () => {
      let query = supabase
        .from('plans')
        .select('*, games(*)')
        .order('price_monthly');
      
      if (gameId) {
        query = query.eq('game_id', gameId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Plan[];
    },
    enabled: !!gameId
  });
};

export const useBundles = () => {
  return useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('price_monthly');
      
      if (error) throw error;
      return data as Bundle[];
    }
  });
};

export const useModpacks = (gameId?: string) => {
  return useQuery({
    queryKey: ['modpacks', gameId],
    queryFn: async () => {
      let query = supabase
        .from('modpacks')
        .select('*')
        .order('name');
      
      if (gameId) {
        query = query.eq('game_id', gameId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Modpack[];
    },
    enabled: !!gameId
  });
};

export const useAddons = () => {
  return useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addons')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Addon[];
    }
  });
};

export const useDynamicCheckout = () => {
  const createCheckout = async (orderPayload: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-dynamic-checkout', {
        body: orderPayload
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Checkout creation failed:', error);
      throw error;
    }
  };

  return { createCheckout };
};