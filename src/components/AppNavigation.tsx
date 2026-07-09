import { useState, useEffect } from "react";
import {
  Activity,
  Settings,
  BarChart2,
  ChevronRight
} from "lucide-react";
import { Tag } from './shared/Tag';

type Page = "dashboard" | "analysis" | "config";

// Weather Dash + AI Dash + System Config
interface NavProps {
  page: Page;
  setPage: (p: Page) => void;
}

export function AppNavigation({ page, setPage }: NavProps) {
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