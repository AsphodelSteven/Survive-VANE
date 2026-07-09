import { GlassCard } from '../shared/GlassCard';
import { Tag } from '../shared/Tag';
import {
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

export function SensorCard({
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