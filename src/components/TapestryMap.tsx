import { MeshNode, StormCountdown } from '../lib/types';
import { bearingToCardinal, getNodeStatusColor } from '../services/meshService';
import { Clock, Wind, AlertTriangle } from 'lucide-react';

interface TapestryMapProps {
  nodes: MeshNode[];
  stormCountdowns: StormCountdown[];
}

function nodePosition(bearing: number, distance: number, cx: number, cy: number, maxR: number) {
  const rad = ((bearing - 90) * Math.PI) / 180;
  const scale = Math.min(1, distance / 100);
  const r = 20 + scale * (maxR - 20);
  return {
    x: cx + Math.cos(rad) * r,
    y: cy + Math.sin(rad) * r,
  };
}

export function TapestryMap({ nodes, stormCountdowns }: TapestryMapProps) {
  const W = 320;
  const H = 280;
  const CX = W / 2;
  const CY = H / 2 + 10;
  const MAX_R = 120;

  const rings = [40, 70, 100, 130];

  const getStatusFill = (status: MeshNode['status']) => {
    switch (status) {
      case 'ONLINE': return '#34d399';
      case 'CRITICAL': return '#fb923c';
      case 'STORM': return '#f87171';
      default: return '#475569';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-300 text-xs font-mono font-semibold uppercase tracking-widest">
          Tapestry Map
        </span>
        <span className="text-slate-500 text-[10px] font-mono">{nodes.length} ALLIED NODES</span>
      </div>

      {stormCountdowns.length > 0 && (
        <div className="mb-2 space-y-1">
          {stormCountdowns.map(sc => (
            <div key={sc.nodeId} className="flex items-center gap-2 px-2 py-1.5 bg-red-400/10 border border-red-400/30 rounded text-xs font-mono">
              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
              <span className="text-red-300 font-semibold">{sc.nodeName}</span>
              <span className="text-slate-400">→ ETA</span>
              <span className="text-red-400 font-bold">{sc.eta_minutes}min</span>
              <span className="text-slate-500 ml-auto">{sc.windSpeedMph.toFixed(0)}mph</span>
            </div>
          ))}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {rings.map(r => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#1e293b" strokeWidth="1" />
        ))}

        {['N', 'E', 'S', 'W'].map((dir, i) => {
          const a = (i * 90 - 90) * Math.PI / 180;
          const r = MAX_R + 12;
          return (
            <text
              key={dir}
              x={CX + Math.cos(a) * r}
              y={CY + Math.sin(a) * r + 3}
              textAnchor="middle"
              fontSize="9"
              fill="#334155"
              fontFamily="monospace"
            >
              {dir}
            </text>
          );
        })}

        <line x1={CX} y1={CY - MAX_R - 5} x2={CX} y2={CY + MAX_R + 5} stroke="#1e293b" strokeWidth="0.5" />
        <line x1={CX - MAX_R - 5} y1={CY} x2={CX + MAX_R + 5} y2={CY} stroke="#1e293b" strokeWidth="0.5" />

        {nodes.map(node => {
          const pos = nodePosition(node.bearing_deg, node.distance_miles, CX, CY, MAX_R);
          const fill = getStatusFill(node.status);
          const isAlarm = node.status === 'STORM' || node.status === 'CRITICAL';

          return (
            <g key={node.node_id}>
              <line
                x1={CX} y1={CY}
                x2={pos.x} y2={pos.y}
                stroke={fill}
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
              {isAlarm && (
                <circle cx={pos.x} cy={pos.y} r="10" fill={fill} fillOpacity="0.15">
                  <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={pos.x} cy={pos.y} r="5" fill={fill} fillOpacity="0.2" />
              <circle cx={pos.x} cy={pos.y} r="3.5" fill={fill} />
              <text
                x={pos.x}
                y={pos.y - 8}
                textAnchor="middle"
                fontSize="7"
                fill={fill}
                fontFamily="monospace"
              >
                {node.node_name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r="6" fill="#22d3ee" />
        <circle cx={CX} cy={CY} r="10" fill="#22d3ee" fillOpacity="0.2" />
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="7" fill="#22d3ee" fontFamily="monospace">YOU</text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-1">
        {nodes.slice(0, 4).map(node => (
          <div key={node.node_id} className="flex items-center gap-1.5 text-[10px] font-mono">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStatusFill(node.status) }}
            />
            <span className="text-slate-400 truncate">{node.node_name.split(' ')[0]}</span>
            <span className={`ml-auto font-semibold ${getNodeStatusColor(node.status)}`}>
              {node.wind_speed_mph.toFixed(0)}mph
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
