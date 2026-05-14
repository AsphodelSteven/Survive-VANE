import { SensorReading, HistoricalAverage, AnomalyScores } from '../lib/types';

export function calculateAnomalyScores(
  reading: SensorReading,
  historical: HistoricalAverage | null
): AnomalyScores {
  if (!historical) {
    return { temp: 0, pressure: 0, humidity: 0, wind: 0, overall: 0 };
  }

  const tempDiff = reading.temp_f_corrected - historical.avg_mean_f;
  const tempRange = (historical.avg_high_f - historical.avg_low_f) / 2 || 10;
  const tempScore = tempDiff / tempRange;

  const pressureDiff = reading.pressure_hpa_corrected - historical.avg_pressure_hpa;
  const pressureScore = pressureDiff / 5;

  const humidityDiff = reading.humidity_pct - historical.avg_humidity_pct;
  const humidityScore = humidityDiff / 15;

  const windDiff = reading.wind_speed_mph - historical.avg_wind_speed_mph;
  const windScore = windDiff / 8;

  const overall = (Math.abs(tempScore) + Math.abs(pressureScore) + Math.abs(humidityScore) + Math.abs(windScore)) / 4;

  return {
    temp: Math.round(tempScore * 100) / 100,
    pressure: Math.round(pressureScore * 100) / 100,
    humidity: Math.round(humidityScore * 100) / 100,
    wind: Math.round(windScore * 100) / 100,
    overall: Math.round(overall * 100) / 100,
  };
}

export function formatAnomalyLabel(score: number, unit: string, diff: number): string {
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}${unit} (${score >= 0 ? '+' : ''}${score.toFixed(2)}σ)`;
}

export function getAnomalyColor(score: number): string {
  const abs = Math.abs(score);
  if (abs < 1) return 'text-emerald-400';
  if (abs < 2) return 'text-amber-400';
  if (abs < 3) return 'text-orange-400';
  return 'text-red-400';
}

export function getAnomalySeverity(score: number): 'normal' | 'warning' | 'critical' {
  const abs = Math.abs(score);
  if (abs < 2) return 'normal';
  if (abs < 4) return 'warning';
  return 'critical';
}

export function getTempAnomaly(reading: SensorReading, historical: HistoricalAverage): string {
  const diff = reading.temp_f_corrected - historical.avg_mean_f;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}°F vs 30-yr mean`;
}

export function getPressureAnomaly(reading: SensorReading, historical: HistoricalAverage): string {
  const diff = reading.pressure_hpa_corrected - historical.avg_pressure_hpa;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} hPa vs 30-yr mean`;
}
