import { describe, it, expect } from 'vitest';
import { HitranHapiProvider } from '../../src/providers/hitranHapiProvider';
import { SpectroscopyEngine } from '../../src/scientific/spectroscopyEngine';
import { BeerLambertParams } from '../../src/types/spectroscopy';

describe('Test d’Intégration : Pipeline Spectroscopique Complet', () => {
  it('exécute la chaîne complète : Requête HAPI → Filtrage Isotope → Simulation Beer-Lambert → Validation', async () => {
    // Étape 1 : Requête HAPI sur la bande 15 µm pour ¹²C¹⁶O₂ (626)
    const hapiRes = await HitranHapiProvider.queryHapi({
      isotopologue: '626',
      branch: 'ALL',
      numin: 660.0,
      numax: 675.0,
      temperature: 288,
      pressure: 1.0,
      minIntensity: 1e-25
    });

    expect(hapiRes.lines.length).toBeGreaterThan(0);

    // Étape 2 : Transmission des raies extraites dans le moteur raie-par-raie
    const params: BeerLambertParams = {
      molecule: 'CO2',
      isotopologue: '626',
      concentrationPpm: 420,
      temperatureK: 288,
      pressureAtm: 1.0,
      pathLengthMeters: 10, // Trajet optique 10 m
      spectralResolutionCm1: 0.05,
      centerWavenumberCm1: 667.38,
      windowHalfWidthCm1: 6.0,
      profileType: 'Voigt'
    };

    const sim = SpectroscopyEngine.simulateSpectrum(params, hapiRes.lines);

    // Étape 3 : Vérifications intégrées de cohérence physique
    expect(sim.points.length).toBeGreaterThan(100);
    expect(sim.meanTransmittance).toBeGreaterThan(0.0);
    expect(sim.meanTransmittance).toBeLessThan(1.0);

    // Vérification de la conservation d'énergie : A(ν) + T(ν) = 1.0 pour chaque point
    sim.points.forEach(p => {
      expect(p.absorbance + p.transmittance).toBeCloseTo(1.0, 3);
      expect(p.radiance).toBeGreaterThanOrEqual(0);
      expect(p.opticalDepth).toBeGreaterThanOrEqual(0);
    });

    // Étape 4 : Détection de la saturation au cœur de bande
    const corePt = sim.points.find(p => Math.abs(p.wavenumber - 667.38) < 0.05);
    expect(corePt).toBeDefined();
    expect(corePt!.opticalDepth).toBeGreaterThan(5.0);
    expect(corePt!.transmittance).toBeLessThan(0.01); // Opaque au cœur
  });

  it('compare l’effet d’un doublement de concentration (280 ppm vs 560 ppm) sur la bande saturée', () => {
    const baseParams: BeerLambertParams = {
      molecule: 'CO2',
      isotopologue: 'all',
      concentrationPpm: 280, // Préindustriel
      temperatureK: 296,
      pressureAtm: 1.0,
      pathLengthMeters: 10, // Cuve d'absorption multipassage de laboratoire (10 m)
      spectralResolutionCm1: 0.1,
      centerWavenumberCm1: 667.38,
      windowHalfWidthCm1: 15,
      profileType: 'Voigt'
    };

    const sim280 = SpectroscopyEngine.simulateSpectrum(baseParams);
    const sim560 = SpectroscopyEngine.simulateSpectrum({
      ...baseParams,
      concentrationPpm: 560 // Doublement CO₂
    });

    // Au centre saturé (667.38 cm⁻¹), transmittance déjà nulle à 280 ppm
    const center280 = sim280.points.find(p => Math.abs(p.wavenumber - 667.38) < 0.1);
    const center560 = sim560.points.find(p => Math.abs(p.wavenumber - 667.38) < 0.1);
    expect(center280?.transmittance).toBe(0);
    expect(center560?.transmittance).toBe(0);

    // En revanche, la transmittance moyenne globale diminue (absorption accrue dans les ailes des branches P et R)
    expect(sim560.meanTransmittance).toBeLessThan(sim280.meanTransmittance);
    const deltaT = sim280.meanTransmittance - sim560.meanTransmittance;
    expect(deltaT).toBeGreaterThan(0.005);
  });
});
