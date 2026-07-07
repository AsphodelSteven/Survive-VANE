import { useMemo } from 'react';
import { HistoricalAverage, SensorReading } from '../lib/types';

interface TheCurveProps {
  allHistorical: HistoricalAverage[];
  sensorHistory: SensorReading[];
  currentReading: SensorReading | null;
}

// Moved logic outside to clean up the main component
const pathFromPoints = (pts: { x: number; y: number }[]): string => {
  if (pts.length < 2) return '';
  return pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, '');
};

export function TheCurve({ allHistorical, sensorHistory, currentReading }: TheCurveProps) {
  const { W, H, PAD, plotW, plotH } = { W: 700, H: 200, PAD: { top: 16, right: 20, bottom: 30, left: 42 }, plotW: 638, plotH: 154 };
  
  // Memoized coordinate mapping
  const { toX, toY, todayDoy } = useMemo(() => {
    const doy = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return {
      todayDoy: doy,
      toX: (d: number) => PAD.left + ((d - 1) / 364) * plotW,
      toY: (t: number) => PAD.top + plotH - ((t - 20) / 100) * plotH
    };
  }, []);

  const paths = useMemo(() => {
    const hist = allHistorical.slice(0, 365);
    const highPts = hist.map(d => ({ x: toX(d.day_of_year), y: toY(d.avg_high_f) }));
    const lowPts = hist.map(d => ({ x: toX(d.day_of_year), y: toY(d.avg_low_f) }));
    
    return {
      high: pathFromPoints(highPts),
      low: pathFromPoints(lowPts),
      band: `${pathFromPoints(highPts)} L ${lowPts[lowPts.length-1].x} ${lowPts[lowPts.length-1].y} ${pathFromPoints(lowPts.reverse())} Z`,
      live: pathFromPoints(sensorHistory.slice(0, 60).reverse().map((r, i) => ({
        x: toX(todayDoy) - (60 - i) * 0.8,
        y: toY(r.temp_f_corrected)
      })))
    };
  }, [allHistorical, sensorHistory, todayDoy]);

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
      <h2 className="text-slate-300 text-xs font-mono font-semibold uppercase mb-3">The Curve — Live vs 30-yr Normal</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Gradients */}
        <defs>
          <linearGradient id="bandGrad"><stop stopColor="#f59e0b" stopOpacity="0.12" /></linearGradient>
          <linearGradient id="liveGrad"><stop stopColor="#22d3ee" stopOpacity="0.2" /></linearGradient>
        </defs>
        
        {/* Render Paths */}
        <path d={paths.band} fill="url(#bandGrad)" />
        <path d={paths.high} fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        <path d={paths.low} fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        <path d={paths.live} fill="none" stroke="#22d3ee" strokeWidth="2" />
        
        {/* Live Indicator */}
        {currentReading && (
          <g>
            <circle cx={toX(todayDoy)} cy={toY(currentReading.temp_f_corrected)} r="4" fill="#22d3ee" />
            <text x={toX(todayDoy) + 10} y={toY(currentReading.temp_f_corrected) - 6} className="text-[9px] fill-cyan-400 font-mono font-bold">
              {currentReading.temp_f_corrected.toFixed(1)}°F
            </text>
          </g>
        )}
        {/* Grid Lines */}
        {[20, 40, 60, 80, 100].map(t => (
        <line key={t} x1={PAD.left} y1={toY(t)} x2={W - PAD.right} y2={toY(t)} 
        stroke="#1e293b" strokeWidth="1" />
        ))}

        {/* Today Indicator */}
        <line x1={toX(todayDoy)} y1={PAD.top} x2={toX(todayDoy)} y2={H - PAD.bottom} 
        stroke="#22d3ee" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    </div>
  );
}