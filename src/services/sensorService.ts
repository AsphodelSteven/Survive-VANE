import { SensorReading } from '../lib/types';
import { STATION_CONFIG, ELEVATION_CORRECTION_FACTOR } from '../lib/constants';

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDiurnalOffset(hourOfDay: number): number {
  return Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI) * 8;
}

function getMonthlyBaseTemp(month: number): number {
  const bases = [36, 40.5, 50, 60, 69, 78, 83.5, 81.5, 73.5, 62, 48.5, 38];
  return bases[month - 1] ?? 60;
}

function getMonthlyBasePressure(month: number): number {
  const bases = [999.8, 1000.4, 1000.1, 1000.7, 1001.2, 1001.8, 1001.5, 1001.3, 1001.0, 1001.6, 1000.9, 1000.2];
  return bases[month - 1] ?? 1000;
}

function getMonthlyBaseHumidity(month: number): number {
  const bases = [62, 59, 57, 58, 64, 64, 62, 62, 62, 60, 62, 63];
  return bases[month - 1] ?? 60;
}

function getMonthlyBaseWind(month: number): number {
  const bases = [13.2, 14.1, 15.8, 16.2, 14.9, 13.5, 12.1, 11.8, 12.4, 13.1, 13.8, 13.5];
  return bases[month - 1] ?? 13;
}

export function generateSensorReading(now: Date = new Date()): SensorReading {
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  const minute = now.getMinutes();
  const seed = now.getTime() / 5000;

  const noise = (s: number) => (seededRandom(seed + s) - 0.5) * 2;

  const baseTemp = getMonthlyBaseTemp(month);
  const diurnal = getDiurnalOffset(hour);
  const temp_f_raw = baseTemp + diurnal + noise(1) * 3;
  const elevationTempCorrection = STATION_CONFIG.elevation_ft * ELEVATION_CORRECTION_FACTOR * 5.4;
  const temp_f_corrected = temp_f_raw + elevationTempCorrection;

  const basePressure = getMonthlyBasePressure(month);
  const pressureDiurnal = Math.sin(((hour - 10) / 24) * 2 * Math.PI) * 1.5;
  const pressure_hpa_raw = basePressure + pressureDiurnal + noise(2) * 2;
  const elevationPressureCorrection = (STATION_CONFIG.elevation_ft / 1000) * 34;
  const pressure_hpa_corrected = pressure_hpa_raw + elevationPressureCorrection;

  const baseHumidity = getMonthlyBaseHumidity(month);
  const humidity_pct = Math.min(100, Math.max(10, baseHumidity + noise(3) * 8 - diurnal * 0.5));

  const eco2_ppm = Math.round(400 + seededRandom(seed + 4) * 200 + humidity_pct * 2);
  const tvoc_ppb = Math.round(50 + seededRandom(seed + 5) * 150);

  const baseWind = getMonthlyBaseWind(month);
  const windMultiplier = 0.7 + seededRandom(seed + 6) * 0.8;
  const wind_speed_mph = Math.max(0, baseWind * windMultiplier + noise(7) * 3);
  const wind_gust_mph = wind_speed_mph * (1.3 + seededRandom(seed + 8) * 0.4);
  const wind_direction_deg = Math.round((seededRandom(seed + 9) * 360 + minute) % 360);

  const rain_in_hr = seededRandom(seed + 10) < 0.05 ? seededRandom(seed + 11) * 0.3 : 0;

  return {
    station_id: STATION_CONFIG.id,
    recorded_at: now.toISOString(),
    temp_f_raw: Math.round(temp_f_raw * 10) / 10,
    temp_f_corrected: Math.round(temp_f_corrected * 10) / 10,
    pressure_hpa_raw: Math.round(pressure_hpa_raw * 10) / 10,
    pressure_hpa_corrected: Math.round(pressure_hpa_corrected * 10) / 10,
    humidity_pct: Math.round(humidity_pct * 10) / 10,
    eco2_ppm,
    tvoc_ppb,
    wind_speed_mph: Math.round(wind_speed_mph * 10) / 10,
    wind_direction_deg,
    wind_gust_mph: Math.round(wind_gust_mph * 10) / 10,
    rain_in_hr: Math.round(rain_in_hr * 1000) / 1000,
    sensor_source: 'BME280+SGP30+ADC',
  };
}

export function getWindDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(degrees / 22.5) % 16;
  return dirs[idx];
}

export function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9;
}
