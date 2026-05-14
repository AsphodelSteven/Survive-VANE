import { useState } from 'react'; // Added this since it was missing!
import { useSensorData } from '../hooks/useSensorData';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { usePowerState } from '../hooks/usePowerState';
import { useAmbassador } from '../hooks/useAmbassador';

// These must match the "export function" style in your component files
import { SensorReadout } from './SensorReadout';
import { TheCurve } from './TheCurve';
import { TapestryMap } from './TapestryMap';
import { AnomalyScorePanel } from './AnomalyScore';
import { PowerAlert } from './PowerAlert';
import { AmbassadorToggle } from './AmbassadorToggle';

import { calculateAnomalyScores } from '../services/anomalyService';

export default function WeatherDashboard() {
  const { current, history } = useSensorData();
  const { allData, todayData } = useHistoricalData();
  const { powerState, restorePower } = usePowerState();
  const [ambassadorEnabled, setAmbassadorEnabled] = useState(false);
  const { nodes, stormCountdowns, gossipCount } = useAmbassador(ambassadorEnabled);

  const anomalies = current ? calculateAnomalyScores(current, todayData) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <PowerAlert powerState={powerState} onRestore={restorePower} />
      
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tighter text-cyan-400">VANE // PERRY_STATION_01</h1>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Atmospheric Network Explorer</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {current && <SensorReadout reading={current} />}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <TheCurve allHistorical={allData} sensorHistory={history} currentReading={current} />
          </div>
        </div>

        <div className="space-y-6">
          {anomalies && current && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
               <AnomalyScorePanel scores={anomalies} reading={current} historical={todayData} />
            </div>
          )}
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <AmbassadorToggle 
              enabled={ambassadorEnabled} 
              onToggle={setAmbassadorEnabled}
              nodeCount={nodes.length}
              gossipCount={gossipCount}
            />
            <div className="mt-4">
              <TapestryMap nodes={nodes} stormCountdowns={stormCountdowns} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}