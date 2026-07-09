// import { useState, useEffect } from 'react';
// import { fetchAPIWeatherData, DataSource } from '../../services/importService';
import { GlassCard } from '../shared/GlassCard';
import { Tag } from '../shared/Tag';
import { ChartToolTip } from '../shared/ChartToolTip';
import { ConfidenceMeter } from './ConfidenceMeter';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AIDashboard() {
  const forecastData = (() =>
  Array.from({ length: 31 }, (_, i) => {
    const base = 0.08 + Math.sin(i * 0.28) * 0.06 + (i > 18 ? (i - 18) * 0.018 : 0);
    const spread = 0.03 + i * 0.0028;
    return {
      min: i,
      precip: Math.max(0, parseFloat((base + Math.sin(i * 1.7) * 0.018).toFixed(4))),
      upper: parseFloat((base + spread).toFixed(4)),
      lower: Math.max(0, parseFloat((base - spread).toFixed(4))),
    };
  }))();

  const eventLog = [
  { id: 1, time: "14:22:07", type: "ALERT", sev: "high", msg: "Divergence threshold exceeded: temp +4.2σ from NWS grid cell K7-ECHO" },
  { id: 2, time: "14:19:33", type: "INFO", sev: "info", msg: "Mesh node ALPHA-7 reporting nominal sync with Open-Meteo ensemble feed" },
  { id: 3, time: "14:15:18", type: "WARN", sev: "med", msg: "Pressure gradient mismatch: local −3.2 hPa vs regional −1.8 hPa (6-hr trend)" },
  { id: 4, time: "14:08:52", type: "ALERT", sev: "high", msg: "Wind shear: surface-to-850mb differential 34 kt — exceeds model event threshold" },
  { id: 5, time: "14:02:41", type: "INFO", sev: "info", msg: "Archive batch NOAA-2023-Q4 ingestion complete — 18,240 records indexed" },
  { id: 6, time: "13:58:14", type: "WARN", sev: "med", msg: "Open-Meteo API latency 2,140 ms — falling back to cached regional grid snapshot" },
  { id: 7, time: "13:51:09", type: "INFO", sev: "info", msg: "Checkpoint saved: VANE-PRED-v2.4.1 | loss: 0.0082 | val_acc: 97.3% | epoch: 440" },
  { id: 8, time: "13:44:32", type: "ALERT", sev: "high", msg: "Sensor BETA-2 outlier: 97.4% RH vs mesh avg 71.2% — isolation recommended" },
];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top row */}
      <div className="grid gap-4 flex-shrink-0" style={{ gridTemplateColumns: "1fr 240px" }}>
        {/* Forecast chart */}
        <GlassCard className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <div>
              <h2 className="text-[13px] font-mono font-semibold text-white tracking-[0.14em]">PREDICTIVE FORECAST</h2>
              <p className="text-[9px] font-mono text-[#00d4ff]/38 mt-0.5 tracking-wider">
                Localized precipitation probability — 30-min rolling projection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded border border-[rgba(0,212,255,0.18)] bg-[rgba(0,212,255,0.04)]">
                <span className="text-[8.5px] font-mono text-[#00d4ff]/70">VANE-PRED-v2.4.1</span>
              </div>
            </div>
          </div>
          <div className="flex-1" style={{ minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 12, right: 12, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,212,255,0.05)" />
                <XAxis
                  dataKey="min"
                  tickFormatter={(v) => `+${v}m`}
                  tick={{ fill: "rgba(0,212,255,0.35)", fontSize: 8, fontFamily: "JetBrains Mono" }}
                  tickLine={false} axisLine={false} interval={4}
                />
                <YAxis
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fill: "rgba(0,212,255,0.35)", fontSize: 8, fontFamily: "JetBrains Mono" }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip content={<ChartToolTip />} />
                <Area
                  dataKey="upper" name="Upper bound"
                  stroke="none" fill="url(#bandGrad)"
                />
                <Area
                  dataKey="precip" name="Precip prob"
                  stroke="#00d4ff" strokeWidth={2}
                  fill="url(#precipGrad)"
                  style={{ filter: "drop-shadow(0 0 5px rgba(0,212,255,0.45))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Confidence meter */}
        <ConfidenceMeter value={87} />
      </div>

      {/* Event Log */}
      <GlassCard className="p-4 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Tag>Event Log</Tag>
            <span className="text-[9px] font-mono text-[#1a2a34]">— Divergence Alerts</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-[#1a2a34]">{eventLog.length} ENTRIES</span>
            <div className="w-px h-3 bg-[rgba(0,212,255,0.1)]" />
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#00d4ff] animate-pulse inline-block" />
              <span className="text-[9px] font-mono text-[#00d4ff]/40">LIVE</span>
            </div>
          </div>
        </div>
        <div className="space-y-1 overflow-y-auto flex-1">
          {eventLog.map((e) => (
            <div
              key={e.id}
              className={`flex items-start gap-3 px-3 py-2.5 rounded border ${
                e.sev === "high"
                  ? "border-[rgba(255,107,107,0.14)] bg-[rgba(255,107,107,0.035)]"
                  : e.sev === "med"
                  ? "border-[rgba(251,191,36,0.1)] bg-[rgba(251,191,36,0.025)]"
                  : "border-[rgba(0,212,255,0.06)] bg-transparent"
              }`}
            >
              <span className="text-[8.5px] font-mono text-[#00d4ff]/35 whitespace-nowrap mt-px tabular-nums">{e.time}</span>
              <span
                className={`text-[8.5px] font-mono tracking-wider whitespace-nowrap mt-px w-10 flex-shrink-0 ${
                  e.type === "ALERT" ? "text-[#ff6b6b]" : e.type === "WARN" ? "text-[#fbbf24]" : "text-[#00d4ff]/50"
                }`}
              >
                {e.type}
              </span>
              <span className="text-[10.5px] font-mono text-white/60 leading-relaxed">{e.msg}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}