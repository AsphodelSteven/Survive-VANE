import { AnomalyScores, HistoricalAverage, SensorReading } from '../lib/types';
import { getAnomalyColor } from '../services/anomalyService';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnomalyScoreProps {
  scores: AnomalyScores;
  reading: SensorReading;
  historical: HistoricalAverage | null;
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const abs = Math.abs(value);
  const pct = Math.min(100, abs * 20);
  const color = abs < 1 ? 'bg-emerald-400' : abs < 2 ? 'bg-amber-400' : abs < 3 ? 'bg-orange-400' : 'bg-red-400';
  const Icon = value > 0.1 ? TrendingUp : value < -0.1 ? TrendingDown : Minus;
  const textColor = getAnomalyColor(value);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1">
          <Icon className={`w-3 h-3 ${textColor}`} />
          <span className={`text-xs font-mono font-semibold ${textColor}`}>
            {value >= 0 ? '+' : ''}{value.toFixed(2)}σ
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-600" />
        <div
          className={`absolute h-full ${color} rounded-full transition-all duration-1000`}
          style={{
            left: value >= 0 ? '50%' : `${50 - pct / 2}%`,
            width: `${pct / 2}%`,
          }}
        />
      </div>
    </div>
  );
}

export function AnomalyScorePanel({ scores, reading, historical }: AnomalyScoreProps) {
  const overallAbs = Math.abs(scores.overall);
  const overallColor = overallAbs < 1 ? 'text-emerald-400 border-emerald-400/30' : overallAbs < 2 ? 'text-amber-400 border-amber-400/30' : 'text-red-400 border-red-400/30';
  const overallBg = overallAbs < 1 ? 'bg-emerald-400/5' : overallAbs < 2 ? 'bg-amber-400/5' : 'bg-red-400/5';

  const tempDiff = historical ? reading.temp_f_corrected - historical.avg_mean_f : 0;
  const pressureDiff = historical ? reading.pressure_hpa_corrected - historical.avg_pressure_hpa : 0;
  const humidityDiff = historical ? reading.humidity_pct - historical.avg_humidity_pct : 0;

  return (
    <div className={`border rounded-lg p-4 ${overallColor} ${overallBg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-300">
          Anomaly Index
        </span>
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded border text-xs font-mono font-bold ${overallColor}`}>
          {scores.overall.toFixed(2)}σ
        </div>
      </div>

      <div className="space-y-3">
        <ScoreBar value={scores.temp} label="Temperature" />
        <ScoreBar value={scores.pressure} label="Pressure" />
        <ScoreBar value={scores.humidity} label="Humidity" />
        <ScoreBar value={scores.wind} label="Wind" />
      </div>

      {historical && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-500">vs 30-yr Mean</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs font-mono">
            <div className="text-center">
              <div className={tempDiff >= 0 ? 'text-orange-400' : 'text-cyan-400'}>
                {tempDiff >= 0 ? '+' : ''}{tempDiff.toFixed(1)}°F
              </div>
              <div className="text-slate-600 text-[10px]">TEMP</div>
            </div>
            <div className="text-center">
              <div className={pressureDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {pressureDiff >= 0 ? '+' : ''}{pressureDiff.toFixed(1)} hPa
              </div>
              <div className="text-slate-600 text-[10px]">PRES</div>
            </div>
            <div className="text-center">
              <div className={humidityDiff >= 0 ? 'text-cyan-400' : 'text-amber-400'}>
                {humidityDiff >= 0 ? '+' : ''}{humidityDiff.toFixed(1)}%
              </div>
              <div className="text-slate-600 text-[10px]">RH</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
