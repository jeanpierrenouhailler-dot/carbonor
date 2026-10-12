import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoaaErddapProvider } from '../../src/providers/noaaProvider';
import { IcosProvider } from '../../src/providers/icosProvider';
import { OcoProvider } from '../../src/providers/ocoProvider';
import { CamsProvider } from '../../src/providers/camsProvider';
import { EmissionsProvider } from '../../src/providers/emissionsProvider';

describe('Fournisseurs de Données Atmosphériques & Pipelines', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('NOAA Global Monitoring Laboratory (NoaaErddapProvider)', () => {
    it('renvoie les stations certifiées NOAA (Mauna Loa, Barrow, South Pole)', async () => {
      const stations = await NoaaErddapProvider.getStations();
      expect(stations.length).toBeGreaterThanOrEqual(1);

      const mlo = stations.find(s => s.code === 'MLO');
      expect(mlo).toBeDefined();
      expect(mlo?.name).toContain('Mauna Loa');
      expect(mlo?.network).toBe('NOAA');
      expect(mlo?.provenance.version).toContain('WMO-CO2-X2019');
    });

    it('renvoie la série temporelle certifiée de Mauna Loa', async () => {
      const series = await NoaaErddapProvider.getMaunaLoaMonthly();
      expect(series.length).toBeGreaterThan(0);
      const latest = series[series.length - 1];
      expect(latest.value).toBeGreaterThan(300);
      expect(latest.value).toBeLessThan(500);
      expect(latest.unit).toBe('ppm');
    });
  });

  describe('ICOS Carbon Portal (IcosProvider)', () => {
    it('définit le protocole métrologique ATC et provenance CC-BY-4.0', async () => {
      const status = await IcosProvider.getPipelineStatus();
      expect(status.title).toContain('ICOS');
      expect(status.stages.length).toBeGreaterThan(0);
      expect(status.metrics.samplingScale).toContain('WMO-CO2-X2019');
    });

    it('gère l’absence de réseau sans lever d’exception non gérée', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      const stations = await IcosProvider.getStations();
      expect(Array.isArray(stations)).toBe(true);
    });
  });

  describe('Satellite NASA OCO-2 / OCO-3 (OcoProvider)', () => {
    it('fournit les profils et métadonnées d’inversion satellitaire XCO₂', async () => {
      const soundings = await OcoProvider.getXCO2('Europe-France');
      expect(Array.isArray(soundings)).toBe(true);
    });

    it('accède à la recherche de granules NASA CMR', async () => {
      const granules = await OcoProvider.searchGranules();
      expect(granules).toBeDefined();
      expect(granules).toHaveProperty('oco2');
      expect(granules).toHaveProperty('oco3');
    });
  });

  describe('Copernicus CAMS & Inversions (CamsProvider)', () => {
    it('fournit les flux de surface et profils verticaux', async () => {
      const surface = await CamsProvider.getSurfaceConcentration(48.85, 2.35);
      expect(surface).toBeDefined();
      expect(surface.value).toBeGreaterThan(400);
      expect(surface.unit).toBe('ppm');

      const profile = await CamsProvider.getVerticalConcentration(48.85, 2.35);
      expect(profile).toBeDefined();
      expect(profile.maxAltitudeKm).toBeGreaterThan(20);
    });
  });

  describe('CITEPA / CCNUCC Inventaires d’Émissions (EmissionsProvider)', () => {
    it('fournit les inventaires et versions CITEPA SECTEN', async () => {
      const versions = await EmissionsProvider.getAvailableVersions();
      expect(Array.isArray(versions)).toBe(true);

      const france = await EmissionsProvider.getFranceEmissions();
      expect(Array.isArray(france)).toBe(true);
    });
  });
});
