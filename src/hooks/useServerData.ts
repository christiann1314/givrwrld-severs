import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  features: string[];
  pterodactyl_env: Record<string, any>;
  pterodactyl_limits_patch: Record<string, any>;
}

export interface Addon {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  category: string;
  pterodactyl_env: Record<string, any>;
  pterodactyl_limits_patch: Record<string, any>;
}

export interface Modpack {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  pterodactyl_env: Record<string, any>;
  recommended?: boolean;
}

export const useServerData = (gameType: string) => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [modpacks, setModpacks] = useState<Modpack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bundles
        const { data: bundlesData, error: bundlesError } = await supabase
          .from('bundles')
          .select('*')
          .order('price_monthly');

        if (bundlesError) throw bundlesError;

        // Fetch addons
        const { data: addonsData, error: addonsError } = await supabase
          .from('addons')
          .select('*')
          .order('price_monthly');

        if (addonsError) throw addonsError;

        // Fetch modpacks for the specific game
        let modpacksQuery = supabase
          .from('modpacks')
          .select(`
            *,
            games!inner(slug)
          `)
          .order('price_monthly');

        // Filter by game type if we have a valid game
        if (gameType && gameType !== 'general') {
          modpacksQuery = modpacksQuery.eq('games.slug', gameType);
        }

        const { data: modpacksData, error: modpacksError } = await modpacksQuery;

        if (modpacksError) throw modpacksError;

        // Transform the data to match our interface
        setBundles((bundlesData || []).map(b => ({
          ...b,
          features: Array.isArray(b.features) ? (b.features as string[]) : [],
          pterodactyl_env: b.pterodactyl_env as Record<string, any> || {},
          pterodactyl_limits_patch: b.pterodactyl_limits_patch as Record<string, any> || {}
        })));

        setAddons((addonsData || []).map(a => ({
          ...a,
          pterodactyl_env: a.pterodactyl_env as Record<string, any> || {},
          pterodactyl_limits_patch: a.pterodactyl_limits_patch as Record<string, any> || {}
        })));

        setModpacks((modpacksData || []).map(m => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          description: m.description || '',
          price_monthly: m.price_monthly,
          pterodactyl_env: m.pterodactyl_env as Record<string, any> || {},
          recommended: m.slug === 'vanilla' || m.slug === 'popular-mods'
        })));

        setError(null);
      } catch (err) {
        console.error('Error fetching server data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameType]);

  return {
    bundles,
    addons,
    modpacks,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger useEffect by updating dependencies if needed
    }
  };
};