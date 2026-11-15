import { describe, it, expect } from 'vitest';
import { CacheService } from '../../src/providers/cacheService';
import { IcosDataPipeline } from '../../src/server/icosPipeline';
import { CamsDataPipeline } from '../../src/server/camsPipeline';
import { NasaOcoPipeline } from '../../src/server/nasaOcoPipeline';
import { HITRAN_CO2_LINES } from '../../src/scientific/hitranData';

describe('Intégrité Épistémologique & Provenance Cryptographique', () => {
  it('vérifie la conformité SHA-256 FIPS 180-4 (64 hex chars)', () => {
    const emptyHash = CacheService.computeChecksum('');
    expect(emptyHash).toBe('sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(emptyHash.length).toBe(7 + 64);
  });

  it('qualifie les raies HITRAN embarquées comme SIMULATED (modèle Dunham)', () => {
    expect(HITRAN_CO2_LINES.length).toBeGreaterThan(2000);
    const sample = HITRAN_CO2_LINES[0];
    expect(sample.origin).toBe('SIMULATED');
    expect(sample.method).toContain('Dunham-Hamiltonian');
  });

  it('fournit une provenance complète SHA-256 sur les stations et observations ICOS', () => {
    const stations = IcosDataPipeline.getStations();
    expect(stations.length).toBe(5);
    const puy = stations.find(s => s.code === 'PUY');
    expect(puy).toBeDefined();
    expect(puy?.provenance.checksumAlgorithm).toBe('SHA-256');
    expect(puy?.provenance.checksum?.startsWith('sha256:')).toBe(true);
    expect(puy?.provenance.checksum?.length).toBe(71);

    const obsReal = IcosDataPipeline.getStationObservations('PUY', { dataMode: 'REAL_DATA' });
    if (obsReal.length > 0) {
      expect(obsReal[0].category).toBe('MEASURED');
      expect(obsReal[0].provenance.origin).toBe('REMOTE_CACHED');
      expect(obsReal[0].provenance.isRealData).toBe(true);
    }

    const obsDemo = IcosDataPipeline.getStationObservations('PUY', { dataMode: 'DEMO' });
    if (obsDemo.length > 0) {
      expect(obsDemo[0].provenance.origin).toBe('DEMO');
      expect(obsDemo[0].provenance.isRealData).toBe(false);
    }
  });

  it('distingue strictement MODELED (grilles 3D CAMS) et ESTIMATED (inversions de flux CAMS)', () => {
    const surface = CamsDataPipeline.getSurfaceConcentration(48.85, 2.35, { dataMode: 'REAL_DATA' });
    expect(surface.category).toBe('MODELED');
    expect(surface.provenance.origin).toBe('REMOTE_CACHED');
    expect(surface.provenance.checksumAlgorithm).toBe('SHA-256');
    expect(surface.provenance.checksum?.length).toBe(71);

    const xco2 = CamsDataPipeline.getColumnMeanCO2(48.85, 2.35, { dataMode: 'REAL_DATA' });
    expect(xco2.category).toBe('MODELED');

    const fluxReal = CamsDataPipeline.getSurfaceFlux({ dataMode: 'REAL_DATA' });
    expect(fluxReal.length).toBeGreaterThanOrEqual(1);
    expect(fluxReal[0].category).toBe('ESTIMATED');
    expect(fluxReal[0].provenance?.origin).toBe('REMOTE_CACHED');

    const fluxDemo = CamsDataPipeline.getSurfaceFlux({ dataMode: 'DEMO' });
    expect(fluxDemo[0].provenance?.origin).toBe('DEMO');
    expect(fluxDemo[0].provenance?.isRealData).toBe(false);
  });

  it('applique le mode REAL_DATA vs DEMO et SHA-256 sur les sondages NASA OCO', () => {
    const realSoundings = NasaOcoPipeline.getSoundings({ track: 'Europe-France', dataMode: 'REAL_DATA' });
    expect(realSoundings.length).toBeGreaterThan(0);
    expect(realSoundings[0].provenance?.origin).toMatch(/REMOTE_CACHED|LOCAL_ARCHIVE/);
    expect(realSoundings[0].provenance?.checksum?.length).toBe(71);

    const demoSoundings = NasaOcoPipeline.getSoundings({ track: 'Europe-France', dataMode: 'DEMO' });
    expect(demoSoundings[0].provenance?.origin).toBe('DEMO');
    expect(demoSoundings[0].provenance?.isRealData).toBe(false);
  });
});
