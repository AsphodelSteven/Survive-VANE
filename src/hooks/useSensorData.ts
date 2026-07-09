import { useState, useEffect, useCallback } from 'react';
import { SensorReading } from '../lib/types';
import { generateSensorReading } from '../services/sensorService';
import { supabase } from '../lib/supabase';
import { SENSOR_POLL_INTERVAL_MS } from '../lib/constants';
import { fetchAPIWeatherData, DataSource } from '../services/importService';

export function useSensorData(active: boolean = true) {
  const [local, setLocal] = useState<SensorReading | null>(null);
  const [api, setApi] = useState<any | null>(null);
  // const [current, setCurrent] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const localReading = generateSensorReading(new Date());
      setLocal(localReading);
      setHistory(prev => {
        const next = [localReading, ...prev].slice(0, 120);
        return next;
      });
      const apiData = await fetchAPIWeatherData(DataSource.OPEN_METEO, { lat: 29.0, lon: -82.0 });
    setApi(apiData);

      await supabase.from('sensor_readings').insert([localReading]);
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

  return { local, api, history, loading, error };
}
