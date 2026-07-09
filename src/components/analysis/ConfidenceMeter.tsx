import { GlassCard } from '../shared/GlassCard';
import { Tag } from '../shared/Tag';

export function ConfidenceMeter({ value }: { value: number }) {
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