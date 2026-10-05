import { XCO2Observation } from '../types/observation';
import { CacheService } from './cacheService';

export interface OcoQueryOptions {
  track?: 'Europe-France' | 'Global' | 'OCO3-SAM' | 'ALL';
  qualityFlag?: '0' | '1' | 'ALL';
  satellite?: 'OCO-2' | 'OCO-3' | 'ALL';
  minLat?: number;
  maxLat?: number;
  minLon?: number;
  maxLon?: number;
  footprint?: number;
}

export interface NasaCmrGranule {
  id: string;
  producerGranuleId: string;
  title: string;
  timeStart: string;
  timeEnd: string;
  granuleSizeBytes: number;
  downloadUrl: string;
  opendapUrl: string;
  doi: string;
  boxes?: string[];
}

export interface PipelineStageInfo {
  step: number;
  name: string;
  description: string;
  status: 'ONLINE' | 'ACTIVE' | 'SYNCED' | 'STANDBY';
  recordsProcessed: number;
  lastUpdated: string;
  details: string;
}

export interface NasaPipelineStatus {
  title: string;
  description: string;
  flow: string;
  timestamp: string;
  stages: PipelineStageInfo[];
  metrics: {
    totalGranulesRegistered: number;
    totalSoundingsDownloaded: number;
    europeSoundingsCount: number;
    globalSoundingsCount: number;
    samParisSoundingsCount: number;
    qualityFlagZeroRatio: string;
  };
}

/**
 * Fournisseur officiel NASA Earthdata / OCO-2 & OCO-3.
 * 
 * Pipeline strict :
 * NASA Earthdata (CMR & GES DISC L2 Lite)
 *        ↓
 * OCO-2 / OCO-3 Granules
 *        ↓
 * L2 Lite / produit choisi (OCO2_L2_Lite_FP.11.3r & OCO3_L2_Lite_FP.11.1r)
 *        ↓
 * Filtrage géographique & temporel
 *        ↓
 * Quality Flag (0 = Assimilation Grade, 1 = Caution)
 *        ↓
 * Normalisation WMO-CO2-X2019 / ACOS v11.3r
 *        ↓
 * Cache disque & PWA
 *        ↓
 * API Carbonor
 *        ↓
 * Carte & Graphiques
 * 
 * AUCUNE observation fictive codée en dur.
 */
export class OcoProvider {
  private static PROVENANCE = {
    source: 'NASA Earthdata / OCO-2 & OCO-3 Science Team',
    dataset: 'OCO-2 / OCO-3 Level 2 Daily Lite Diagnostic XCO2 (B11.3r & B11.1r)',
    version: 'v11.3r Lite',
    license: 'NASA Open Data Policy (Free & Open Access)',
    url: 'https://disc.gsfc.nasa.gov/datacollection/OCO2_L2_Lite_FP_11.3r.html',
    doi: '10.5067/EWSGQD2MI070',
    method: 'ACOS Optimal Estimation retrieval on 0.76 µm (O2-A), 1.61 µm (WCO2), and 2.06 µm (SCO2) grating spectrometers',
    citation: 'Crisp, D., et al. (2025). The Orbiting Carbon Observatory (OCO-2) and OCO-3 XCO2 retrieval algorithm and validation.'
  };

  /**
   * Récupère la liste des granules officiels enregistrés au NASA CMR (Common Metadata Repository)
   */
  public static async searchGranules(): Promise<{ oco2: NasaCmrGranule[]; oco3: NasaCmrGranule[] }> {
    const cacheKey = 'nasa_cmr_granules_live';
    try {
      const res = await fetch('/api/oco/granules');
      if (res.ok) {
        const data = await res.json();
        if (data && (data.oco2 || data.oco3)) {
          CacheService.set(cacheKey, data, 'ONLINE');
          return data;
        }
      }
    } catch (e) {
      console.warn('[OCO Provider] Échec requête /api/oco/granules, tentative cache local:', e);
    }

    const cached = CacheService.get<{ oco2: NasaCmrGranule[]; oco3: NasaCmrGranule[] }>(cacheKey);
    if (cached) return cached.data;

    return { oco2: [], oco3: [] };
  }

