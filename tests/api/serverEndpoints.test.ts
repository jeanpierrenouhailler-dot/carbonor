import { describe, it, expect } from 'vitest';
import { HitranDataPipeline } from '../../src/server/hitranPipeline';
import { NoaaPipeline } from '../../src/server/noaaPipeline';
import { IcosDataPipeline } from '../../src/server/icosPipeline';
import { CitepaPipeline } from '../../src/server/citepaPipeline';

describe('Pipelines Serveur & Endpoints API', () => {
  describe('HitranDataPipeline (/api/hitran/query)', () => {
    it('traite une requête de bande avec fenêtrage spectral et limitation', async () => {
      const res = await HitranDataPipeline.queryLines({
        molecule: 'CO2',
        band: '15um',
        numin: 665,
        numax: 670,
        limit: 50
      });

      expect(res).toBeDefined();
      expect(res.version).toContain('HITRAN2020');
      expect(res.lines.length).toBeGreaterThan(0);
      expect(res.lines.length).toBeLessThanOrEqual(50);
      res.lines.forEach(l => {
        expect(l.wavenumber).toBeGreaterThanOrEqual(665);
        expect(l.wavenumber).toBeLessThanOrEqual(670);
      });
    });

    it('calcule la fonction de partition Q et les largeurs de raie sous conditions thermodynamiques', async () => {
      const res = await HitranDataPipeline.queryLines({
        temperature: 220,
        pressure: 0.2,
        numin: 667,
        numax: 668
      });

      expect(res.thermodynamics.temperatureK).toBe(220);
      expect(res.thermodynamics.pressureAtm).toBe(0.2);
      expect(res.thermodynamics.partitionFunctionQ).toBeGreaterThan(150);
    });

    it('gère correctement les paramètres d’intensité minimale', async () => {
      const res = await HitranDataPipeline.queryLines({
        numin: 660,
        numax: 680,
        minIntensity: 1e-21
      });

      res.lines.forEach(l => {
        expect(l.intensity).toBeGreaterThanOrEqual(1e-21);
      });
    });
  });

  describe('NoaaPipeline (/api/stations?network=NOAA)', () => {
    it('initialise les stations et le cache certifié NOAA', async () => {
      const stations = await NoaaPipeline.getStations();
      expect(stations.length).toBeGreaterThanOrEqual(1);
      const mlo = stations.find(s => s.code === 'MLO');
      expect(mlo).toBeDefined();
      expect(mlo?.network).toBe('NOAA');
      expect(mlo?.altitude).toBe(3397);
    });
  });

  describe('IcosDataPipeline (/api/stations?network=ICOS)', () => {
    it('fournit les stations européennes ICOS et métadonnées ATC', async () => {
      const stations = await IcosDataPipeline.getStations();
      expect(Array.isArray(stations)).toBe(true);
      if (stations.length > 0) {
        expect(stations[0].network).toBe('ICOS');
      }
    });
  });

  describe('CitepaPipeline (/api/citepa/emissions)', () => {
    it('fournit les inventaires d’émissions CITEPA SECTEN certifiés', async () => {
      const data = await CitepaPipeline.getSectorialEmissions();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('ProviderHealthService & Taxonomie Scientifique (/api/status)', () => {
    it('distingue rigoureusement les états métrologiques sans aucun faux ONLINE', async () => {
      const { ProviderHealthService } = await import('../../src/server/providerHealthService');
      const status = await ProviderHealthService.getSystemStatus();

      expect(status).toBeDefined();
      expect(status.providers.length).toBe(6);

      const allowedStatuses = [
        'CONNECTED',
        'FETCHED',
        'CACHED',
        'STALE',
        'OFFLINE',
        'ERROR',
        'NOT_CONFIGURED'
      ];

      status.providers.forEach(p => {
        // Aucune fausse valeur "ONLINE" générale
        expect(allowedStatuses).toContain(p.status);
        expect(p.recordsCount).toBeGreaterThan(0);
        expect(p.statusExplanation).toBeDefined();
        expect(p.breakdown).toBeDefined();
      });

      // Vérification des comptes réels non gonflés
      const hitran = status.providers.find(p => p.id === 'hitran');
      expect(hitran?.recordsCount).toBe(2551); // 2 551 raies exactes, pas 28 000 !

      const nasa = status.providers.find(p => p.id === 'nasa');
      expect(nasa?.recordsCount).toBe(197); // 197 sondages réels, pas 15 400 !

      const cams = status.providers.find(p => p.id === 'cams');
      expect(cams?.recordsCount).toBe(10033); // 10 033 points réels, pas 120 000 !

      // Identification de NOT_CONFIGURED pour les flux nécessitant des jetons distants
      expect(cams?.status).toBe('NOT_CONFIGURED');
      expect(nasa?.status).toBe('NOT_CONFIGURED');
    });

    it('bascule un provider sur FETCHED lorsqu’un téléchargement direct a lieu', async () => {
      const { ProviderHealthService } = await import('../../src/server/providerHealthService');
      
      // Simuler l'enregistrement d'un téléchargement en direct réussi
      ProviderHealthService.registerLiveFetch('noaa', 18250, 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt');

      const status = await ProviderHealthService.getSystemStatus();
      const noaa = status.providers.find(p => p.id === 'noaa');
      expect(noaa?.status).toBe('FETCHED');
      expect(noaa?.statusLabel).toContain('Téléchargé en direct');
    });

    it('exécute un probe réseau et mesure la latence vers un hôte joignable', async () => {
      const { ProviderHealthService } = await import('../../src/server/providerHealthService');
      const probe = await ProviderHealthService.probeHost('https://gml.noaa.gov', 3000);
      
      expect(probe).toBeDefined();
      expect(typeof probe.reachable).toBe('boolean');
      expect(typeof probe.latencyMs).toBe('number');
      expect(probe.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Exports Scientifiques Multi-Formats (/api/export)', () => {
    it('génère un export CSV enrichi avec cartouche métrologique WMO et traçabilité', async () => {
      const { ScientificExportService } = await import('../../src/services/scientificExportService');
      const csv = ScientificExportService.exportToCsv({
        data: [{ date: '2026-10-02', value: 425.3, variable: 'co2_surface' }],
        datasetName: 'keeling_mlo_test',
        provenance: {
          source: 'NOAA Global Monitoring Laboratory',
          dataset: 'co2_daily_mlo.txt',
          version: 'WMO-CO2-X2019',
          doi: '10.15138/9N0H-ZH07',
          license: 'NOAA Public Domain Data Policy'
        }
      });

      expect(csv).toContain('# Source: NOAA Global Monitoring Laboratory');
      expect(csv).toContain('# Dataset: co2_daily_mlo.txt');
      expect(csv).toContain('# Version: WMO-CO2-X2019');
      expect(csv).toContain('# DOI: 10.15138/9N0H-ZH07');
      expect(csv).toContain('# Licence: NOAA Public Domain Data Policy');
      expect(csv).toContain('425.3');
    });

    it('génère un export GeoJSON RFC 7946 avec coordonnées et objet metadata de provenance', async () => {
      const { ScientificExportService } = await import('../../src/services/scientificExportService');
      const geojson = ScientificExportService.exportToGeoJson({
        data: [{ latitude: 45.77, longitude: 2.96, value: 430.8, station: 'PUY' }],
        datasetName: 'icos_puy_test',
        provenance: {
          source: 'ICOS Carbon Portal',
          dataset: 'Atmospheric CO2 Level 2',
          version: '2026.1',
          doi: '10.18160/puy-co2-2026',
          license: 'CC-BY-4.0'
        }
      });

      expect(geojson.type).toBe('FeatureCollection');
      expect(geojson.metadata.source).toBe('ICOS Carbon Portal');
      expect(geojson.metadata.doi).toBe('10.18160/puy-co2-2026');
      expect(geojson.metadata.license).toBe('CC-BY-4.0');
      expect(geojson.features[0].geometry.coordinates).toEqual([2.96, 45.77, 0]);
      expect(geojson.features[0].properties.station).toBe('PUY');
    });

    it('génère un export NetCDF CF-1.8 CDL avec variables coordonnées et attributs globaux', async () => {
      const { ScientificExportService } = await import('../../src/services/scientificExportService');
      const cdl = ScientificExportService.exportToNetCdf({
        data: [{ latitude: 19.53, longitude: -155.57, value: 425.3, uncertainty: 0.12 }],
        datasetName: 'noaa_mlo_netcdf',
        provenance: {
          source: 'NOAA GML',
          dataset: 'co2_daily_mlo.txt',
          version: 'WMO-CO2-X2019',
          license: 'NOAA Public Domain'
        }
      });

      expect(cdl).toContain('netcdf noaa_mlo_netcdf');
      expect(cdl).toContain(':Conventions = "CF-1.8"');
      expect(cdl).toContain(':source = "NOAA GML"');
      expect(cdl).toContain(':dataset = "co2_daily_mlo.txt"');
      expect(cdl).toContain('co2(time)');
    });

    it('génère un export PDF 1.4 binaire officiel avec certificat de traçabilité', async () => {
      const { ScientificExportService } = await import('../../src/services/scientificExportService');
      const pdf = ScientificExportService.exportToPdf({
        data: [{ timestamp: '2026-10-02T12:00:00Z', value: 425.32, unit: 'ppm' }],
        datasetName: 'rapport_certifie_mlo'
      });

      expect(pdf).toBeInstanceOf(Uint8Array);
      const str = new TextDecoder().decode(pdf);
      expect(str.startsWith('%PDF-1.4')).toBe(true);
      expect(str).toContain('CARBONOR');
      expect(str).toContain('CERTIFICAT');
      expect(str).toContain('%%EOF');
    });
  });
});

