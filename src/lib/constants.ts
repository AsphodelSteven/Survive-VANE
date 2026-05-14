export const STATION_CONFIG = {
  id: 'VANE-PERRY-01',
  name: 'Perry Sentinel Station',
  elevation_ft: 1001,
  sensor_height_m: 2.0,
  sensor_exposure: 'OPEN_FIELD',
  anemometer_model: 'ADC-WIND-V2',
  bme280_version: 'I2C-0x76',
  sgp30_version: 'I2C-0x58',
  lat_obfuscated: '36.2°N',
  lon_obfuscated: '97.2°W',
  region: 'North-Central Oklahoma',
};

export const ELEVATION_CORRECTION_FACTOR = 0.0012;

export const THRESHOLDS = {
  wind_critical_mph: 40,
  pressure_storm_hpa: 1000,
  pressure_drop_severe_hpa: 5,
  eco2_unhealthy_ppm: 1500,
  tvoc_unhealthy_ppb: 500,
  temp_heat_warning_f: 100,
  temp_freeze_warning_f: 32,
  anomaly_warning: 2.0,
  anomaly_critical: 4.0,
};

export const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export const LOG_INTERVALS = {
  ONE_MIN: 1,
  FIFTEEN_MIN: 15,
  SIXTY_MIN: 60,
};

export const FLUX_ENDPOINT = '/api/flux/handshake';

export const MESH_GOSSIP_INTERVAL_MS = 30000;
export const SENSOR_POLL_INTERVAL_MS = 5000;
export const RESEARCH_LOG_INTERVAL_MS = 60000;