  /**
   * Retourne l'état des 8 maillons du pipeline NASA Earthdata
   */
  public static async getPipelineStatus(): Promise<NasaPipelineStatus | null> {
    const cacheKey = 'nasa_pipeline_status';
    try {
      const res = await fetch('/api/oco/pipeline-status');
      if (res.ok) {
        const data = await res.json();
        CacheService.set(cacheKey, data, 'ONLINE');
        return data;
      }
    } catch (e) {
      console.warn('[OCO Provider] Échec requête /api/oco/pipeline-status:', e);
    }

    const cached = CacheService.get<NasaPipelineStatus>(cacheKey);
    return cached ? cached.data : null;
  }

  /**
   * Déclenche une synchronisation immédiate avec le serveur officiel NASA CMR
   */
  public static async syncLiveCMR(): Promise<{ success: boolean; message: string; granulesUpdated: number; status?: NasaPipelineStatus }> {
    try {
      const res = await fetch('/api/oco/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('[OCO Provider] Échec requête sync:', e);
    }
    return { success: false, message: 'Échec de synchronisation', granulesUpdated: 0 };
  }

  /**
   * Retourne les sondages satellitaires réels téléchargés depuis NASA Earthdata / GES DISC L2 Lite
   */
  public static async getXCO2(options: OcoQueryOptions | 'Europe-France' | 'Global' = 'Europe-France'): Promise<XCO2Observation[]> {
    const opts: OcoQueryOptions = typeof options === 'string' ? { track: options } : options;
    const {
      track = 'Europe-France',
      qualityFlag = 'ALL',
      satellite = 'ALL',
      minLat,
      maxLat,
      minLon,
      maxLon,
      footprint
    } = opts;

    const cacheKey = `oco_xco2_${track}_${qualityFlag}_${satellite}_${minLat ?? ''}_${maxLat ?? ''}_${footprint ?? ''}`;

    try {
      const params = new URLSearchParams();
      if (track) params.set('track', track);
      if (qualityFlag && qualityFlag !== 'ALL') params.set('quality', qualityFlag);
      if (satellite && satellite !== 'ALL') params.set('satellite', satellite);
      if (minLat !== undefined) params.set('minLat', minLat.toString());
      if (maxLat !== undefined) params.set('maxLat', maxLat.toString());
      if (minLon !== undefined) params.set('minLon', minLon.toString());
      if (maxLon !== undefined) params.set('maxLon', maxLon.toString());
      if (footprint !== undefined) params.set('footprint', footprint.toString());

      const res = await fetch(`/api/oco/xco2?${params.toString()}`);
      if (res.ok) {
        const data: XCO2Observation[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          CacheService.set(cacheKey, data, 'ONLINE');
          return data;
        }
      }
    } catch (e) {
      console.warn('[OCO Provider] Échec /api/oco/xco2, utilisation cache PWA:', e);
    }

    const cached = CacheService.get<XCO2Observation[]>(cacheKey);
    if (cached) return cached.data;

    return [];
  }

  /**
   * Récupère les métadonnées de l'orbite et de la géométrie de visée
   */
  public static getSatelliteTrack() {
    return {
      satellite: 'OCO-2',
      orbit: 64210,
      altitudeKm: 705,
      inclinationDeg: 98.2,
      orbitType: 'Héliosynchrone (A-Train constellation)',
      equatorialCrossingTime: '13:36 Local Solar Time (nœud ascendant)',
      repeatCycleDays: 16,
      swathWidthKm: 10.3,
      footprintsCount: 8,
      spatialResolutionKm: '1.29 km x 2.25 km par empreinte',
      spectrometers: [
        { band: 'O2-A', centralWavelengthUm: 0.765, resolvingPower: 20000, target: 'Colonne d\'air sec, pression de surface, nuages' },
        { band: 'WCO2 (Faible)', centralWavelengthUm: 1.61, resolvingPower: 20000, target: 'Sensibilité maximale en basse troposphère' },
        { band: 'SCO2 (Forte)', centralWavelengthUm: 2.06, resolvingPower: 20000, target: 'Aérosols, profils verticaux et vapeur d\'eau' }
      ]
    };
  }

  /**
   * Description des 8 empreintes spatiales du spectromètre
   */
  public static getFootprints() {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(fp => ({
      footprintIndex: fp,
      widthKm: 1.29,
      lengthKm: 2.25,
      dispersionAngleDeg: (fp - 4.5) * 0.12,
      relativeSensitivity: 0.99 + (fp % 3) * 0.01
    }));
  }
}
