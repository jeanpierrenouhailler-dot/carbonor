import { describe, it, expect } from 'vitest';
import { HitranHapiProvider } from '../../src/providers/hitranHapiProvider';

describe('Fournisseur de Données HAPI / HITRAN (HitranHapiProvider)', () => {
  it('fournit la base complète en mode embarqué', () => {
    const embedded = HitranHapiProvider.getEmbeddedLines();
    expect(embedded.length).toBeGreaterThan(2000);
    expect(embedded[0].molecule).toBe('CO2');
  });

  it('exécute une requête HAPI avec filtrage spectral [numin, numax]', async () => {
    const res = await HitranHapiProvider.queryHapi({
      numin: 666.0,
      numax: 668.0,
      minIntensity: 1e-25
    });

    expect(res).toBeDefined();
    expect(res.returnedLinesCount).toBeGreaterThan(0);
    res.lines.forEach(l => {
      expect(l.wavenumber).toBeGreaterThanOrEqual(666.0);
      expect(l.wavenumber).toBeLessThanOrEqual(668.0);
    });
  });

  it('filtre fidèlement par isotopologue (ex: 626 uniquement)', async () => {
    const res = await HitranHapiProvider.queryHapi({
      isotopologue: '626',
      numin: 660.0,
      numax: 675.0
    });

    expect(res.lines.length).toBeGreaterThan(0);
    res.lines.forEach(l => {
      expect(l.isotopologue).toBe('626');
    });
  });

  it('filtre fidèlement par branche vibrationnelle (P, Q ou R)', async () => {
    const resQ = await HitranHapiProvider.queryHapi({
      branch: 'Q',
      numin: 666.0,
      numax: 668.5
    });

    expect(resQ.lines.length).toBeGreaterThan(0);
    resQ.lines.forEach(l => {
      expect(l.branch).toBe('Q');
      expect(l.upperJ - l.lowerJ).toBe(0);
    });
  });

  it('calcule les largeurs de Voigt, Lorentz et Doppler sous conditions P/T fournies', async () => {
    const res = await HitranHapiProvider.queryHapi({
      temperature: 250,
      pressure: 0.5,
      numin: 667.0,
      numax: 668.0
    });

    expect(res.lines.length).toBeGreaterThan(0);
    const first = res.lines[0];
    expect(first.dopplerWidthHWHM).toBeGreaterThan(0);
    expect(first.lorentzWidthHWHM).toBeGreaterThan(0);
    expect(first.voigtWidthHWHM).toBeGreaterThan(0);
    expect(first.voigtWidthHWHM!).toBeGreaterThan(first.lorentzWidthHWHM!);
  });
});
