import { describe, it, expect } from 'vitest';
import { NoaaErddapProvider } from '../../src/providers/noaaProvider';
import { compareSeries } from '../../src/scientific/statistics';

describe('Test d’Intégration : Workflow d’Audit & Comparaison Multi-Sources', () => {
  it('compare statistiquement les observations de surface et valide la cohérence des échelles WMO', async () => {
    const noaaStations = await NoaaErddapProvider.getStations();
    expect(noaaStations.length).toBeGreaterThan(0);

    const mlo = noaaStations.find(s => s.code === 'MLO');
    expect(mlo).toBeDefined();

    // Vérification de la conformité à l'échelle WMO-CO2-X2019
    expect(mlo?.provenance.version).toContain('WMO-CO2-X2019');
    expect(mlo?.currentCO2).toBeGreaterThan(410);
    expect(mlo?.currentCO2).toBeLessThan(440);

    // Comparaison synthétique de contrôle de qualité
    const referenceSeries = [418.5, 419.2, 421.0, 422.5, 424.1];
    const measuredSeries = [418.6, 419.1, 421.2, 422.4, 424.0];

    const stats = compareSeries(referenceSeries, measuredSeries, 'ppm');
    expect(stats.rmse).toBeLessThan(0.3); // Erreur de mesure acceptable selon standard OMM (< 0.3 ppm)
    expect(stats.pearsonR).toBeGreaterThan(0.99);
    expect(stats.bias).toBeCloseTo(0.0, 1);
  });
});
