import { useState, useEffect, useCallback } from 'react';
import { PowerState, FluxSignal } from '../lib/types';
import { supabase } from '../lib/supabase';

export function usePowerState() {
  const [powerState, setPowerState] = useState<PowerState>('NORMAL');
  const [fluxSignals, setFluxSignals] = useState<FluxSignal[]>([]);

  const checkFluxSignals = useCallback(async () => {
    const { data } = await supabase
      .from('flux_signals')
      .select('*')
      .eq('acknowledged', false)
      .order('received_at', { ascending: false })
      .limit(10);

    if (!data) return;
    setFluxSignals(data as FluxSignal[]);

    const hasLowPower = data.some(s => s.signal_type === 'LOW_POWER');
    const hasNormal = data.some(s => s.signal_type === 'NORMAL_POWER');

    if (hasLowPower && !hasNormal) {
      setPowerState('LOW_POWER');
    } else {
      setPowerState('NORMAL');
    }
  }, []);

  const simulateLowPower = useCallback(async () => {
    await supabase.from('flux_signals').insert([{
      signal_type: 'LOW_POWER',
      payload: { battery_pct: 12, solar_irradiance: 0.08 },
      severity: 'CRITICAL',
      source: 'FLUX-SUBSTATION',
    }]);
    setPowerState('LOW_POWER');
    await checkFluxSignals();
  }, [checkFluxSignals]);

  const restorePower = useCallback(async () => {
    await supabase.from('flux_signals').insert([{
      signal_type: 'NORMAL_POWER',
      payload: { battery_pct: 87, solar_irradiance: 0.92 },
      severity: 'INFO',
      source: 'FLUX-SUBSTATION',
    }]);
    setPowerState('NORMAL');
    await checkFluxSignals();
  }, [checkFluxSignals]);

  const acknowledgeSignal = useCallback(async (id: string) => {
    await supabase.from('flux_signals').update({ acknowledged: true }).eq('id', id);
    setFluxSignals(prev => prev.filter(s => s.id !== id));
  }, []);

  useEffect(() => {
    checkFluxSignals();
    const interval = setInterval(checkFluxSignals, 15000);
    return () => clearInterval(interval);
  }, [checkFluxSignals]);

  return { powerState, fluxSignals, simulateLowPower, restorePower, acknowledgeSignal };
}
