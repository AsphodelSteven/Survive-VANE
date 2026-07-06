// Figure out where communicated info and internet data go, or if a switch-case style structure can handle multi-form/format
import { createClient } from '@supabase/supabase-js'; // Once client initialized
import JSZip from 'jszip';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const fetchFromStorage = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('weather-archives') // bucket zip name
    .download(path);

  if (error) throw error;
  return data; // Returns a Blob
};

const extractAndFormat = async (blob: Blob, timeRange: {start: Date, end: Date}) => {
  const zip = await JSZip.loadAsync(blob);
  // Assuming a standard CSV format inside the zip
  const csvFile = zip.file(/.*\.csv/)[0]; 
  const text = await csvFile.async('string');
  
  // Basic parsing logic (Replace this with a proper CSV parser like PapaParse)
  const rows = text.split('\n');
  return rows.filter(row => {
    // Filter by date range for AI training slice
    // Logic: if date >= timeRange.start && date <= timeRange.end
    return true; 
  });
};

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

export const startPolling = (
  fetcher: () => Promise<any>, // The specific API fetch logic
  callback: (data: any) => void,
  intervalMs: number = 600000 // Default to 10 mins
) => {
  // Initial fire
  fetcher().then(callback);

  // Set interval
  return setInterval(async () => {
    const data = await fetcher();
    callback(data);
  }, intervalMs);
};

// NWS:
const nwsFetcher = () => getNWSData({ lat: 29.0, lon: -82.0 });
const nwsPoller = startPolling(nwsFetcher, (data) => console.log('NWS Update:', data), 600000);

// Open-Meteo:
const meteoFetcher = () => getOpenMeteoData({ lat: 29.0, lon: -82.0 });
const meteoPoller = startPolling(meteoFetcher, (data) => console.log('Meteo Update:', data), 300000);