import { GlassCard } from '../shared/GlassCard';
import { Tag } from '../shared/Tag';

export function MeshNetwork() {
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