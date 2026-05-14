import { Zap, ZapOff, AlertTriangle } from 'lucide-react';
import { PowerState } from '../lib/types';

interface PowerAlertProps {
  powerState: PowerState;
  onRestore: () => void;
}

export function PowerAlert({ powerState, onRestore }: PowerAlertProps) {
  if (powerState === 'NORMAL') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl border border-amber-400/60 bg-slate-900/95 backdrop-blur rounded-lg p-4 shadow-2xl shadow-amber-400/10">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center animate-pulse">
              <ZapOff className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-mono text-sm font-semibold tracking-widest uppercase">
              FLUX: LOW_POWER Signal Received
            </p>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              UI display and Ambassador broadcast suspended. Local logging only. Conserving Joules.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-400/40 bg-emerald-400/10 rounded hover:bg-emerald-400/20 transition-colors"
            >
              <Zap className="w-3 h-3" />
              RESTORE
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-400/60" />
          <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-[12%] bg-amber-400 rounded-full" />
          </div>
          <span className="text-amber-400/80 text-xs font-mono">12% BATTERY</span>
        </div>
      </div>
    </div>
  );
}
