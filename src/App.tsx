import { WeatherDashboard } from "./components/dashboard/WeatherDashboard"
import { AIDashboard } from './components/analysis/AIDashboard';
import { SystemConfig } from "./components/config/SystemConfig";
import { AppNavigation } from './components/AppNavigation';
import { useState } from 'react';
import { AlertTriangle } from "lucide-react";

export default function App() {
  type Page = "dashboard" | "analysis" | "config";
  const [page, setPage] = useState<Page>("dashboard");

  const header = {
    dashboard: { title: "Core Dashboard", sub: "Live sensor telemetry & atmospheric curve analysis — KORD" },
    analysis:  { title: "AI Predictive Analysis", sub: "15–30 min precipitation forecast & divergence event monitoring" },
    config:    { title: "System Configuration", sub: "Model tuning, data source management & archive import pipeline" },
  }[page];

  return (
    <div
      className="h-screen w-screen flex bg-[#0a0a0a] overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.04) 0%, transparent 70%)",
        }}
      />

      <AppNavigation page={page} setPage={setPage} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between flex-shrink-0 bg-[rgba(4,10,16,0.6)] backdrop-blur-sm">
          <div>
            <h1 className="text-[15px] font-mono font-bold text-white tracking-[0.12em]">{header.title}</h1>
            <p className="text-[9px] font-mono text-[#00d4ff]/38 mt-0.5 tracking-wider">{header.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            {page === "dashboard" && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={11} className="text-[#ff6b6b]" />
                <span className="text-[9px] font-mono text-[#ff6b6b]/75">3 ANOMALIES ACTIVE</span>
              </div>
            )}
            <div className="w-px h-4 bg-[rgba(0,212,255,0.12)]" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block animate-pulse" />
              <span className="text-[9px] font-mono text-[#00d4ff]/55">LIVE</span>
            </div>
            <div className="px-3 py-1.5 rounded border border-[rgba(0,212,255,0.14)] bg-[rgba(0,212,255,0.03)]">
              <span className="text-[8.5px] font-mono text-[#00d4ff]/50 tracking-wider">
                STATION: KORD — CHICAGO O&apos;HARE
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-5" style={{ scrollbarWidth: "thin" }}>
          {page === "dashboard" && <WeatherDashboard />}
          {page === "analysis" && <AIDashboard />}
          {page === "config" && <SystemConfig />}
        </div>
      </div>
    </div>
  );
}