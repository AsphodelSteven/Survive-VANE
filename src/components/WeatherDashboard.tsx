import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Gauge,
  Activity,
  Radio,
  Settings,
  BarChart2,
  AlertTriangle,
  Database,
  Download,
  Wifi,
  Shield,
  Cpu,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useSensorData } from '../hooks/useSensorData';

type Page = "dashboard" | "analysis" | "config";

// ── Static data ──────────────────────────────────────────────────

const curveData = (() => {
  const base = [2, 1, 0, -1, -2, -2, 0, 3, 7, 12, 16, 19, 21, 22, 22, 20, 18, 15, 11, 8, 6, 5, 4, 3];
  return base.map((v, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    live: parseFloat((v + (Math.sin(i * 0.9) * 2.1 + Math.cos(i * 0.5) * 1.3)).toFixed(1)),
    normal: v,
  }));
})();

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

const anomalies = [
  { id: 1, level: "HIGH", value: "+4.2σ", label: "Temp deviation", time: "14:22", active: true },
  { id: 2, level: "MED", value: "+1.8σ", label: "Pressure drop", time: "13:55", active: true },
  { id: 3, level: "LOW", value: "+0.9σ", label: "Humidity spike", time: "13:41", active: false },
  { id: 4, level: "HIGH", value: "−3.1σ", label: "Wind shear event", time: "13:12", active: true },
  { id: 5, level: "LOW", value: "+1.1σ", label: "Dew point shift", time: "12:58", active: false },
  { id: 6, level: "MED", value: "−2.3σ", label: "Barometric trend", time: "12:34", active: false },
];

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

const meshNodes = [
  { id: "ALPHA-1", x: 58,  y: 42,  status: "active",  sig: 98 },
  { id: "ALPHA-7", x: 200, y: 78,  status: "active",  sig: 94 },
  { id: "BETA-2",  x: 128, y: 162, status: "warning", sig: 61 },
  { id: "GAMMA-3", x: 282, y: 138, status: "active",  sig: 89 },
  { id: "DELTA-4", x: 310, y: 58,  status: "active",  sig: 76 },
  { id: "BETA-9",  x: 58,  y: 200, status: "offline", sig: 0  },
  { id: "CORE",    x: 184, y: 122, status: "core",    sig: 100 },
];

const meshEdges = [
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [1, 4], [0, 2], [3, 4],
];

