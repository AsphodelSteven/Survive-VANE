import { Radio, RadioTower, Shield } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

interface AmbassadorToggleProps {
  enabled: boolean;
  gossipCount: number;
  nodeCount: number;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
}

export function AmbassadorToggle({ enabled, gossipCount, nodeCount, onToggle, disabled }: AmbassadorToggleProps) {
  return (
    <Card className={cn(
      "p-4 transition-all",
      enabled ? "border-cyan-400/40 bg-cyan-400/5" : "border-slate-700 bg-slate-800/40"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RadioTower className={`w-4 h-4 ${enabled ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span className="text-slate-300 text-xs font-mono font-semibold uppercase tracking-widest">
            Ambassador Mode
          </span>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={onToggle} 
          disabled={disabled} 
        />
      </div>

      {disabled && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400/80 mb-2">
          <Shield className="w-3 h-3" />
          Suspended: LOW_POWER mode active
        </div>
      )}

      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Status</span>
          <Badge variant={enabled ? "default" : "secondary"} className="text-[10px]">
            {enabled ? 'GOSSIPING' : 'SILENT'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Allied Nodes</span>
          <span className={enabled ? 'text-white' : 'text-slate-600'}>{enabled ? nodeCount : '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Gossip Cycles</span>
          <span className={enabled ? 'text-white' : 'text-slate-600'}>{enabled ? gossipCount : '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Broadcast</span>
          <span className={`${enabled ? 'text-emerald-400' : 'text-slate-600'}`}>
            {enabled ? 'GENERAL PKT ONLY' : 'NONE'}
          </span>
        </div>
      </div>

      {enabled && (
        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          Broadcasting general weather packets. Coordinates & power metrics excluded.
        </div>
      )}
    </Card>
  );
}
