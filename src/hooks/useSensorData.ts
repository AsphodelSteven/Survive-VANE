import { useState, useEffect, useCallback } from 'react';
import { SensorReading } from '../lib/types';
import { supabase } from '../lib/supabase';
import { SENSOR_POLL_INTERVAL_MS } from '../lib/constants';
import { fetchAPIWeatherData, DataSource } from '../services/importService';
import { fetchLocalRadioData } from './useLocalSensorService';

export function useSensorData(active: boolean = true) {
  const [local, setLocal] = useState<SensorReading | null>(null);
  const [api, setApi] = useState<any | null>(null);
  // const [current, setCurrent] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);

  const poll = useCallback(async () => {
    try {
      const localReading = await fetchLocalRadioData();
      if (localReading) {
        setLocal(localReading);
        // setHistory(prev => [localReading, ...prev].slice(0,120));
        // 1. Update history
      const newHistory = [localReading, ...history].slice(0, 120);
      setHistory(newHistory);

      // 2. Simple Linear Regression (AI Baseline)
      // Only calculate if we have at least 5 data points
      if (newHistory.length >= 5) {
        const y = newHistory.slice(0, 5).map(r => r.temp_f_corrected);
        const x = [0, 1, 2, 3, 4]; // Time steps
        
        // Calculate slope (m) = (N*sum(xy) - sum(x)*sum(y)) / (N*sum(x^2) - sum(x)^2)
        const m = (5 * (0*y[0]+1*y[1]+2*y[2]+3*y[3]+4*y[4]) - 10 * (y[0]+y[1]+y[2]+y[3]+y[4])) / 
                  (5 * 30 - 100);
        
        // Predict next value (in 1 poll interval)
        setPrediction(localReading.temp_f_corrected + m);
      }
      }
        await supabase.from('sensor_readings').insert([localReading]);

      const apiData = await fetchAPIWeatherData(DataSource.OPEN_METEO, { lat: 29.0, lon: -82.0 });
      // console.log("DEBUG API DATA:", apiData);
      setApi(apiData);

    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [history]);

  useEffect(() => {
    if (!active) return;
    poll();
    const interval = setInterval(poll, SENSOR_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [active, poll]);

  return { local, api, history, prediction, loading, error };
}
