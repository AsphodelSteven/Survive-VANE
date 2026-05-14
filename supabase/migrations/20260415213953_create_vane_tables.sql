
/*
  # VANE - Versatile Atmospheric Network Explorer Schema

  ## Tables Created

  ### sensor_readings
  Real-time ingested sensor data from BME280, SGP30, and ADC sensors.
  Fields: temperature, pressure, humidity, air quality (eCO2/TVOC), wind speed/direction, raw vs corrected values.

  ### historical_averages
  30-year climatological baseline (Perry Station).
  Keyed by month (1-12) and day-of-year (1-365).
  Stores mean temp, pressure, humidity, wind speed for comparison.

  ### research_logs
  Multi-resolution research logs at 1min, 15min, and 60min intervals.
  Stores raw AND elevation-corrected values for citizen science export.

  ### mesh_nodes
  Allied VANE nodes registered in the Ambassador gossip network.
  Stores approximate bearing/distance, last seen, and status.

  ### flux_signals
  Incoming signals from the FLUX substation.
  Tracks LOW_POWER alerts, solar_reduction_predictions, flood_preemption_triggers.

  ## Security
  RLS enabled on all tables with authenticated-user policies.
*/

CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id text NOT NULL DEFAULT 'VANE-PERRY-01',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  temp_f_raw numeric(6,2),
  temp_f_corrected numeric(6,2),
  pressure_hpa_raw numeric(8,2),
  pressure_hpa_corrected numeric(8,2),
  humidity_pct numeric(5,2),
  eco2_ppm integer,
  tvoc_ppb integer,
  wind_speed_mph numeric(5,2),
  wind_direction_deg integer,
  wind_gust_mph numeric(5,2),
  rain_in_hr numeric(5,3) DEFAULT 0,
  sensor_source text DEFAULT 'SIMULATED',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sensor readings"
  ON sensor_readings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sensor readings"
  ON sensor_readings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS historical_averages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id text NOT NULL DEFAULT 'VANE-PERRY-01',
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  day_of_year integer NOT NULL CHECK (day_of_year BETWEEN 1 AND 366),
  day_of_month integer NOT NULL,
  avg_high_f numeric(5,2),
  avg_low_f numeric(5,2),
  avg_mean_f numeric(5,2),
  avg_pressure_hpa numeric(7,2),
  avg_humidity_pct numeric(5,2),
  avg_wind_speed_mph numeric(5,2),
  avg_precip_in numeric(5,3),
  record_high_f numeric(5,2),
  record_low_f numeric(5,2),
  data_source text DEFAULT 'NOAA-30YR-NORMAL',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historical_averages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read historical averages"
  ON historical_averages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert historical averages"
  ON historical_averages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS research_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id text NOT NULL DEFAULT 'VANE-PERRY-01',
  logged_at timestamptz NOT NULL DEFAULT now(),
  resolution_min integer NOT NULL CHECK (resolution_min IN (1, 15, 60)),
  temp_f_raw numeric(6,2),
  temp_f_corrected numeric(6,2),
  pressure_hpa_raw numeric(8,2),
  pressure_hpa_corrected numeric(8,2),
  humidity_pct numeric(5,2),
  eco2_ppm integer,
  tvoc_ppb integer,
  wind_speed_mph numeric(5,2),
  wind_direction_deg integer,
  wind_gust_mph numeric(5,2),
  rain_in_hr numeric(5,3) DEFAULT 0,
  anomaly_score_temp numeric(5,2),
  anomaly_score_pressure numeric(5,2),
  anomaly_score_humidity numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read research logs"
  ON research_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert research logs"
  ON research_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS mesh_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL UNIQUE,
  node_name text NOT NULL,
  bearing_deg integer,
  distance_miles numeric(6,1),
  last_seen timestamptz,
  status text DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'CRITICAL', 'STORM')),
  wind_speed_mph numeric(5,2),
  wind_direction_deg integer,
  pressure_hpa numeric(7,2),
  temp_f numeric(6,2),
  general_condition text,
  is_allied boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mesh_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mesh nodes"
  ON mesh_nodes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert mesh nodes"
  ON mesh_nodes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mesh nodes"
  ON mesh_nodes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS flux_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL CHECK (signal_type IN ('LOW_POWER', 'NORMAL_POWER', 'solar_reduction_prediction', 'flood_preemption_trigger', 'DEMAND_RESPONSE')),
  payload jsonb DEFAULT '{}',
  severity text DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARN', 'CRITICAL')),
  acknowledged boolean DEFAULT false,
  received_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  source text DEFAULT 'FLUX-SUBSTATION'
);

ALTER TABLE flux_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read flux signals"
  ON flux_signals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert flux signals"
  ON flux_signals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update flux signals"
  ON flux_signals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_logs_logged_at ON research_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_logs_resolution ON research_logs(resolution_min, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_historical_averages_month_doy ON historical_averages(month, day_of_year);
CREATE INDEX IF NOT EXISTS idx_flux_signals_received_at ON flux_signals(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_flux_signals_type ON flux_signals(signal_type, acknowledged);