// ── Shared primitives ────────────────────────────────────────────

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-[rgba(0,212,255,0.11)] bg-[rgba(10,20,28,0.78)] backdrop-blur-md ${className}`}
      style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,212,255,0.05)" }}
    >
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-mono tracking-[0.22em] text-[#00d4ff]/45 uppercase">
      {children}
    </span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-[rgba(0,212,255,0.18)] bg-[rgba(4,12,18,0.97)] px-3 py-2 text-[10px] font-mono">
      <p className="text-[#00d4ff]/60 mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.color ?? e.stroke }}>
          {e.name}: {typeof e.value === "number" ? e.value.toFixed(2) : e.value}
        </p>
      ))}
    </div>
  );
}

// ── Sensor card ───────────────────────────────────────────────────

function SensorCard({
  icon: Icon, label, value, unit, refValue, delta, trend,
}: {
  icon: React.ElementType; label: string; value: string; unit: string; refValue?: string; delta: string; trend: "up" | "down" | "flat";
}) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendCol =
    trend === "up" ? "text-[#ff6b6b]" : trend === "down" ? "text-[#00d4ff]" : "text-[#666]";
  return (
    <GlassCard className="p-4 flex flex-col gap-1.5 relative overflow-hidden">
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)" }}
      />
      <div className="flex items-center justify-between">
        <Tag>{label}</Tag>
        <div className="flex items-center gap-2">
          {/* This conditional rendering only shows if refValue is provided */}
          {refValue && (
          <span className="text-[9px] font-mono text-[#00d4ff]/60 border border-[#00d4ff]/20 px-1 rounded">
          REF: {refValue}
          </span>
          )}
          <Icon size={12} className="text-[#00d4ff]/50" />
        </div>
      </div>
      <div className="flex items-end gap-1.5 mt-1">
        <span 
          className="text-[28px] font-mono font-bold text-white leading-none tracking-tight"
          style={{ textShadow: "0 0 20px rgba(0,212,255,0.2)" }}
        >
          {value}
        </span>
        <span className="text-[12px] font-mono text-[#00d4ff]/55 mb-0.5">{unit}</span>
      </div>
      <div className={`flex items-center gap-1 ${trendCol}`}>
        <TrendIcon size={9} />
        <span className="text-[10px] font-mono">{delta}</span>
      </div>
      <div className="mt-1.5 h-px bg-gradient-to-r from-[#00d4ff]/25 via-[#00d4ff]/10 to-transparent" />
    </GlassCard>
  );
}

// ── Mesh network ─────────────────────────────────────────────────

function MeshNetwork() {
  const col: Record<string, string> = {
    active: "#00d4ff",
    warning: "#fbbf24",
    offline: "#2d3d48",
    core: "#00d4ff",
  };
  return (
    <GlassCard className="p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <Tag>Mesh Network</Tag>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block animate-pulse" />
          <span className="text-[9px] font-mono text-[#00d4ff]/55">6 / 7 ONLINE</span>
        </div>
      </div>
      <div className="flex-1">
        <svg viewBox="0 0 370 240" className="w-full" style={{ height: 180 }}>
          {meshEdges.map(([a, b], i) => {
            const n1 = meshNodes[a], n2 = meshNodes[b];
            const off = n1.status === "offline" || n2.status === "offline";
            return (
              <line
                key={i}
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke={off ? "rgba(45,61,72,0.4)" : "rgba(0,212,255,0.18)"}
                strokeWidth={off ? 0.8 : 1}
                strokeDasharray={off ? "4 4" : undefined}
              />
            );
          })}
          {meshNodes.map((node) => {
            const c = col[node.status];
            const isCore = node.status === "core";
            return (
              <g key={node.id}>
                {isCore && (
                  <>
                    <circle cx={node.x} cy={node.y} r="24" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1">
                      <animate attributeName="r" values="24;32;24" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.2;1" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={node.x} cy={node.y} r="16" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="1" />
                  </>
                )}
                <circle
                  cx={node.x} cy={node.y}
                  r={isCore ? 9 : 5.5}
                  fill="rgba(8,18,26,0.95)"
                  stroke={c}
                  strokeWidth={isCore ? 1.8 : 1.3}
                  style={{ filter: node.status !== "offline" ? `drop-shadow(0 0 5px ${c}99)` : undefined }}
                />
                {isCore && <circle cx={node.x} cy={node.y} r="3.5" fill="#00d4ff" style={{ filter: "drop-shadow(0 0 4px #00d4ff)" }} />}
                <text x={node.x} y={node.y + (isCore ? 22 : 17)} textAnchor="middle" fill={c} fontSize="6.5" fontFamily="JetBrains Mono" opacity="0.85">
                  {node.id}
                </text>
                {node.status !== "offline" && !isCore && (
                  <text x={node.x} y={node.y + 26} textAnchor="middle" fill="rgba(0,212,255,0.38)" fontSize="5.5" fontFamily="JetBrains Mono">
                    {node.sig}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex gap-4 pt-3 border-t border-[rgba(0,212,255,0.07)]">
        {[["#00d4ff", "Active"], ["#fbbf24", "Warning"], ["#2d3d48", "Offline"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c }} />
            <span className="text-[9px] font-mono text-[#4a6070]">{l}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Confidence meter ──────────────────────────────────────────────

function ConfidenceMeter({ value }: { value: number }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <GlassCard className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Tag>Confidence Meter</Tag>
        <span className="text-[9px] font-mono text-[#00d4ff]/40">AI ACCURACY</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="176" height="176" viewBox="0 0 176 176">
            <circle cx="88" cy="88" r={r} fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="7" />
            <circle cx="88" cy="88" r="52" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="1" />
            <circle
              cx="88" cy="88" r={r}
              fill="none"
              stroke="#00d4ff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 88 88)"
              style={{ filter: "drop-shadow(0 0 8px rgba(0,212,255,0.65))", transition: "stroke-dashoffset 1.2s ease" }}
            />
            <text x="88" y="81" textAnchor="middle" fill="white" fontSize="27" fontFamily="JetBrains Mono" fontWeight="700">
              {value}%
            </text>
            <text x="88" y="100" textAnchor="middle" fill="rgba(0,212,255,0.5)" fontSize="8" fontFamily="JetBrains Mono" letterSpacing="2.5">
              CONFIDENCE
            </text>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full mt-4">
          {[
            { label: "PRECISION", val: "91.2%" },
            { label: "RECALL", val: "88.7%" },
            { label: "F1 SCORE", val: "0.899" },
          ].map((m) => (
            <div key={m.label} className="text-center p-2 rounded border border-[rgba(0,212,255,0.07)]">
              <div className="text-[8px] font-mono text-[#00d4ff]/35 tracking-widest mb-1">{m.label}</div>
              <div className="text-[12px] font-mono text-white">{m.val}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Tuning slider ─────────────────────────────────────────────────

function TuningSlider({
  label, value, onChange, desc, min = 0, max = 1, step = 0.001, fmt,
}: {
  label: string; value: number; onChange: (v: number) => void; desc: string;
  min?: number; max?: number; step?: number; fmt?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = fmt ? fmt(value) : value.toFixed(3);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/75">{label}</span>
        <span className="text-[11px] font-mono text-[#00d4ff]">{display}</span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, rgba(0,212,255,0.7) ${pct}%, rgba(0,212,255,0.09) ${pct}%)`,
          }}
        />
      </div>
      <p className="text-[8.5px] font-mono text-[#00d4ff]/28 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Data source toggle ────────────────────────────────────────────

