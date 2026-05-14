import { useState, useEffect, useCallback } from 'react';
import { MeshNode, StormCountdown } from '../lib/types';
import { supabase } from '../lib/supabase';
import { calculateStormCountdowns } from '../services/meshService';
import { MESH_GOSSIP_INTERVAL_MS } from '../lib/constants';

export function useAmbassador(enabled: boolean) {
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [stormCountdowns, setStormCountdowns] = useState<StormCountdown[]>([]);
  const [gossipCount, setGossipCount] = useState(0);

  const fetchNodes = useCallback(async () => {
    if (!enabled) return;

    const { data } = await supabase
      .from('mesh_nodes')
      .select('*')
      .eq('is_allied', true)
      .order('bearing_deg', { ascending: true });

    if (data) {
      const updated = data.map(n => ({
        ...n,
        last_seen: new Date().toISOString(),
        wind_speed_mph: n.wind_speed_mph + (Math.random() - 0.5) * 2,
      }));
      setNodes(updated as MeshNode[]);
      setStormCountdowns(calculateStormCountdowns(updated as MeshNode[]));
      setGossipCount(c => c + 1);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setNodes([]);
      setStormCountdowns([]);
      return;
    }
    fetchNodes();
    const interval = setInterval(fetchNodes, MESH_GOSSIP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, fetchNodes]);

  return { nodes, stormCountdowns, gossipCount };
}
