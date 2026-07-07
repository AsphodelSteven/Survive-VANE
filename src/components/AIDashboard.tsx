import { useState, useEffect } from 'react';
import { fetchAPIWeatherData, DataSource } from '../services/importService';

export function AIDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple fetch sequence for demo purposes
    const loadData = async () => {
      try {
        const result = await fetchAPIWeatherData(DataSource.OPEN_METEO, { lat: 29.0, lon: -82.0 });
        setData(result);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <h1 className="text-xl font-mono mb-4 text-cyan-400">AI Data Stream</h1>
      
      {loading ? (
        <div className="animate-pulse text-sm font-mono text-slate-600">Syncing with upstream...</div>
      ) : (
        <pre className="bg-slate-900 p-4 rounded text-xs font-mono border border-slate-800 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}