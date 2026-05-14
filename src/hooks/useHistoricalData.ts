import { useState, useEffect } from 'react';
import { HistoricalAverage } from '../lib/types';
import { supabase } from '../lib/supabase';

export function useHistoricalData() {
  const [allData, setAllData] = useState<HistoricalAverage[]>([]);
  const [todayData, setTodayData] = useState<HistoricalAverage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const now = new Date();
      const month = now.getMonth() + 1;

      const { data: all } = await supabase
        .from('historical_averages')
        .select('*')
        .order('day_of_year', { ascending: true });

      setAllData(all ?? []);

      const dayOfYear = getDayOfYear(now);
      const { data: today } = await supabase
        .from('historical_averages')
        .select('*')
        .eq('station_id', 'VANE-PERRY-01')
        .eq('month', month)
        .eq('day_of_year', dayOfYear)
        .maybeSingle();

      setTodayData(today);
      setLoading(false);
    }
    fetch();
  }, []);

  return { allData, todayData, loading };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
