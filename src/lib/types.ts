export interface SensorReading {
  id?: string;
  station_id: string;
  recorded_at: string;
  temp_f_raw: number;
  temp_f_corrected: number;
  pressure_hpa_raw: number;
  pressure_hpa_corrected: number;
  humidity_pct: number;
  eco2_ppm: number;
  tvoc_ppb: number;
  wind_speed_mph: number;
  wind_direction_deg: number;
  wind_gust_mph: number;
  rain_in_hr: number;
  sensor_source: string;
}

export interface HistoricalAverage {
  id?: string;
  station_id: string;
  month: number;
  day_of_year: number;
  day_of_month: number;
  avg_high_f: number;
  avg_low_f: number;
  avg_mean_f: number;
  avg_pressure_hpa: number;
  avg_humidity_pct: number;
  avg_wind_speed_mph: number;
  avg_precip_in: number;
  record_high_f: number;
  record_low_f: number;
}

export interface ResearchLog {
  id?: string;
  station_id: string;
  logged_at: string;
  resolution_min: 1 | 15 | 60;
  temp_f_raw: number;
  temp_f_corrected: number;
  pressure_hpa_raw: number;
  pressure_hpa_corrected: number;
  humidity_pct: number;
  eco2_ppm: number;
  tvoc_ppb: number;
  wind_speed_mph: number;
  wind_direction_deg: number;
  wind_gust_mph: number;
  rain_in_hr: number;
  anomaly_score_temp: number;
  anomaly_score_pressure: number;
  anomaly_score_humidity: number;
  notes?: string;
}

export interface MeshNode {
  id?: string;
  node_id: string;
  node_name: string;
  bearing_deg: number;
  distance_miles: number;
  last_seen: string | null;
  status: 'ONLINE' | 'OFFLINE' | 'CRITICAL' | 'STORM';
  wind_speed_mph: number;
  wind_direction_deg: number;
  pressure_hpa: number;
  temp_f: number;
  general_condition: string;
  is_allied: boolean;
}

export interface FluxSignal {
  id?: string;
  signal_type: 'LOW_POWER' | 'NORMAL_POWER' | 'solar_reduction_prediction' | 'flood_preemption_trigger' | 'DEMAND_RESPONSE';
  payload: Record<string, unknown>;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  acknowledged: boolean;
  received_at: string;
  expires_at: string | null;
  source: string;
}

export interface AnomalyScores {
  temp: number;
  pressure: number;
  humidity: number;
  wind: number;
  overall: number;
}

export interface StormCountdown {
  nodeId: string;
  nodeName: string;
  distanceMiles: number;
  windSpeedMph: number;
  eta_minutes: number;
  bearing: number;
}

export type PowerState = 'NORMAL' | 'LOW_POWER' | 'CRITICAL_POWER';

export interface AppState {
  ambassadorMode: boolean;
  powerState: PowerState;
  loggingActive: boolean;
  stationId: string;
  elevation_ft: number;
}