function DataToggle({
  label, active, onToggle, icon: Icon, note,
}: {
  label: string; active: boolean; onToggle: () => void; icon: React.ElementType; note: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all duration-200 ${
        active
          ? "border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.05)]"
          : "border-[rgba(255,255,255,0.04)] bg-transparent hover:border-[rgba(0,212,255,0.08)]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={12} className={active ? "text-[#00d4ff]" : "text-[#333]"} />
        <div>
          <div className={`text-[11px] font-mono ${active ? "text-white" : "text-[#444]"}`}>{label}</div>
          <div className="text-[9px] font-mono text-[#2a3a44] mt-0.5">{note}</div>
        </div>
      </div>
      <div
        className={`w-8 h-[18px] rounded-full relative flex-shrink-0 border transition-all duration-200 ${
          active ? "bg-[rgba(0,212,255,0.2)] border-[rgba(0,212,255,0.45)]" : "bg-[#111] border-[#222]"
        }`}
      >
        <span
          className={`absolute top-[3px] w-3 h-3 rounded-full transition-all duration-200 ${
            active ? "left-[17px] bg-[#00d4ff]" : "left-[3px] bg-[#333]"
          }`}
          style={{ boxShadow: active ? "0 0 6px rgba(0,212,255,0.8)" : undefined }}
        />
      </div>
    </button>
  );
}

// ── Import row ────────────────────────────────────────────────────

function ImportRow({
  name, pct, size, status,
}: {
  name: string; pct: number; size: string; status: "complete" | "ingesting" | "queued";
}) {
  const statusCol = status === "complete" ? "#00d4ff" : status === "ingesting" ? "#fbbf24" : "#2a3a44";
  const barCol = status === "complete" ? "#00d4ff" : status === "ingesting" ? "#fbbf24" : "#1a2530";
  return (
    <div className="p-3 rounded border border-[rgba(0,212,255,0.07)] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={10} className="text-[#00d4ff]/40" />
          <span className="text-[10px] font-mono text-white/70">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#2a3a44]">{size}</span>
          <span className="text-[9px] font-mono tracking-wider" style={{ color: statusCol }}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="h-[3px] rounded-full bg-[rgba(0,212,255,0.07)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: barCol,
            boxShadow: status === "ingesting" ? "0 0 8px rgba(251,191,36,0.5)" : undefined,
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[8.5px] font-mono text-[#2a3a44]">{pct}% complete</span>
        {status === "ingesting" && (
          <span className="text-[8.5px] font-mono text-[#fbbf24]/60 animate-pulse">● INGESTING</span>
        )}
        {status === "complete" && (
          <span className="text-[8.5px] font-mono text-[#00d4ff]/50 flex items-center gap-1">
            <CheckCircle size={8} /> DONE
          </span>
        )}
        {status === "queued" && (
          <span className="text-[8.5px] font-mono text-[#2a3a44] flex items-center gap-1">
            <Clock size={8} /> QUEUED
          </span>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────

function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nav = [
    { id: "dashboard" as Page, label: "CORE DASHBOARD", sub: "Live Telemetry", icon: Activity },
    { id: "analysis" as Page, label: "A.I. ANALYSIS", sub: "Predictive Forecast", icon: BarChart2 },
    { id: "config" as Page, label: "SYS CONFIG", sub: "Dev Tools", icon: Settings },
  ];

  const sysStatus = [
    { label: "MESH SYNC", val: "6/7", ok: true },
    { label: "API LATENCY", val: "142 ms", ok: true },
    { label: "MODEL", val: "READY", ok: true },
    { label: "ANOMALIES", val: "3 ACTIVE", ok: false },
  ];

  return (
    <div className="w-[200px] flex-shrink-0 flex flex-col border-r border-[rgba(0,212,255,0.09)] bg-[rgba(4,10,16,0.96)]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[rgba(0,212,255,0.07)]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center border border-[rgba(0,212,255,0.28)] bg-[rgba(0,212,255,0.05)] flex-shrink-0"
            style={{ boxShadow: "0 0 16px rgba(0,212,255,0.12), inset 0 0 8px rgba(0,212,255,0.05)" }}
          >
            <span className="text-[#00d4ff] text-base font-mono font-bold">V</span>
          </div>
          <div>
            <div className="text-[13px] font-mono font-bold text-white tracking-[0.18em]">V.A.N.E.</div>
            <div className="text-[7.5px] font-mono text-[#00d4ff]/35 tracking-[0.12em] mt-0.5">ATMOS. NET. EXPLORER</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-all duration-200 border ${
                active
                  ? "bg-[rgba(0,212,255,0.07)] border-[rgba(0,212,255,0.2)]"
                  : "border-transparent hover:bg-[rgba(0,212,255,0.03)] hover:border-[rgba(0,212,255,0.06)]"
              }`}
            >
              <item.icon size={12} className={active ? "text-[#00d4ff]" : "text-[#2d4050]"} />
              <div className="flex-1 min-w-0">
                <div className={`text-[9.5px] font-mono tracking-wider truncate ${active ? "text-white" : "text-[#2d4050]"}`}>
                  {item.label}
                </div>
                <div className={`text-[8px] font-mono mt-0.5 truncate ${active ? "text-[#00d4ff]/45" : "text-[#1a2a34]"}`}>
                  {item.sub}
                </div>
              </div>
              {active && <ChevronRight size={9} className="text-[#00d4ff]/35 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* System status */}
      <div className="p-4 border-t border-[rgba(0,212,255,0.07)] space-y-2.5">
        <Tag>System Status</Tag>
        <div className="space-y-1.5 mt-1">
          {sysStatus.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-[#1e2e38]">{s.label}</span>
              <span className={`text-[9px] font-mono ${s.ok ? "text-[#00d4ff]/60" : "text-[#ff6b6b]/75"}`}>{s.val}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-[rgba(0,212,255,0.05)]">
          <div className="text-[10px] font-mono text-[#00d4ff]/25 text-center tabular-nums tracking-wider">
            {time.toLocaleTimeString("en-US", { hour12: false })} UTC
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page 1: Core Dashboard ────────────────────────────────────────

function CoreDashboard() {
  const { local, api } = useSensorData();
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Sensor row */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <SensorCard icon={Thermometer} label="Temperature" value={local?.temp_f_corrected?.toString() ?? "0"} refValue={api?.data?.current?.temperature_2m?.toString()} unit="°C" delta="+4.2°C above normal" trend="up" />
        <SensorCard icon={Gauge} label="Pressure" value={local?.pressure_hpa_corrected?.toString() ?? "0"} refValue={api?.data?.current?.pressure_msl?.toString()} unit="hPa" delta="−3.2 hPa / 6 hr" trend="down" />
        <SensorCard icon={Wind} label="Wind Speed" value={local?.wind_speed_mph?.toString() ?? "0"} refValue={api?.data?.current?.windspeed_10m?.toString()} unit="kt" delta="+2.1 kt gusts NNW" trend="up" />
        <SensorCard icon={Droplets} label="Humidity" value={local?.humidity_pct?.toString() ?? "0"} refValue={api?.data?.current?.relative_humidity_2m?.toString()} unit="%" delta="−1.4 % / hr" trend="down" />
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
              <LineChart data={curveData} margin={{ top: 12, right: 12, left: -28, bottom: 0 }}>
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
                <Tooltip content={<ChartTooltip />} />
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
                <span className="text-[9px] font-mono text-[#ff6b6b]/70">3 ACTIVE</span>
              </div>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1">
              {anomalies.map((a) => (
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

// ── Page 2: AI Analysis ───────────────────────────────────────────

function AIAnalysis() {
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
                <Tooltip content={<ChartTooltip />} />
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

// ── Page 3: System Config ─────────────────────────────────────────

function SystemConfig() {
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

// ── App root ──────────────────────────────────────────────────────

export default function App() {
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

      <Sidebar page={page} setPage={setPage} />

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
          {page === "dashboard" && <CoreDashboard />}
          {page === "analysis" && <AIAnalysis />}
          {page === "config" && <SystemConfig />}
        </div>
      </div>
    </div>
  );
}
