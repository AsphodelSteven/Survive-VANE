import { ResearchLog } from '../lib/types';
import { STATION_CONFIG } from '../lib/constants';

const STATION_METADATA = {
  station_id: STATION_CONFIG.id,
  station_name: STATION_CONFIG.name,
  sensor_height_m: STATION_CONFIG.sensor_height_m,
  exposure: STATION_CONFIG.sensor_exposure,
  elevation_ft: STATION_CONFIG.elevation_ft,
  bme280: STATION_CONFIG.bme280_version,
  sgp30: STATION_CONFIG.sgp30_version,
  anemometer: STATION_CONFIG.anemometer_model,
  lat: STATION_CONFIG.lat_obfuscated,
  lon: STATION_CONFIG.lon_obfuscated,
  region: STATION_CONFIG.region,
  data_standard: 'VANE-CS-1.0',
};

export function exportToCSV(logs: ResearchLog[]): string {
  const metaRows = Object.entries(STATION_METADATA)
    .map(([k, v]) => `# ${k}: ${v}`)
    .join('\n');

  const headers = [
    'logged_at', 'resolution_min',
    'temp_f_raw', 'temp_f_corrected',
    'pressure_hpa_raw', 'pressure_hpa_corrected',
    'humidity_pct', 'eco2_ppm', 'tvoc_ppb',
    'wind_speed_mph', 'wind_direction_deg', 'wind_gust_mph',
    'rain_in_hr',
    'anomaly_score_temp', 'anomaly_score_pressure', 'anomaly_score_humidity',
  ].join(',');

  const rows = logs.map(log => [
    log.logged_at,
    log.resolution_min,
    log.temp_f_raw,
    log.temp_f_corrected,
    log.pressure_hpa_raw,
    log.pressure_hpa_corrected,
    log.humidity_pct,
    log.eco2_ppm,
    log.tvoc_ppb,
    log.wind_speed_mph,
    log.wind_direction_deg,
    log.wind_gust_mph,
    log.rain_in_hr,
    log.anomaly_score_temp,
    log.anomaly_score_pressure,
    log.anomaly_score_humidity,
  ].join(',')).join('\n');

  return `${metaRows}\n${headers}\n${rows}`;
}

export function exportToJSON(logs: ResearchLog[]): string {
  return JSON.stringify({
    metadata: STATION_METADATA,
    export_at: new Date().toISOString(),
    record_count: logs.length,
    data: logs,
  }, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
