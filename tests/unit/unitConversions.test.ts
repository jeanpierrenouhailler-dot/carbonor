import { describe, it, expect } from 'vitest';
import {
  wavenumberToWavelengthMicrons,
  wavelengthMicronsToWavenumber,
  wavenumberToFrequencyTHz,
  frequencyTHzToWavenumber,
  molecularNumberDensity,
  ppmToMoleculesPerCm3,
  fluxUmolPerM2sToGCPerM2day,
  fluxGCPerM2dayToUmolPerM2s,
  SPEED_OF_LIGHT,
  BOLTZMANN_CONSTANT,
  PLANCK_CONSTANT,
  AVOGADRO_CONSTANT,
  MOLAR_MASS_CO2,
  MOLAR_MASS_CARBON,
  CO2_TO_C_RATIO,
  GAS_CONSTANT_R
} from '../../src/scientific/unitConversions';

describe('Constantes Fondamentales CODATA 2022', () => {
  it('respecte les valeurs exactes du SI et CODATA pour les constantes physiques', () => {
    expect(SPEED_OF_LIGHT).toBe(299792458); // m/s exact
    expect(BOLTZMANN_CONSTANT).toBe(1.380649e-23); // J/K exact
    expect(PLANCK_CONSTANT).toBe(6.62607015e-34); // J·s exact
    expect(AVOGADRO_CONSTANT).toBe(6.02214076e23); // mol⁻¹ exact
    expect(MOLAR_MASS_CO2).toBeCloseTo(44.0095, 3);
    expect(MOLAR_MASS_CARBON).toBeCloseTo(12.011, 3);
    expect(CO2_TO_C_RATIO).toBeCloseTo(3.6641, 3);
    expect(GAS_CONSTANT_R).toBeCloseTo(8.31446, 4);
  });
});

describe('Conversions d’Unités Spectroscopiques', () => {
  it('convertit le nombre d’onde (cm⁻¹) en longueur d’onde (µm) et réciproquement', () => {
    // 15 µm <-> 666.667 cm⁻¹
    const nu15 = wavelengthMicronsToWavenumber(15.0);
    expect(nu15).toBeCloseTo(666.667, 2);
    expect(wavenumberToWavelengthMicrons(nu15)).toBeCloseTo(15.0, 3);

    // 4.3 µm <-> 2325.58 cm⁻¹
    const nu43 = wavelengthMicronsToWavenumber(4.3);
    expect(nu43).toBeCloseTo(2325.58, 1);
    expect(wavenumberToWavelengthMicrons(nu43)).toBeCloseTo(4.3, 3);

    // Centre de la bande fondamentale ν₂ : 667.38 cm⁻¹
    const lambdaCenter = wavenumberToWavelengthMicrons(667.38);
    expect(lambdaCenter).toBeCloseTo(14.984, 3);
  });

  it('gère correctement les valeurs limites pour le nombre d’onde', () => {
    expect(wavenumberToWavelengthMicrons(0)).toBe(0);
    expect(wavenumberToWavelengthMicrons(-10)).toBe(0);
    expect(wavelengthMicronsToWavenumber(0)).toBe(0);
    expect(wavelengthMicronsToWavenumber(-5)).toBe(0);
  });

  it('convertit le nombre d’onde (cm⁻¹) en fréquence (THz)', () => {
    // f = c * nu * 100 / 1e12 = (c / 1e10) * nu
    // Pour nu = 667.38 cm⁻¹ : f ~ 2.99792458e-2 * 667.38 ~ 20.0075 THz
    const fTHz = wavenumberToFrequencyTHz(667.38);
    expect(fTHz).toBeCloseTo(20.0075, 3);

    // Réciprocité
    const nuBack = frequencyTHzToWavenumber(fTHz);
    expect(nuBack).toBeCloseTo(667.38, 2);
  });
});

describe('Densité Moléculaire & Loi des Gaz Parfaits', () => {
  it('calcule la densité moléculaire de l’air selon la loi des gaz parfaits', () => {
    // Conditions standard : P = 1 atm (101325 Pa), T = 296 K (HITRAN standard)
    // n = P / (k_B * T) = 101325 / (1.380649e-23 * 296) * 1e-6 ~ 2.479e19 molécules / cm³
    const n = molecularNumberDensity(1.0, 296.0);
    expect(n).toBeGreaterThan(2.4e19);
    expect(n).toBeLessThan(2.55e19);
    expect(n).toBeCloseTo(2.4794e19, -15);
  });

  it('calcule la densité moléculaire de CO2 pour une concentration en ppm', () => {
    // À 420 ppm sous 1 atm et 296 K
    const nCO2 = ppmToMoleculesPerCm3(420, 1.0, 296.0);
    const nAir = molecularNumberDensity(1.0, 296.0);
    expect(nCO2).toBeCloseTo(nAir * 420e-6, -12);
  });

  it('vérifie la proportionnalité de la densité avec la pression et l’inverse de la température', () => {
    const n1 = molecularNumberDensity(1.0, 300);
    const n2 = molecularNumberDensity(2.0, 300);
    expect(n2 / n1).toBeCloseTo(2.0, 4);

    const nCold = molecularNumberDensity(1.0, 200);
    expect(nCold / n1).toBeCloseTo(300 / 200, 4);
  });
});

describe('Conversions de Flux de Carbone', () => {
  it('convertit les µmol CO₂/(m²·s) en gC/(m²·jour) selon la masse molaire du carbone', () => {
    // 1 µmol CO2 / (m²·s) = 1e-6 * 12.011 * 86400 gC / (m²·jour) ~ 1.03775 gC / (m²·jour)
    const gC = fluxUmolPerM2sToGCPerM2day(1.0);
    expect(gC).toBeCloseTo(1.03775, 4);

    // Réciprocité
    const umolBack = fluxGCPerM2dayToUmolPerM2s(gC);
    expect(umolBack).toBeCloseTo(1.0, 4);
  });

  it('préserve le signe des flux (photosynthèse négative / respiration positive)', () => {
    expect(fluxUmolPerM2sToGCPerM2day(-5.0)).toBeCloseTo(-5.18875, 4);
    expect(fluxUmolPerM2sToGCPerM2day(0)).toBe(0);
  });
});
