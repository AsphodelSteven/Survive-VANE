import { MeshNode, StormCountdown } from '../lib/types';
import { THRESHOLDS } from '../lib/constants';

export function calculateStormCountdowns(nodes: MeshNode[]): StormCountdown[] {
  const countdowns: StormCountdown[] = [];

  for (const node of nodes) {
    if (!node.is_allied) continue;
    if (node.wind_speed_mph < THRESHOLDS.wind_critical_mph) continue;

    const bearingDeg = node.bearing_deg;
    const isUpwind = bearingDeg >= 225 && bearingDeg <= 315;

    if (!isUpwind) continue;

    const avgWindMph = node.wind_speed_mph;
    if (avgWindMph <= 0) continue;

    const travelHours = node.distance_miles / avgWindMph;
    const eta_minutes = Math.round(travelHours * 60);

    countdowns.push({
      nodeId: node.node_id,
      nodeName: node.node_name,
      distanceMiles: node.distance_miles,
      windSpeedMph: node.wind_speed_mph,
      eta_minutes,
      bearing: bearingDeg,
    });
  }

  return countdowns.sort((a, b) => a.eta_minutes - b.eta_minutes);
}

export function buildGeneralPacket(reading: {
  temp_f_corrected: number;
  pressure_hpa_corrected: number;
  humidity_pct: number;
  wind_speed_mph: number;
  wind_direction_deg: number;
  wind_gust_mph: number;
}) {
  return {
    temp_f: reading.temp_f_corrected,
    pressure_hpa: reading.pressure_hpa_corrected,
    humidity_pct: reading.humidity_pct,
    wind_speed_mph: reading.wind_speed_mph,
    wind_direction_deg: reading.wind_direction_deg,
    wind_gust_mph: reading.wind_gust_mph,
    broadcast_at: new Date().toISOString(),
  };
}

export function getNodeStatusColor(status: MeshNode['status']): string {
  switch (status) {
    case 'ONLINE': return 'text-emerald-400';
    case 'CRITICAL': return 'text-orange-400';
    case 'STORM': return 'text-red-400';
    default: return 'text-slate-500';
  }
}

export function getNodeStatusBg(status: MeshNode['status']): string {
  switch (status) {
    case 'ONLINE': return 'bg-emerald-400/10 border-emerald-400/30';
    case 'CRITICAL': return 'bg-orange-400/10 border-orange-400/30';
    case 'STORM': return 'bg-red-400/10 border-red-400/30';
    default: return 'bg-slate-800/50 border-slate-700';
  }
}

export function bearingToCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}
