import { describe, it, expect } from 'vitest';
import { compareSeries } from '../../src/scientific/statistics';

describe('Module Statistique & Métrologie de Comparaison de Séries', () => {
  it('calcule correctement les statistiques pour des séries identiques (cas idéal)', () => {
    const data = [415.2, 416.0, 417.8, 418.5, 420.1];
    const stats = compareSeries(data, data, 'ppm');

    expect(stats.count).toBe(5);
    expect(stats.bias).toBe(0);
    expect(stats.mae).toBe(0);
    expect(stats.rmse).toBe(0);
    expect(stats.pearsonR).toBeCloseTo(1.0, 4);
    expect(stats.rSquared).toBeCloseTo(1.0, 4);
    expect(stats.maxPositiveResidual).toBe(0);
    expect(stats.maxNegativeResidual).toBe(0);
  });

  it('calcule un biais constant exact', () => {
    const observed = [410, 412, 414, 416];
    const modeled = [412, 414, 416, 418]; // Biais constant de +2.0 ppm
    const stats = compareSeries(observed, modeled, 'ppm');

    expect(stats.bias).toBeCloseTo(2.0, 3);
    expect(stats.mae).toBeCloseTo(2.0, 3);
    expect(stats.rmse).toBeCloseTo(2.0, 3);
    expect(stats.pearsonR).toBeCloseTo(1.0, 4); // Corrélation parfaite malgré le biais
    expect(stats.rSquared).toBeCloseTo(1.0, 4);
    expect(stats.maxPositiveResidual).toBe(2.0);
    expect(stats.maxNegativeResidual).toBe(2.0);
  });

  it('calcule une anti-corrélation négative exacte', () => {
    const observed = [10, 20, 30, 40];
    const modeled = [40, 30, 20, 10];
    const stats = compareSeries(observed, modeled);

    expect(stats.pearsonR).toBeCloseTo(-1.0, 4);
    expect(stats.rSquared).toBeCloseTo(1.0, 4);
  });

  it('calcule correctement le RMSE et MAE pour des résidus connus', () => {
    const obs = [100, 100, 100, 100];
    const mod = [102, 98, 104, 96]; // Écarts: +2, -2, +4, -4
    // MAE = (2 + 2 + 4 + 4) / 4 = 3.0
    // RMSE = sqrt((4 + 4 + 16 + 16) / 4) = sqrt(10) ~ 3.162
    // Biais = (2 - 2 + 4 - 4) / 4 = 0.0
    const stats = compareSeries(obs, mod);

    expect(stats.bias).toBeCloseTo(0.0, 3);
    expect(stats.mae).toBeCloseTo(3.0, 3);
    expect(stats.rmse).toBeCloseTo(Math.sqrt(10), 3);
    expect(stats.maxPositiveResidual).toBe(4.0);
    expect(stats.maxNegativeResidual).toBe(-4.0);
  });

  it('gère gracieusement les séries vides ou de taille nulle', () => {
    const stats = compareSeries([], []);
    expect(stats.count).toBe(0);
    expect(stats.bias).toBe(0);
    expect(stats.rmse).toBe(0);
    expect(stats.pearsonR).toBe(0);
  });

  it('gère les séries de longueurs inégales en tronquant au minimum commun', () => {
    const obs = [1, 2, 3, 4, 5];
    const mod = [1, 2, 3];
    const stats = compareSeries(obs, mod);
    expect(stats.count).toBe(3);
    expect(stats.bias).toBe(0);
  });
});
