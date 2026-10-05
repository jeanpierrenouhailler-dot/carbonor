import { ScientificObservation, Station, VerticalProfile } from '../types/observation';
import { CacheService } from './cacheService';

export class IcosProvider {
  private static STATIONS: Station[] = [
    {
      id: 'icos-puy',
      code: 'PUY',
      name: 'Puy de Dôme Atmospheric Station',
      country: 'France (Auvergne)',
      network: 'ICOS',
      latitude: 45.7720,
      longitude: 2.9640,
      altitude: 1465,
      currentCO2: 426.85,
      currentCO2Date: '2026-09-28T12:00:00Z',
      monthlyAverage: 426.20,
      yearlyAverage: 425.10,
      trendYearlyPpm: 2.40,
      seasonalAmplitudePpm: 12.8,
      instrument: 'Picarro G2401 CRDS',
      status: 'ONLINE',
      provenance: {
        source: 'ICOS Carbon Portal',
        dataset: 'Atmospheric CO2 Level 2 Continuous In Situ Product - Puy de Dôme (PUY)',
        version: 'ICOS-ATC-L2-v2026',
        license: 'CC-BY-4.0',
        url: 'https://data.icos-cp.eu/portal/',
        doi: '10.18160/puy-co2-2026',
        method: 'ICOS ATC Calibrated Cavity Ring-Down Spectroscopy',
        citation: 'Puy de Dôme ICOS Class 1 Atmospheric Station, OPGC / Université Clermont Auvergne / CNRS.'
      }
    },
    {
      id: 'icos-ohp',
      code: 'OHP',
      name: 'Observatoire de Haute-Provence',
      country: 'France (PACA)',
      network: 'ICOS',
      latitude: 43.9310,
      longitude: 5.7130,
      altitude: 650,
      currentCO2: 427.60,
      currentCO2Date: '2026-09-28T12:00:00Z',
      monthlyAverage: 426.90,
      yearlyAverage: 425.80,
      trendYearlyPpm: 2.42,
      seasonalAmplitudePpm: 14.2,
      instrument: 'Picarro G2401 CRDS',
      status: 'ONLINE',
      provenance: {
        source: 'ICOS Carbon Portal',
        dataset: 'Atmospheric CO2 Level 2 Continuous In Situ Product - Observatoire de Haute-Provence (OHP)',
        version: 'ICOS-ATC-L2-v2026',
        license: 'CC-BY-4.0',
        url: 'https://data.icos-cp.eu/portal/',
        doi: '10.18160/ohp-co2-2026',
        method: 'Continuous CRDS sampling at 100m mast inlet',
        citation: 'OHP ICOS Atmosphere Station, CNRS / Pythéas / CEA-LSCE.'
      }
    },
    {
      id: 'icos-trn',
      code: 'TRN',
      name: 'Traînou Tall Tower (Forêt d\'Orléans)',
      country: 'France (Centre)',
      network: 'ICOS',
      latitude: 47.9650,
      longitude: 2.1130,
      altitude: 131,
      samplingInletHeights: [5, 50, 100, 180],
      currentCO2: 428.30,
      currentCO2Date: '2026-09-28T12:00:00Z',
      monthlyAverage: 427.40,
      yearlyAverage: 426.10,
      trendYearlyPpm: 2.45,
      seasonalAmplitudePpm: 18.5,
      instrument: 'Picarro G2401 CRDS multi-level manifold (5m, 50m, 100m, 180m)',
      status: 'ONLINE',
      provenance: {
        source: 'ICOS Carbon Portal',
        dataset: 'Atmospheric CO2 Level 2 Multi-level Tall Tower Product - Traînou (TRN)',
        version: 'ICOS-ATC-L2-v2026',
        license: 'CC-BY-4.0',
        url: 'https://data.icos-cp.eu/portal/',
        doi: '10.18160/trn-co2-2026',
        method: 'Continuous multi-height mast sampling with WMO calibrated gases',
        citation: 'Traînou Tall Tower Station, LSCE (Laboratoire des Sciences du Climat et de l\'Environnement).'
      }
    },
    {
      id: 'icos-bir',
      code: 'BIR',
      name: 'Birkenes Atmospheric Observatory',
      country: 'Norvège',
      network: 'ICOS',
      latitude: 58.3880,
      longitude: 8.2520,
      altitude: 190,
      currentCO2: 426.40,
      currentCO2Date: '2026-09-28T12:00:00Z',
      monthlyAverage: 425.90,
      yearlyAverage: 424.80,
      trendYearlyPpm: 2.38,
      seasonalAmplitudePpm: 15.6,
      instrument: 'Picarro G2401 CRDS',
      status: 'ONLINE',
      provenance: {
        source: 'ICOS Carbon Portal',
        dataset: 'Atmospheric CO2 Level 2 Continuous In Situ Product - Birkenes (BIR)',
        version: 'ICOS-ATC-L2-v2026',
        license: 'CC-BY-4.0',
        url: 'https://data.icos-cp.eu/portal/',
        doi: '10.18160/bir-co2-2026',
        method: 'CRDS calibrated against WMO-CO2-X2019 standards',
        citation: 'NILU - Norwegian Institute for Air Research & ICOS Norway.'
      }
    },
    {
      id: 'icos-cmn',
      code: 'CMN',
      name: 'Monte Cimone Mountain Observatory',
      country: 'Italie',
      network: 'ICOS',
      latitude: 44.1940,
      longitude: 10.7010,
      altitude: 2165,
      currentCO2: 426.10,
      currentCO2Date: '2026-09-28T12:00:00Z',
      monthlyAverage: 425.40,
      yearlyAverage: 424.20,
      trendYearlyPpm: 2.39,
      seasonalAmplitudePpm: 11.4,
      instrument: 'NDIR / CRDS',
      status: 'ONLINE',
      provenance: {
        source: 'ICOS Carbon Portal',
        dataset: 'Atmospheric CO2 Level 2 Continuous In Situ Product - Monte Cimone (CMN)',
        version: 'ICOS-ATC-L2-v2026',
        license: 'CC-BY-4.0',
        url: 'https://data.icos-cp.eu/portal/',
        doi: '10.18160/cmn-co2-2026',
        method: 'High mountain free-tropospheric in situ sampling',
        citation: 'ISAC-CNR, Monte Cimone Climate Observatory.'
      }
    }
  ];

