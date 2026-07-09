import {
  Database,
  CheckCircle,
  Clock,
} from "lucide-react";

export function ImportRow({
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