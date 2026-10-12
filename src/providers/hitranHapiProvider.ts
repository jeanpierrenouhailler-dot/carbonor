import { HITRAN_CO2_LINES } from '../scientific/hitranData';
import { SpectralLine, VibrationalBranch } from '../types/spectroscopy';

export interface HitranHapiQueryParams {
  molecule?: number | string;
  isotopologue?: string;      // 'all' | '626' | '636' | '628' | '627' | '638'
  band?: string;              // 'all' | '15um' | '4.3um' | '2.7um' | '2.06um' | '1.61um' | '1.43um'
  numin?: number;
  numax?: number;
  jLowerMin?: number;
  jLowerMax?: number;
  jUpperMin?: number;
  jUpperMax?: number;
  branch?: 'ALL' | VibrationalBranch;
  minIntensity?: number;
  temperature?: number;
  pressure?: number;
  limit?: number;
}

export interface HitranHapiResultLine extends SpectralLine {
  intensityAtT?: number;
  dopplerWidthHWHM?: number;
  lorentzWidthHWHM?: number;
  voigtWidthHWHM?: number;
  peakCrossSectionCm2?: number;
}

export interface HitranHapiResponse {
  source: 'HITRAN_HAPI_LIVE' | 'HITRAN_HAPI_CACHE' | 'HITRAN_EMBEDDED';
  version: string;
  query: HitranHapiQueryParams;
  executionTimeMs: number;
  totalMatchingLines: number;
  returnedLinesCount: number;
  thermodynamics: {
    temperatureK: number;
    pressureAtm: number;
    partitionFunctionQ: number;
  };
  spectralBounds: {
    minWavenumber: number;
    maxWavenumber: number;
    minWavelengthMicrons: number;
    maxWavelengthMicrons: number;
  };
  lines: HitranHapiResultLine[];
}

export class HitranHapiProvider {
  /**
   * Mode Embarqué : Retourne les raies fondamentales préchargées (offline / pédagogique)
   */
  public static getEmbeddedLines(): SpectralLine[] {
    return HITRAN_CO2_LINES;
  }

  /**
   * Mode Scientifique : Requête HAPI / HITRAN dynamique avec tous les critères quantiques
   */
  public static async queryHapi(params: HitranHapiQueryParams): Promise<HitranHapiResponse> {
    const startTime = performance.now();

    try {
      const response = await fetch('/api/hitran/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (response.ok) {
        const data: HitranHapiResponse = await response.json();
        return data;
      }
    } catch (e) {
      console.warn('API /api/hitran/query non disponible, bascule sur moteur local HAPI:', e);
    }

    // Fallback dynamique côté client (utile en mode PWA complètement hors-ligne ou Cloudflare Pages statique)
    const filtered = this.clientSideHapiFilter(params);
    const minWn = filtered.length > 0 ? Math.min(...filtered.map(l => l.wavenumber)) : 0;
    const maxWn = filtered.length > 0 ? Math.max(...filtered.map(l => l.wavenumber)) : 0;

    return {
      source: 'HITRAN_EMBEDDED',
      version: 'HITRAN2020 / Embarqué Local',
      query: params,
      executionTimeMs: Math.round(performance.now() - startTime),
      totalMatchingLines: filtered.length,
      returnedLinesCount: filtered.length,
      thermodynamics: {
        temperatureK: params.temperature || 296.0,
        pressureAtm: params.pressure || 1.0,
        partitionFunctionQ: 288.5
      },
      spectralBounds: {
        minWavenumber: minWn,
        maxWavenumber: maxWn,
        minWavelengthMicrons: maxWn > 0 ? Number((10000 / maxWn).toFixed(3)) : 0,
        maxWavelengthMicrons: minWn > 0 ? Number((10000 / minWn).toFixed(3)) : 0
      },
      lines: filtered
    };
  }

  private static clientSideHapiFilter(params: HitranHapiQueryParams): HitranHapiResultLine[] {
    const T = params.temperature || 296.0;
    const P = params.pressure || 1.0;
    const minI = params.minIntensity || 1e-26;

    return HITRAN_CO2_LINES.filter(l => {
      if (params.isotopologue && params.isotopologue !== 'all' && l.isotopologue !== params.isotopologue) return false;
      if (params.branch && params.branch !== 'ALL' && l.branch !== params.branch) return false;
      if (params.numin !== undefined && l.wavenumber < params.numin) return false;
      if (params.numax !== undefined && l.wavenumber > params.numax) return false;
      if (params.jLowerMin !== undefined && l.lowerJ < params.jLowerMin) return false;
      if (params.jLowerMax !== undefined && l.lowerJ > params.jLowerMax) return false;
      if (params.jUpperMin !== undefined && l.upperJ < params.jUpperMin) return false;
      if (params.jUpperMax !== undefined && l.upperJ > params.jUpperMax) return false;
      if (l.intensity < minI) return false;
      return true;
    }).map(l => {
      // Calcul approché des largeurs sous P et T
      const lorentz = P * Math.pow(296.0 / T, l.tempDependence) * l.airWidth;
      const doppler = (l.wavenumber / 299792458) * Math.sqrt(2 * 1.380649e-23 * T * Math.LN2 / (44 * 1.6605e-27));
      return {
        ...l,
        intensityAtT: l.intensity,
        lorentzWidthHWHM: Number(lorentz.toFixed(5)),
        dopplerWidthHWHM: Number(doppler.toFixed(5)),
        voigtWidthHWHM: Number((lorentz * 0.5346 + Math.sqrt(0.2166 * lorentz * lorentz + doppler * doppler)).toFixed(5))
      };
    });
  }
}
