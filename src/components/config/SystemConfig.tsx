import { GlassCard } from '../shared/GlassCard';
import { useState } from "react";
import {
  Radio,
  Database,
  Download,
  Wifi,
  Shield,
  Cpu,
  GitBranch,
} from "lucide-react";
import { TuningSlider } from '../config/TuningSlider';
import { DataToggle } from '../config/DataToggle';
import { ImportRow } from '../config/ImportRow';

export function SystemConfig() {
  const [lr, setLr] = useState(0.001);
  const [sens, setSens] = useState(0.74);
  const [momentum, setMomentum] = useState(0.9);
  const [reg, setReg] = useState(0.235);

  const [sources, setSources] = useState({
    nws: true, openmeteo: true, radio: false, historical: true,
  });
  const toggle = (k: keyof typeof sources) => setSources((p) => ({ ...p, [k]: !p[k] }));

  const imports: Array<{ name: string; pct: number; size: string; status: "complete" | "ingesting" | "queued" }> = [
    { name: "NOAA-2023-Q4.zip", pct: 100, size: "2.4 GB", status: "complete" },
    { name: "NOAA-2023-Q3.zip", pct: 100, size: "2.1 GB", status: "complete" },
    { name: "NOAA-2024-Q1.zip", pct: 67,  size: "2.8 GB", status: "ingesting" },
    { name: "LOCAL-SONDE-2024.zip", pct: 0, size: "840 MB", status: "queued" },
    { name: "HISTORICAL-1990-2010.zip", pct: 0, size: "14.2 GB", status: "queued" },
  ];

  const activeCount = Object.values(sources).filter(Boolean).length;

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Model Tuning */}
      <GlassCard className="p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <h2 className="text-[13px] font-mono font-semibold text-white tracking-[0.12em]">MODEL TUNING</h2>
            <p className="text-[9px] font-mono text-[#00d4ff]/35 mt-0.5">Gradient descent parameters</p>
          </div>
          <Cpu size={13} className="text-[#00d4ff]/40" />
        </div>
        <div className="space-y-6 flex-1">
          <TuningSlider
            label="Learning Rate (η)" value={lr} onChange={setLr}
            min={0.0001} max={0.01} step={0.0001}
            fmt={(v) => v.toExponential(1)}
            desc="Gradient descent step magnitude. Lower = stable convergence, slower training."
          />
          <TuningSlider
            label="Anomaly Sensitivity" value={sens} onChange={setSens}
            desc="σ threshold at which divergence events are flagged to the event log feed."
          />
          <TuningSlider
            label="Momentum Decay (β₁)" value={momentum} onChange={setMomentum}
            desc="Adam optimizer first-moment exponential decay. Default 0.9 per Kingma & Ba."
          />
          <TuningSlider
            label="L2 Regularization" value={reg} onChange={setReg}
            desc="Weight decay coefficient. Prevents overfitting to seasonal climatological data."
          />
        </div>
        <div className="pt-5 mt-5 border-t border-[rgba(0,212,255,0.07)] flex gap-2 flex-shrink-0">
          <button className="flex-1 py-2 rounded border border-[rgba(0,212,255,0.22)] text-[10px] font-mono text-[#00d4ff] hover:bg-[rgba(0,212,255,0.07)] transition-colors tracking-wider">
            APPLY
          </button>
          <button className="flex-1 py-2 rounded border border-[rgba(255,255,255,0.05)] text-[10px] font-mono text-[#2a3a44] hover:text-[#556070] transition-colors tracking-wider">
            RESET
          </button>
        </div>
      </GlassCard>

      {/* Data Sources */}
      <GlassCard className="p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <h2 className="text-[13px] font-mono font-semibold text-white tracking-[0.12em]">DATA SOURCES</h2>
            <p className="text-[9px] font-mono text-[#00d4ff]/35 mt-0.5">Ingestion pipeline toggles</p>
          </div>
          <GitBranch size={13} className="text-[#00d4ff]/40" />
        </div>
        <div className="space-y-2 flex-1">
          <DataToggle
            label="NWS Regional Grid" active={sources.nws} onToggle={() => toggle("nws")} icon={Shield}
            note="NOAA / NWS API — primary regional grid feed"
          />
          <DataToggle
            label="Open-Meteo API" active={sources.openmeteo} onToggle={() => toggle("openmeteo")} icon={Wifi}
            note="Global open-source weather model ensemble"
          />
          <DataToggle
            label="Local Radio Sonde" active={sources.radio} onToggle={() => toggle("radio")} icon={Radio}
            note="433 MHz RS41 upper-air observation receiver"
          />
          <DataToggle
            label="Historical Archives" active={sources.historical} onToggle={() => toggle("historical")} icon={Database}
            note="Local NOAA climate data archive — 1950–2024"
          />
        </div>
        <div className="pt-5 mt-4 border-t border-[rgba(0,212,255,0.07)] flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "ACTIVE", val: activeCount, col: "#00d4ff" },
              { label: "DISABLED", val: 4 - activeCount, col: "#2a3a44" },
            ].map((s) => (
              <div key={s.label} className="text-center p-2.5 rounded border border-[rgba(0,212,255,0.06)]">
                <div className="text-[18px] font-mono font-bold" style={{ color: s.col }}>{s.val}</div>
                <div className="text-[7.5px] font-mono text-[#1e2e38] tracking-[0.2em] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Import Service */}
      <GlassCard className="p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <h2 className="text-[13px] font-mono font-semibold text-white tracking-[0.12em]">IMPORT SERVICE</h2>
            <p className="text-[9px] font-mono text-[#00d4ff]/35 mt-0.5">Historical archive ingestion</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse inline-block" />
            <Download size={12} className="text-[#fbbf24]/60" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 flex-shrink-0">
          {[
            { label: "QUEUED", val: "2", col: "#2a3a44" },
            { label: "ACTIVE", val: "1", col: "#fbbf24" },
            { label: "DONE", val: "2", col: "#00d4ff" },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded border border-[rgba(0,212,255,0.06)]">
              <div className="text-[16px] font-mono font-bold" style={{ color: s.col }}>{s.val}</div>
              <div className="text-[7.5px] font-mono text-[#1e2e38] tracking-[0.18em] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {imports.map((item) => (
            <ImportRow key={item.name} {...item} />
          ))}
        </div>

        <div className="pt-4 mt-3 border-t border-[rgba(0,212,255,0.07)] flex-shrink-0 space-y-2">
          <div className="flex justify-between text-[8.5px] font-mono">
            <span className="text-[#1e2e38]">TOTAL: 22.36 GB</span>
            <span className="text-[#00d4ff]/40">INGESTED: 4.5 GB</span>
          </div>
          <div className="h-[3px] rounded-full bg-[rgba(0,212,255,0.07)]">
            <div
              className="h-full rounded-full bg-[#00d4ff]/40"
              style={{ width: "20.1%", boxShadow: "0 0 6px rgba(0,212,255,0.3)" }}
            />
          </div>
          <div className="text-[8px] font-mono text-[#1a2a34] text-right">20.1% complete</div>
        </div>
      </GlassCard>
    </div>
  );
}