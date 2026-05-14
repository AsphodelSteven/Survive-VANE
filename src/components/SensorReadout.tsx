import { SensorReading } from '../lib/types';
import { getWindDirectionLabel } from '../services/sensorService';
import { Thermometer, Gauge, Droplets, Wind, CloudRain, Activity } from 'lucide-react';

interface SensorReadoutProps {
  reading: SensorReading;
}

interface GaugeMetricProps {
  icon: React.ReactNode;
  label: string;
  raw: string;
  corrected: string;
  unit: string;
  status?: 'normal' | 'warn' | 'critical';
}

function MetricCard({ icon, label, raw, corrected, unit, status = 'normal' }: GaugeMetricProps) {
  const statusBorder = {
    normal: 'border-slate-700 hover:border-slate-600',
    warn: 'border-amber-400/40 bg-amber-400/5',
    critical: 'border-red-400/40 bg-red-400/5 animate-pulse',
  }[status];

  return (
    <div className={`bg-slate-800/60 border rounded-lg p-3 transition-all ${statusBorder}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-slate-400 w-4 h-4">{icon}</div>
        <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="space-y-0.5">
        <div className="text-white text-xl font-mono font-bold tracking-tight">
          {corrected}
          <span className="text-slate-500 text-sm ml-1">{unit}</span>
        </div>
        <div className="text-slate-600 text-[11px] font-mono">
          RAW {raw}{unit}
        </div>
      </div>
    </div>
  );
}

export function SensorReadout({ reading }: SensorReadoutProps) {
  const tempStatus = reading.temp_f_corrected > 100 ? 'critical' : reading.temp_f_corrected < 32 ? 'warn' : 'normal';
  const windStatus = reading.wind_speed_mph > 40 ? 'critical' : reading.wind_speed_mph > 25 ? 'warn' : 'normal';
  const airStatus = reading.eco2_ppm > 1500 ? 'critical' : reading.eco2_ppm > 1000 ? 'warn' : 'normal';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={<Thermometer className="w-4 h-4" />}
          label="Temp"
          raw={reading.temp_f_raw.toFixed(1)}
          corrected={reading.temp_f_corrected.toFixed(1)}
          unit="°F"
          status={tempStatus}
        />
        <MetricCard
          icon={<Gauge className="w-4 h-4" />}
          label="Pressure"
          raw={reading.pressure_hpa_raw.toFixed(1)}
          corrected={reading.pressure_hpa_corrected.toFixed(1)}
          unit=" hPa"
        />
        <MetricCard
          icon={<Droplets className="w-4 h-4" />}
          label="Humidity"
          raw={reading.humidity_pct.toFixed(1)}
          corrected={reading.humidity_pct.toFixed(1)}
          unit="%"
        />
        <MetricCard
          icon={<Wind className="w-4 h-4" />}
          label="Wind"
          raw={reading.wind_speed_mph.toFixed(1)}
          corrected={`${reading.wind_speed_mph.toFixed(1)} G${reading.wind_gust_mph.toFixed(0)}`}
          unit=" mph"
          status={windStatus}
        />
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">Air Quality (SGP30)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={`text-lg font-mono font-bold ${airStatus === 'critical' ? 'text-red-400' : airStatus === 'warn' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {reading.eco2_ppm}
              <span className="text-slate-500 text-xs ml-1">ppm</span>
            </div>
            <div className="text-slate-600 text-[11px] font-mono">eCO₂</div>
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-cyan-400">
              {reading.tvoc_ppb}
              <span className="text-slate-500 text-xs ml-1">ppb</span>
            </div>
            <div className="text-slate-600 text-[11px] font-mono">TVOC</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">Precip</span>
          </div>
          <span className="text-white font-mono text-sm font-bold">{reading.rain_in_hr.toFixed(3)} in/hr</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3">
            <div className="text-center">
              <div className="text-cyan-400 font-mono text-sm font-bold">{reading.wind_direction_deg}°</div>
              <div className="text-slate-600 text-[10px] font-mono">DEG</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-mono text-sm font-bold">{getWindDirectionLabel(reading.wind_direction_deg)}</div>
              <div className="text-slate-600 text-[10px] font-mono">DIR</div>
            </div>
            <div className="text-center">
              <div className="text-slate-300 font-mono text-sm font-bold">{reading.wind_gust_mph.toFixed(1)}</div>
              <div className="text-slate-600 text-[10px] font-mono">GUST mph</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
