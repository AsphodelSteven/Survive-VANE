// Figure out where communicated info and internet data go, or if a switch-case style structure can handle multi-form/format

// Define data sources
export enum DataSource {
  LOCAL_SENSOR = 'LOCAL',
  OPEN_METEO = 'OPEN_METEO',
  NWS = 'NWS'
}

const getOpenMeteoData = async (coords: { lat: number; lon: number }) => {
  // Logic for Open-Meteo
  return { source: 'OPEN_METEO', data: {} }; 
};

const getNWSData = async (coords: { lat: number; lon: number }) => {
  // Logic for NWS
  return { source: 'NWS', data: {} };
};

const getLocalSensorData = async () => {
  // Logic for rtl_433 (eventually)
  return { source: 'LOCAL', data: {} };
};

export const fetchAPIWeatherData = async (source: DataSource, coords: {lat: number, lon: number}) => {
  switch (source) {
    case DataSource.OPEN_METEO:
      // Perform  fetch to api.open-meteo.com
      return await getOpenMeteoData(coords);
    case DataSource.NWS:
      // Perform  fetch to api.weather.gov
      return await getNWSData(coords);
    case DataSource.LOCAL_SENSOR:
      // This will later be fed by rtl_433 JSON stream
      return await getLocalSensorData();
    default:
      throw new Error("Source not implemented");
  }
};

export const processHistoricalImport = async (state: string, timeRange: {start: Date, end: Date}) => {
  switch (state.toUpperCase()) {
    case 'FL':
      const data = await fetchFromStorage('archives/se-usa/florida.zip');
      return extractAndFormat(data, timeRange);
    case 'GA':
      // Same logic, different file
      return extractAndFormat(await fetchFromStorage('archives/se-usa/georgia.zip'), timeRange);
    default:
      throw new Error("Dataset not available or archived.");
  }
};

export const startNWSPolling = (
  coords: { lat: number; lon: number }, 
  callback: (data: any) => void
) => {
  const NWS_POLL_INTERVAL = 600000; // 10 minutes (NWS data doesn't change second-by-second)

  // Initial fetch
  getNWSData(coords).then(callback);

  // Set interval loop
  return setInterval(async () => {
    const data = await getNWSDataNWS(coords);
    callback(data);
  }, NWS_POLL_INTERVAL);
};

const fetchNWS = async (coords: { lat: number; lon: number }) => {
  // Logic to fetch from api.weather.gov/points/{lat},{lon}
  // Followed by fetching the forecast grid URL provided in the response
};