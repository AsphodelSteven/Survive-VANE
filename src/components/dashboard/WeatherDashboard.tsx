import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge
} from "lucide-react";
import { useSensorData } from '../../hooks/useSensorData';
import { GlassCard } from '../shared/GlassCard';
import { SensorCard } from '../dashboard/SensorCard';
import { Tag } from '../shared/Tag';
import { ChartToolTip } from '../shared/ChartToolTip';
import { MeshNetwork } from "./MeshNetwork";

// ── Page 1: Core Dashboard ────────────────────────────────────────

export function WeatherDashboard() {
  const { local, api, history } = useSensorData();
  const chartData = useMemo(() => {
  // Convert 120-item history into a smaller, Recharts-friendly format
  return history.slice(0, 24).reverse().map((r, i) => ({
    time: `${i}:00`, // Or format a timestamp
    live: r.temp_f_corrected,
    normal: api?.data?.current?.temperature_2m ?? 0 // Use API as a baseline
  }));
}, [history, api]);
const dynamicAnomalies = useMemo(() => {// If history is empty, return an array of 24 points of "dummy" data
  if (!history || history.length === 0) {
    // return Array.from({ length: 24 }).map((_, i) => ({
    //   time: `${i}:00`,
    //   live: 70 + Math.random() * 5, // Simulated temp
    //   normal: 72
    // }));
    return []
  }
  // Logic to determine if local temp is > 5 degrees from API baseline
  const isAnomaly = Math.abs((local?.temp_f_corrected ?? 0) - (api?.data?.current?.temperature_2m ?? 0)) > 5;
  return isAnomaly ? [{ id: 1, level: "HIGH", value: "ALERT", label: "Thermal Drift", time: "NOW", active: true }] : [];
}, [local, api, history]);
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Sensor row */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <SensorCard icon={Thermometer} label="Temperature" value={local?.temp_f_corrected?.toString() ?? "N/A"} refValue={api?.data?.current?.temperature_2m?.toString() ?? "N/A"} unit="°F" delta="+4.2°C above normal" trend="up" />
        <SensorCard icon={Gauge} label="Pressure" value={local?.pressure_hpa_corrected?.toString() ?? "N/A"} refValue={api?.data?.current?.pressure_msl?.toString() ?? "N/A"} unit="hPa" delta="−3.2 hPa / 6 hr" trend="down" />
        <SensorCard icon={Wind} label="Wind Speed" value={local?.wind_speed_mph?.toString() ?? "N/A"} refValue={api?.data?.current?.windspeed_10m?.toString() ?? "N/A"} unit="kt" delta="+2.1 kt gusts NNW" trend="up" />
        <SensorCard icon={Droplets} label="Humidity" value={local?.humidity_pct?.toString() ?? "N/A"} refValue={api?.data?.current?.relative_humidity_2m?.toString() ?? "N/A"} unit="%" delta="−1.4 % / hr" trend="down" />
      </div>

      {/* Body */}
      <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* The Curve */}
        <GlassCard className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <div>
              <h2 className="text-[13px] font-mono font-semibold text-white tracking-[0.14em]">THE CURVE</h2>
              <p className="text-[9px] font-mono text-[#00d4ff]/38 mt-0.5 tracking-wider">
                Live observation vs 30-yr climatological normal — KORD
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[["#00d4ff", "LIVE"], ["rgba(0,212,255,0.3)", "30-YR NORM"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="h-px w-5" style={{ background: c }} />
                  <span className="text-[8.5px] font-mono" style={{ color: c }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: -28, bottom: 0 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,212,255,0.05)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "rgba(0,212,255,0.35)", fontSize: 8, fontFamily: "JetBrains Mono" }}
                  tickLine={false} axisLine={false} interval={3}
                />
                <YAxis
                  tick={{ fill: "rgba(0,212,255,0.35)", fontSize: 8, fontFamily: "JetBrains Mono" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${v}°`}
                />
                <Tooltip content={<ChartToolTip />} />
                <ReferenceLine y={0} stroke="rgba(0,212,255,0.08)" strokeDasharray="2 4" />
                <Line
                  dataKey="normal" name="30-yr Normal"
                  stroke="rgba(0,212,255,0.28)" strokeWidth={1.5}
                  dot={false} strokeDasharray="5 4"
                />
                <Line
                  dataKey="live" name="Live"
                  stroke="#00d4ff" strokeWidth={2}
                  dot={false}
                  style={{ filter: "drop-shadow(0 0 4px rgba(0,212,255,0.55))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {/* Anomaly Index */}
          <GlassCard className="p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <Tag>Anomaly Index</Tag>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse inline-block" />
                <span className="text-[9px] font-mono text-[#ff6b6b]/70">{dynamicAnomalies.length > 0 ? `${dynamicAnomalies.length} ACTIVE` : "SYSTEM OK"}</span>
              </div>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1">
              {dynamicAnomalies.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-2.5 rounded border ${
                    a.active
                      ? "border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.04)]"
                      : "border-[rgba(0,212,255,0.06)] bg-transparent"
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono text-white/75">{a.label}</div>
                    <div className="text-[8px] font-mono text-[#00d4ff]/35 mt-0.5">{a.time}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[12px] font-mono font-bold ${a.active ? "text-[#ff6b6b]" : "text-[#00d4ff]/55"}`}>
                      {a.value}
                    </div>
                    <div
                      className={`text-[7.5px] font-mono tracking-widest mt-0.5 ${
                        a.level === "HIGH" ? "text-[#ff6b6b]/70" : a.level === "MED" ? "text-[#fbbf24]/70" : "text-[#00d4ff]/40"
                      }`}
                    >
                      {a.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Mesh Network */}
          <MeshNetwork />
        </div>
      </div>
    </div>
  );
}