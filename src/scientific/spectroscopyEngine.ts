import { BeerLambertParams, LineProfileType, SimulationResult, SpectralLine, SpectralPoint } from '../types/spectroscopy';
import { HITRAN_CO2_LINES } from './hitranData';
import {
  BOLTZMANN_CONSTANT,
  MOLAR_MASS_CO2,
  PLANCK_CONSTANT,
  ppmToMoleculesPerCm3,
  SPEED_OF_LIGHT,
  wavenumberToFrequencyTHz,
  wavenumberToWavelengthMicrons
} from './unitConversions';

/**
 * Moteur de calcul spectroscopique et transfert radiatif raie-par-raie.
 * Résout l'équation de transfert radiatif : dI_ν / ds = - α_ν * I_ν + j_ν
 */
export class SpectroscopyEngine {
  private static T_REF = 296.0; // Température de référence HITRAN (K)

  /**
   * Calcule la demi-largeur Doppler à mi-hauteur (HWHM) α_D en cm⁻¹
   * α_D = (ν₀ / c) * sqrt( 2 * k_B * T * ln(2) / M_mol )
   */
  public static calculateDopplerWidth(wavenumberCm1: number, temperatureK: number): number {
    const massKgPerMolecule = (MOLAR_MASS_CO2 * 1e-3) / 6.02214076e23;
    const cCmPerSec = SPEED_OF_LIGHT * 100;
    const factor = Math.sqrt((2 * BOLTZMANN_CONSTANT * temperatureK * Math.LN2) / massKgPerMolecule);
    return (wavenumberCm1 / cCmPerSec) * factor;
  }

  /**
   * Calcule la demi-largeur Lorentz à mi-hauteur (HWHM) α_L en cm⁻¹
   * α_L = (T_ref / T)^n * [ γ_air * (p - p_self) + γ_self * p_self ]
   */
  public static calculateLorentzWidth(
    line: SpectralLine,
    pressureAtm: number,
    temperatureK: number,
    concentrationPpm: number
  ): number {
    const pSelf = pressureAtm * (concentrationPpm * 1e-6);
    const pAir = pressureAtm - pSelf;
    const tempFactor = Math.pow(this.T_REF / temperatureK, line.tempDependence);
    return tempFactor * (line.airWidth * pAir + line.selfWidth * pSelf);
  }

  /**
   * Facteur de correction de l'intensité intégrée S(T) selon la distribution de Boltzmann
   */
  public static adjustIntensityForTemperature(
    line: SpectralLine,
    temperatureK: number
  ): number {
    if (Math.abs(temperatureK - this.T_REF) < 0.1) return line.intensity;

    // Facteur d'énergie de Boltzmann : c2 = h * c / k_B (en cm·K)
    const c2 = (PLANCK_CONSTANT * SPEED_OF_LIGHT * 100) / BOLTZMANN_CONSTANT; // ~1.43877 cm·K
    const boltzmannFactor = Math.exp(-c2 * line.lowerEnergy * ((1 / temperatureK) - (1 / this.T_REF)));
    
    // Facteur de partition rotationnelle (approx Q_rot(T0)/Q_rot(T) = T0/T pour molécule linéaire CO2)
    const partitionFactor = this.T_REF / temperatureK;

    // Facteur d'émission stimulée
    const stimT = 1 - Math.exp((-c2 * line.wavenumber) / temperatureK);
    const stimRef = 1 - Math.exp((-c2 * line.wavenumber) / this.T_REF);
    const stimFactor = stimRef > 1e-6 ? stimT / stimRef : 1;

    return line.intensity * boltzmannFactor * partitionFactor * stimFactor;
  }

  /**
   * Évalue le profil de raie normalisé f(ν - ν₀) en cm (avec ∫ f(ν) dν = 1)
   */
  public static evaluateLineProfile(
    deltaNu: number,
    alphaD: number,
    alphaL: number,
    profileType: LineProfileType
  ): number {
    if (profileType === 'Doppler') {
      const cD = Math.sqrt(Math.LN2 / Math.PI) / alphaD;
      return cD * Math.exp(-Math.LN2 * Math.pow(deltaNu / alphaD, 2));
    }

    if (profileType === 'Lorentz') {
      return (1 / Math.PI) * (alphaL / (deltaNu * deltaNu + alphaL * alphaL));
    }

    // Profil de Voigt (Approximation pseudo-Voigt de Thompson-Cox-Hastings)
    // Largeur globale de Voigt f_V
    const fL = 2 * alphaL;
    const fD = 2 * alphaD;
    const fV = Math.pow(
      Math.pow(fD, 5) +
      2.69269 * Math.pow(fD, 4) * fL +
      2.42843 * Math.pow(fD, 3) * Math.pow(fL, 2) +
      4.47163 * Math.pow(fD, 2) * Math.pow(fL, 3) +
      0.07842 * fD * Math.pow(fL, 4) +
      Math.pow(fL, 5),
      0.2
    );
    const halfV = fV / 2;
    const eta = 1.36603 * (fL / fV) - 0.47719 * Math.pow(fL / fV, 2) + 0.11116 * Math.pow(fL / fV, 3);
    const clampedEta = Math.max(0, Math.min(1, eta));

    // Composante Lorentz
    const lComponent = (1 / Math.PI) * (halfV / (deltaNu * deltaNu + halfV * halfV));
    // Composante Gaussienne (Doppler)
    const dComponent = (Math.sqrt(Math.LN2 / Math.PI) / halfV) * Math.exp(-Math.LN2 * Math.pow(deltaNu / halfV, 2));

    return clampedEta * lComponent + (1 - clampedEta) * dComponent;
  }

