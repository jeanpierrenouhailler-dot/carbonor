import { describe, it, expect } from 'vitest';
import { RadiativeTransferValidator } from '../../src/scientific/radiativeTransferValidation';

describe('Banc d’Essai Métrologique & Benchmarks de Transfert Radiatif', () => {
  const suite = RadiativeTransferValidator.runFullValidationSuite();

  it('exécute l’ensemble des 8 cas de test sans aucun échec', () => {
    expect(suite.summary.totalTests).toBe(8);
    expect(suite.summary.passedCount).toBe(8);
    expect(suite.summary.warningCount).toBe(0);
    expect(suite.summary.failedCount).toBe(0);
    expect(suite.summary.overallStatus).toBe('VALIDATED');
  });

  it('respecte la tolérance globale de RMSE sur la transmittance (RMSE < 0.0015)', () => {
    expect(suite.summary.globalRMSETransmittance).toBeLessThan(0.0015);
    expect(suite.summary.meanR2).toBeGreaterThan(0.9995);
  });

  it('valide le Benchmark 1 : RADIS spectre synthétique indépendant', () => {
    const testRadis = suite.results.find(r => r.testCase.id === 'tc-radis-15um-synthetic');
    expect(testRadis).toBeDefined();
    expect(testRadis!.status).toBe('PASSED');
    expect(testRadis!.metrics.transmittance.rmse).toBeLessThan(0.001);
    expect(testRadis!.metrics.transmittance.r2).toBeGreaterThan(0.9999);
  });

  it('valide le Benchmark 2 : HITRAN/HAPI raie isolée forte Q(16) à 667.38 cm⁻¹', () => {
    const testHapi = suite.results.find(r => r.testCase.id === 'tc-hitran-hapi-single-line');
    expect(testHapi).toBeDefined();
    expect(testHapi!.status).toBe('PASSED');
    expect(testHapi!.metrics.transmittance.rmse).toBeLessThan(0.0005);
  });

  it('valide le Benchmark 3 : Haute atmosphère / Stratosphère (régime Doppler dominant)', () => {
    const testStrat = suite.results.find(r => r.testCase.id === 'tc-cold-stratosphere-doppler');
    expect(testStrat).toBeDefined();
    expect(testStrat!.status).toBe('PASSED');
    expect(testStrat!.metrics.transmittance.r2).toBeGreaterThan(0.999);
  });

  it('valide le Benchmark 4 : Saturation optique profonde (τ > 30, T → 0)', () => {
    const testSat = suite.results.find(r => r.testCase.id === 'tc-deep-saturation-core');
    expect(testSat).toBeDefined();
    expect(testSat!.status).toBe('PASSED');
    expect(testSat!.metrics.transmittance.maxAbsError).toBe(0);
  });

  it('valide le Benchmark 5 : Intégrales unitaire des profils (conservation d’énergie)', () => {
    const testInt = suite.results.find(r => r.testCase.id === 'tc-profile-integrals');
    expect(testInt).toBeDefined();
    expect(testInt!.status).toBe('PASSED');
    expect(testInt!.metrics.transmittance.maxAbsError).toBeLessThan(0.001);
  });

  it('valide le Benchmark 6 : Limites asymptotiques & ailes lorentziennes', () => {
    const testAsymp = suite.results.find(r => r.testCase.id === 'tc-asymptotic-limits');
    expect(testAsymp).toBeDefined();
    expect(testAsymp!.status).toBe('PASSED');
  });

  it('valide le Benchmark 7 : Thermodynamique P/T & sommes de partition TIPS 2021', () => {
    const testTips = suite.results.find(r => r.testCase.id === 'tc-pt-thermodynamics-tips');
    expect(testTips).toBeDefined();
    expect(testTips!.status).toBe('PASSED');
  });

  it('valide le Benchmark 8 : Isotopologues & statistiques de spin nucléaire', () => {
    const testIso = suite.results.find(r => r.testCase.id === 'tc-isotopologues-nuclear-spin');
    expect(testIso).toBeDefined();
    expect(testIso!.status).toBe('PASSED');
  });
});
