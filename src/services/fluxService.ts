import { SensorReading, FluxSignal } from '../lib/types';
import { THRESHOLDS, STATION_CONFIG } from '../lib/constants';

export function buildFluxPacket(reading: SensorReading): Record<string, unknown> {
  const packets: Record<string, unknown>[] = [];

  if (reading.wind_speed_mph > THRESHOLDS.wind_critical_mph) {
    packets.push({
      type: 'solar_reduction_prediction',
      confidence: 0.87,
      wind_speed_mph: reading.wind_speed_mph,
      reduction_pct: Math.min(95, reading.wind_speed_mph * 1.8),
      station_id: STATION_CONFIG.id,
      triggered_at: new Date().toISOString(),
    });
  }

  if (reading.pressure_hpa_corrected < THRESHOLDS.pressure_storm_hpa) {
    const severity = reading.pressure_hpa_corrected < 995 ? 'HIGH' : 'MODERATE';
    packets.push({
      type: 'flood_preemption_trigger',
      pressure_hpa: reading.pressure_hpa_corrected,
      severity,
      rain_rate_in_hr: reading.rain_in_hr,
      station_id: STATION_CONFIG.id,
      triggered_at: new Date().toISOString(),
    });
  }

  return { packets, station_id: STATION_CONFIG.id, timestamp: new Date().toISOString() };
}

export function interpretFluxSignal(signal: FluxSignal): string {
  switch (signal.signal_type) {
    case 'LOW_POWER':
      return 'FLUX reports low power — UI and Ambassador broadcast suspended.';
    case 'NORMAL_POWER':
      return 'FLUX power restored — resuming full operation.';
    case 'solar_reduction_prediction':
      return `Solar reduction predicted: ${(signal.payload as { reduction_pct?: number }).reduction_pct ?? '?'}%`;
    case 'flood_preemption_trigger':
      return `Flood preemption triggered — severity: ${(signal.payload as { severity?: string }).severity ?? 'UNKNOWN'}`;
    case 'DEMAND_RESPONSE':
      return 'FLUX demand response event active.';
    default:
      return 'Unknown FLUX signal.';
  }
}

export function getFluxSeverityColor(severity: FluxSignal['severity']): string {
  switch (severity) {
    case 'CRITICAL': return 'text-red-400 border-red-400/40 bg-red-400/10';
    case 'WARN': return 'text-amber-400 border-amber-400/40 bg-amber-400/10';
    default: return 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10';
  }
}
