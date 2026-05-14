import { HistoricalAverage, SensorReading } from '../lib/types';
import { useMemo } from 'react';

interface TheCurveProps {
  allHistorical: HistoricalAverage[];
  sensorHistory: SensorReading[];
  currentReading: SensorReading | null;
}

function pathFromPoints(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  return points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, '');
}

export function TheCurve({ allHistorical, sensorHistory, currentReading }: TheCurveProps) {
  const W = 700;
  const H = 200;
  const PAD = { top: 16, right: 20, bottom: 30, left: 42 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const now = new Date();
  const todayDoy = useMemo(() => {
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now.getTime() - start.getTime()) / 86400000);
  }, []);

  const historical = useMemo(() => {
    if (!allHistorical.length) return [];
    return allHistorical.slice(0, 365);
  }, [allHistorical]);

  const minTemp = 20;
  const maxTemp = 120;
  const tempRange = maxTemp - minTemp;

  const toX = (doy: number) => PAD.left + ((doy - 1) / 364) * plotW;
  const toY = (temp: number) => PAD.top + plotH - ((temp - minTemp) / tempRange) * plotH;

  const highPath = useMemo(() => {
    const pts = historical.map(d => ({ x: toX(d.day_of_year), y: toY(d.avg_high_f) }));
    return pathFromPoints(pts);
  }, [historical]);

  const lowPath = useMemo(() => {
    const pts = historical.map(d => ({ x: toX(d.day_of_year), y: toY(d.avg_low_f) }));
    return pathFromPoints(pts);
  }, [historical]);

  const bandPath = useMemo(() => {
    if (!historical.length) return '';
    const highPts = historical.map(d => ({ x: toX(d.day_of_year), y: toY(d.avg_high_f) }));
    const lowPts = [...historical].reverse().map(d => ({ x: toX(d.day_of_year), y: toY(d.avg_low_f) }));
    const high = highPts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = highPts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    }, '');
    const low = lowPts.reduce((acc, p, i) => {
      if (i === 0) return `${high} L ${p.x} ${p.y}`;
      const prev = lowPts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    }, high);
    return `${low} Z`;
  }, [historical]);

  const livePath = useMemo(() => {
    const pts = sensorHistory
      .slice(0, 60)
      .reverse()
      .map((r, i) => ({
        x: toX(todayDoy) - (60 - i) * 0.8,
        y: toY(r.temp_f_corrected),
      }));
    return pathFromPoints(pts);
  }, [sensorHistory, todayDoy]);

  const todayX = toX(todayDoy);
  const currentY = currentReading ? toY(currentReading.temp_f_corrected) : null;

  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const monthStartDoys = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-300 text-xs font-mono font-semibold uppercase tracking-widest">
          The Curve — Live vs 30-yr Normal
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-amber-400/40 inline-block" />
            <span className="text-slate-500">Normal Band</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-slate-500">Live</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="liveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
          </linearGradient>
        </defs>

        {[20, 40, 60, 80, 100].map(t => (
          <g key={t}>
            <line
              x1={PAD.left} y1={toY(t)}
              x2={W - PAD.right} y2={toY(t)}
              stroke="#1e293b" strokeWidth="1"
            />
            <text x={PAD.left - 4} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#475569" fontFamily="monospace">
              {t}
            </text>
          </g>
        ))}

        {monthStartDoys.map((doy, i) => (
          <g key={i}>
            <line
              x1={toX(doy)} y1={PAD.top}
              x2={toX(doy)} y2={H - PAD.bottom + 4}
              stroke="#1e293b" strokeWidth="1"
            />
            <text
              x={toX(doy) + 10}
              y={H - PAD.bottom + 12}
              fontSize="8" fill="#475569" fontFamily="monospace"
            >
              {months[i]}
            </text>
          </g>
        ))}

        {bandPath && (
          <path d={bandPath} fill="url(#bandGrad)" />
        )}

        {highPath && (
          <path d={highPath} fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        )}
        {lowPath && (
          <path d={lowPath} fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        )}

        <line
          x1={todayX} y1={PAD.top}
          x2={todayX} y2={H - PAD.bottom}
          stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3,3"
        />

        {livePath && (
          <path d={livePath} fill="none" stroke="url(#liveGrad)" strokeWidth="2" strokeLinecap="round" />
        )}

        {currentY !== null && (
          <g>
            <circle cx={todayX} cy={currentY} r="4" fill="#22d3ee" />
            <circle cx={todayX} cy={currentY} r="8" fill="#22d3ee" fillOpacity="0.2" />
            <text x={todayX + 10} y={currentY - 6} fontSize="9" fill="#22d3ee" fontFamily="monospace" fontWeight="bold">
              {currentReading!.temp_f_corrected.toFixed(1)}°F
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