  /**
   * Fonction de Planck B_ν(T) pour le rayonnement du corps noir
   * Unité : W / (m² · sr · cm⁻¹)
   */
  public static planckRadiance(wavenumberCm1: number, temperatureK: number): number {
    const nuM = wavenumberCm1 * 100; // m⁻¹
    const c = SPEED_OF_LIGHT;
    const h = PLANCK_CONSTANT;
    const kB = BOLTZMANN_CONSTANT;

    const exponent = (h * c * nuM) / (kB * temperatureK);
    if (exponent > 80) return 0; // Seuil de coupure numérique
    const denominator = Math.exp(exponent) - 1;
    if (denominator <= 0) return 0;

    // B_ν = (2 * h * c² * ν³) / (exp(h*c*ν/kT) - 1)
    const numerator = 2 * h * Math.pow(c, 2) * Math.pow(nuM, 3);
    return (numerator / denominator) * 100; // Conversion en par cm⁻¹
  }

  /**
   * Simulation complète du spectre par la loi de Beer-Lambert :
   * τ(ν) = ∑_i S_i(T) * f(ν - ν_0,i) * n_CO2 * L
   * T(ν) = exp(-τ(ν))
   */
  public static simulateSpectrum(params: BeerLambertParams): SimulationResult {
    // Filtrage des raies selon la fenêtre et l'isotopologue
    const halfWidth = params.windowHalfWidthCm1 || 20;
    const center = params.centerWavenumberCm1 || 667.38;
    const minWn = center - halfWidth;
    const maxWn = center + halfWidth;

    const lines = HITRAN_CO2_LINES.filter(l => {
      const matchIso = params.isotopologue === 'all' || l.isotopologue === params.isotopologue;
      const inWindow = l.wavenumber >= minWn - 5 && l.wavenumber <= maxWn + 5;
      return matchIso && inWindow;
    });

    // Densité moléculaire de CO2 (molécules / cm³)
    const nCO2 = ppmToMoleculesPerCm3(params.concentrationPpm, params.pressureAtm, params.temperatureK);
    
    // Trajet optique en cm (paramètre fourni en mètres)
    const pathCm = params.pathLengthMeters * 100;

    // Pas d'échantillonnage spectral
    const step = params.spectralResolutionCm1 || 0.05;
    const numPoints = Math.min(800, Math.max(100, Math.floor((maxWn - minWn) / step)));
    const actualStep = (maxWn - minWn) / numPoints;

    const points: SpectralPoint[] = [];
    let saturatedCount = 0;
    let sumOpticalDepth = 0;
    let sumTransmittance = 0;

    for (let i = 0; i <= numPoints; i++) {
      const nu = minWn + i * actualStep;
      let crossSection = 0; // cm² / molécule

      for (const line of lines) {
        // Décalage en pression de la raie
        const shiftedCenter = line.wavenumber + line.pressureShift * params.pressureAtm;
        const deltaNu = nu - shiftedCenter;
        
        // Largeur de coupure (wing cut-off) à 25 cm⁻¹ pour la performance
        if (Math.abs(deltaNu) > 25) continue;

        const alphaD = this.calculateDopplerWidth(line.wavenumber, params.temperatureK);
        const alphaL = this.calculateLorentzWidth(line, params.pressureAtm, params.temperatureK, params.concentrationPpm);
        const adjustedIntensity = this.adjustIntensityForTemperature(line, params.temperatureK) * line.abundanceFraction;

        const profileVal = this.evaluateLineProfile(deltaNu, alphaD, alphaL, params.profileType);
        crossSection += adjustedIntensity * profileVal;
      }

      // Profondeur optique sans dimension τ(ν) = σ(ν) * n * L
      const opticalDepth = crossSection * nCO2 * pathCm;
      const transmittance = Math.exp(-Math.min(50, opticalDepth));
      const absorbance = Math.min(20, opticalDepth); // Absorbance en log népérien
      const radiance = this.planckRadiance(nu, params.temperatureK) * (1 - transmittance);

      if (opticalDepth > 3.0) saturatedCount++; // Seuil de saturation optique (T < 5%)
      sumOpticalDepth += opticalDepth;
      sumTransmittance += transmittance;

      points.push({
        wavenumber: Number(nu.toFixed(3)),
        wavelength: Number(wavenumberToWavelengthMicrons(nu).toFixed(4)),
        frequency: Number(wavenumberToFrequencyTHz(nu).toFixed(3)),
        absorptionCoefficient: crossSection * nCO2, // en cm⁻¹
        opticalDepth: Number(opticalDepth.toFixed(4)),
        transmittance: Number(transmittance.toFixed(4)),
        absorbance: Number(absorbance.toFixed(4)),
        radiance: Number(radiance.toExponential(3))
      });
    }

    return {
      params,
      calculatedAt: new Date().toISOString(),
      totalIntegratedOpticalDepth: Number((sumOpticalDepth / points.length).toFixed(3)),
      meanTransmittance: Number((sumTransmittance / points.length).toFixed(3)),
      saturatedLinesCount: saturatedCount,
      points,
      activeLines: lines,
      theoreticalFormulas: {
        beerLambert: 'T(ν) = exp( - τ(ν) ) = exp( - ∫ k_ν(s) ρ(s) ds )',
        opticalDepth: 'τ(ν) = ∑_i S_i(T) · f(ν - ν₀,i) · n_CO2 · L',
        dopplerWidth: 'α_D = (ν₀ / c) · √( 2 · k_B · T · ln(2) / M )',
        lorentzWidth: 'α_L = (T₀ / T)^n · [ γ_air · (p - p_self) + γ_self · p_self ]',
        planckRadiance: 'B_ν(T) = 2 h c² ν³ / [ exp( h c ν / k_B T ) - 1 ]'
      }
    };
  }
}
