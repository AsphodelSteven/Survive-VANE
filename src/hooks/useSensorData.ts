import { useState, useEffect, useCallback } from 'react';
import { SensorReading } from '../lib/types';
import { generateSensorReading } from '../services/sensorService';
import { supabase } from '../lib/supabase';
import { SENSOR_POLL_INTERVAL_MS } from '../lib/constants';

export function useSensorData(active: boolean = true) {
  const [current, setCurrent] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const reading = generateSensorReading(new Date());
      setCurrent(reading);
      setHistory(prev => {
        const next = [reading, ...prev].slice(0, 120);
        return next;
      });

      await supabase.from('sensor_readings').insert([reading]);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    poll();
    const interval = setInterval(poll, SENSOR_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [active, poll]);

  return { current, history, loading, error };
}
