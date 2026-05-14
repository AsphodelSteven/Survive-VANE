import { useState, useEffect, useCallback, useRef } from 'react';
import { ResearchLog, SensorReading, HistoricalAverage } from '../lib/types';
import { supabase } from '../lib/supabase';
import { calculateAnomalyScores } from '../services/anomalyService';
import { STATION_CONFIG } from '../lib/constants';

export function useResearchLog(
  currentReading: SensorReading | null,
  historicalToday: HistoricalAverage | null,
  active: boolean
) {
  const [recentLogs, setRecentLogs] = useState<ResearchLog[]>([]);
  const tickRef = useRef(0);

  const logReading = useCallback(async (resolution: 1 | 15 | 60) => {
    if (!currentReading || !active) return;

    const anomalies = calculateAnomalyScores(currentReading, historicalToday);

    const log: Omit<ResearchLog, 'id'> = {
      station_id: STATION_CONFIG.id,
      logged_at: new Date().toISOString(),
      resolution_min: resolution,
      temp_f_raw: currentReading.temp_f_raw,
      temp_f_corrected: currentReading.temp_f_corrected,
      pressure_hpa_raw: currentReading.pressure_hpa_raw,
      pressure_hpa_corrected: currentReading.pressure_hpa_corrected,
      humidity_pct: currentReading.humidity_pct,
      eco2_ppm: currentReading.eco2_ppm,
      tvoc_ppb: currentReading.tvoc_ppb,
      wind_speed_mph: currentReading.wind_speed_mph,
      wind_direction_deg: currentReading.wind_direction_deg,
      wind_gust_mph: currentReading.wind_gust_mph,
      rain_in_hr: currentReading.rain_in_hr,
      anomaly_score_temp: anomalies.temp,
      anomaly_score_pressure: anomalies.pressure,
      anomaly_score_humidity: anomalies.humidity,
    };

    const { data } = await supabase.from('research_logs').insert([log]).select();
    if (data?.[0]) {
      setRecentLogs(prev => [data[0] as ResearchLog, ...prev].slice(0, 200));
    }
  }, [currentReading, historicalToday, active]);

  useEffect(() => {
    if (!active || !currentReading) return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      logReading(1);
      if (tick % 15 === 0) logReading(15);
      if (tick % 60 === 0) logReading(60);
    }, 60000);

    return () => clearInterval(interval);
  }, [active, currentReading, logReading]);

  const fetchRecent = useCallback(async (resolution?: 1 | 15 | 60) => {
    let query = supabase
      .from('research_logs')
      .select('*')
      .eq('station_id', STATION_CONFIG.id)
      .order('logged_at', { ascending: false })
      .limit(100);

    if (resolution) query = query.eq('resolution_min', resolution);
    const { data } = await query;
    setRecentLogs((data ?? []) as ResearchLog[]);
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { recentLogs, logReading, fetchRecent };
}