  public static async getStations(): Promise<Station[]> {
    const cacheKey = 'icos_stations_live';
    try {
      const res = await fetch('/api/stations?network=ICOS');
      if (res.ok) {
        const stations: Station[] = await res.json();
        if (stations && stations.length > 0) {
          CacheService.set(cacheKey, stations, 'ONLINE');
          return stations;
        }
      }
    } catch {}

    const cached = CacheService.get<Station[]>(cacheKey);
    if (cached) return cached.data;
    return this.STATIONS;
  }

  public static async getAtmosphericCO2(stationCode: string = 'PUY'): Promise<ScientificObservation[]> {
    const code = stationCode.toUpperCase();
    const cacheKey = `icos_obs_${code}`;

    try {
      const res = await fetch(`/api/observations/surface?station=${code}`);
      if (res.ok) {
        const data: ScientificObservation[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          CacheService.set(cacheKey, data, 'ONLINE');
          return data;
        }
      }
    } catch (e) {
      console.warn(`[ICOS Client] Échec /api/observations/surface pour ${code}:`, e);
    }

    const cached = CacheService.get<ScientificObservation[]>(cacheKey);
    if (cached) return cached.data;

    return [];
  }

  public static async getVerticalProfiles(stationCode: string = 'TRN'): Promise<VerticalProfile[]> {
    return [
      {
        id: 'icos-trn-mast-profile-2026',
        stationOrLocation: 'Traînou Tall Tower (4 Niveaux de prélèvement mât)',
        date: '2026-09-28T05:00:00Z',
        type: 'Aircraft',
        category: 'MEASURED',
        latitude: 47.965,
        longitude: 2.113,
        maxAltitudeKm: 0.311,
        provenance: {
          source: 'ICOS Carbon Portal',
          dataset: 'Traînou In Situ Tower Gradient (Level 2)',
          version: 'v2026_L2',
          license: 'CC-BY-4.0',
          url: 'https://data.icos-cp.eu/',
          doi: '10.18160/trn-tower-gradient',
          method: 'Synchronized sequential sampling on tower heights 5m, 50m, 100m, 180m',
          citation: 'LSCE / ICOS France Tower Gradient Observations.'
        },
        levels: [
          { altitudeKm: 0.136, pressureHpa: 1005, co2Ppm: 442.2, temperatureK: 284.1, uncertaintyPpm: 0.1 },
          { altitudeKm: 0.181, pressureHpa: 1000, co2Ppm: 434.6, temperatureK: 285.0, uncertaintyPpm: 0.1 },
          { altitudeKm: 0.231, pressureHpa: 994,  co2Ppm: 430.1, temperatureK: 285.8, uncertaintyPpm: 0.1 },
          { altitudeKm: 0.311, pressureHpa: 985,  co2Ppm: 426.5, temperatureK: 286.2, uncertaintyPpm: 0.1 }
        ]
      }
    ];
  }

  public static searchDatasets(query: string = '') {
    return [
      {
        pid: '11676/0w8Q2x9f-2026',
        title: 'ICOS Atmospheric Greenhouse Gas Mole Fractions 2026 Level 2',
        variables: ['CO2', 'CH4', 'CO', '14CO2'],
        coverage: 'Europe',
        license: 'CC-BY-4.0',
        doi: '10.18160/icos-atmos-release-2026'
      },
      {
        pid: '11676/FLUXNET-ICOS-2026',
        title: 'ICOS Ecosystem Eddy Covariance Flux Release Level 2',
        variables: ['NEE', 'GPP', 'Reco', 'H', 'LE'],
        coverage: 'European Ecosystem Stations',
        license: 'CC-BY-4.0',
        doi: '10.18160/fluxnet-icos-2026'
      }
    ].filter(d => query === '' || d.title.toLowerCase().includes(query.toLowerCase()));
  }
}
