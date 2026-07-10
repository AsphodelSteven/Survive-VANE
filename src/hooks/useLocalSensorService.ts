import { SensorReading } from "../lib/types";

export const fetchLocalRadioData = async (): Promise<SensorReading | null> => {
  try {
    // This points to the file being updated by rtl_433
    const response = await fetch('/sensor_data.json?t=' + Date.now()); 
    const text = await response.text();
    const lines = text.trim().split('\n');
    const latest = JSON.parse(lines[lines.length - 1]);
    
    // Whitelist filter (as discussed)
    if (latest.model === "Vevor-7in1") {
      return {
        station_id: latest.id || "vevor-01",
        recorded_at: new Date(latest.time).toISOString(),
        temp_f_raw: (latest.temperature_C * 9/5) + 32, // Convert C to F
        temp_f_corrected: (latest.temperature_C * 9/5) + 32,
        pressure_hpa_raw: latest.pressure_hPa || 0,
        pressure_hpa_corrected: latest.pressure_hPa || 0,
        humidity_pct: latest.humidity,
        eco2_ppm: 0, // Vevor doesn't provide this, use 0 or null
        tvoc_ppb: 0, // Vevor doesn't provide this
        wind_speed_mph: latest.wind_avg_km_h * 0.621371, // Convert km/h to mph
        wind_direction_deg: latest.wind_dir_deg || 0,
        wind_gust_mph: latest.wind_max_km_h * 0.621371,
        rain_in_hr: latest.rain_mm * 0.0393701, // Convert mm to in
        sensor_source: 'LOCAL'
    };
  }
    return null;
  } catch (e) {
    console.warn("Radio data not ready or malformed");
    return null;
  }
};