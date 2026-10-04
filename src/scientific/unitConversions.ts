/**
 * Bibliothèque rigoureuse de conversions d'unités physiques et atmosphériques.
 * Chaque fonction documente les constantes fondamentales CODATA et hypothèses physiques.
 */

// Vitesse de la lumière dans le vide (m/s)
export const SPEED_OF_LIGHT = 299792458;

// Masse molaire du CO2 (g/mol) et du Carbone pur (g/mol)
export const MOLAR_MASS_CO2 = 44.0095;
export const MOLAR_MASS_CARBON = 12.011;
export const CO2_TO_C_RATIO = MOLAR_MASS_CO2 / MOLAR_MASS_CARBON; // ~3.6641

// Constante des gaz parfaits (J/(mol·K) = Pa·m³/(mol·K))
export const GAS_CONSTANT_R = 8.314462618;

// Nombre d'Avogadro (molécules/mol)
export const AVOGADRO_CONSTANT = 6.02214076e23;

// Constante de Boltzmann (J/K)
export const BOLTZMANN_CONSTANT = 1.380649e-23;

// Constante de Planck (J·s)
export const PLANCK_CONSTANT = 6.62607015e-34;

/**
 * Nombre d'onde (cm⁻¹) -> Longueur d'onde (µm)
 * λ = 10000 / ν
 */
export function wavenumberToWavelengthMicrons(wavenumberCm1: number): number {
  if (wavenumberCm1 <= 0) return 0;
  return 10000 / wavenumberCm1;
}

/**
 * Longueur d'onde (µm) -> Nombre d'onde (cm⁻¹)
 * ν = 10000 / λ
 */
export function wavelengthMicronsToWavenumber(wavelengthMicrons: number): number {
  if (wavelengthMicrons <= 0) return 0;
  return 10000 / wavelengthMicrons;
}

/**
 * Nombre d'onde (cm⁻¹) -> Fréquence (THz)
 * f = c * ν_cm * 100 / 1e12 = (c / 1e10) * ν
 */
export function wavenumberToFrequencyTHz(wavenumberCm1: number): number {
  return (SPEED_OF_LIGHT / 1e10) * wavenumberCm1;
}

/**
 * Fréquence (THz) -> Nombre d'onde (cm⁻¹)
 */
export function frequencyTHzToWavenumber(frequencyTHz: number): number {
  return (frequencyTHz * 1e10) / SPEED_OF_LIGHT;
}

/**
 * Densité moléculaire de l'air n (molécules / cm³) par la loi des gaz parfaits
 * n = (P / (k_B * T)) * 1e-6
 * P en atm converti en Pa (1 atm = 101325 Pa)
 */
export function molecularNumberDensity(pressureAtm: number, temperatureK: number): number {
  const pressurePa = pressureAtm * 101325;
  const moleculesPerM3 = pressurePa / (BOLTZMANN_CONSTANT * temperatureK);
  return moleculesPerM3 * 1e-6; // molécules / cm³
}

/**
 * Fraction molaire ppm (µmol/mol) -> Nombre de molécules de CO2 / cm³
 */
export function ppmToMoleculesPerCm3(
  ppm: number,
  pressureAtm: number,
  temperatureK: number
): number {
  const totalDensity = molecularNumberDensity(pressureAtm, temperatureK);
  return totalDensity * (ppm * 1e-6);
}

/**
 * Conversions de flux de CO2 :
 * µmol CO₂ / (m²·s) -> gC / (m²·jour)
 * 1 µmol = 1e-6 mol
 * 1 mol CO2 contient 12.011 g de C
 * 1 jour = 86400 s
 */
export function fluxUmolPerM2sToGCPerM2day(fluxUmol: number): number {
  return fluxUmol * 1e-6 * MOLAR_MASS_CARBON * 86400; // ~1.03775 * fluxUmol
}

/**
 * gC / (m²·jour) -> µmol CO₂ / (m²·s)
 */
export function fluxGCPerM2dayToUmolPerM2s(fluxGC: number): number {
  return fluxGC / (1e-6 * MOLAR_MASS_CARBON * 86400);
}

/**
 * Mt CO₂ / an -> Gt C / an
 * 1 Mt CO2 = 1e-3 Gt CO2
 * Gt C = Mt CO2 * 1e-3 / 3.6641
 */
export function mtCO2PerYearToGtCPerYear(mtCO2: number): number {
  return (mtCO2 * 1e-3) / CO2_TO_C_RATIO;
}

/**
 * Gt C / an -> Mt CO₂ / an
 */
export function gtCPerYearToMtCO2PerYear(gtC: number): number {
  return gtC * 1e3 * CO2_TO_C_RATIO;
}
