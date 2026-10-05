import fs from 'fs';
import path from 'path';
import { ScientificObservation, Station, VerticalProfile } from '../types/observation.ts';

export class IcosDataPipeline {
  private static CACHE_DIR = path.resolve(process.cwd(), 'cache', 'icos');
  private static inMemoryCache: Map<string, any> = new Map();

  private static loadIcosJson(): Record<string, { station: Station; observations: any[] }> {
    const filePath = path.join(this.CACHE_DIR, 'icos_stations_data.json');
    if (fs.existsSync(filePath)) {
      const text = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(text);
    }
    return {};
  }

  public static getStations(): Station[] {
    const data = this.loadIcosJson();
    return Object.values(data).map(item => item.station);
  }

  public static getStationObservations(stationCode: string): ScientificObservation[] {
    const code = stationCode.toUpperCase();
    const data = this.loadIcosJson();
    const stationData = data[code];
    if (!stationData) return [];

    const station = stationData.station;
    return stationData.observations.map((obs, idx) => ({
      id: `icos-${code}-${obs.timestamp}-${idx}`,
      source: 'ICOS Carbon Portal',
      dataset: station.provenance.dataset,
      category: 'MEASURED',
      timestamp: obs.timestamp,
      latitude: station.latitude,
      longitude: station.longitude,
      altitude: station.altitude,
      variable: 'co2_surface_weekly',
      value: obs.value,
      unit: 'ppm',
      uncertainty: obs.uncertainty || 0.08,
      qualityFlag: '0',
      provenance: station.provenance
    }));
  }

  public static getFileAudit() {
    const filePath = path.join(this.CACHE_DIR, 'icos_stations_data.json');
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    const data = this.loadIcosJson();
    const totalRecords = Object.values(data).reduce((acc, curr) => acc + curr.observations.length, 0);

    return {
      filename: 'icos_stations_data.json',
      source: 'ICOS Carbon Portal Level 2 Official Release',
      license: 'CC-BY-4.0',
      sizeBytes: stat.size,
      lastModified: stat.mtime.toISOString(),
      stations: Object.keys(data),
      totalRecords
    };
  }
}
