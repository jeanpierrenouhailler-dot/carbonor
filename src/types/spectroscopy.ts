/**
 * Types pour la spectroscopie moléculaire HITRAN / HAPI et transfert radiatif.
 */

export type VibrationalBranch = 'P' | 'Q' | 'R';

export interface SpectralLine {
  id: string;
  molecule: 'CO2' | 'H2O' | 'CH4' | 'N2O' | 'O3' | 'O2';
  isotopologue: string;        // '626' (12C16O2), '636' (13C16O2), '628' (12C16O18O)
  isotopologueName: string;    // '¹²C¹⁶O₂', '¹³C¹⁶O₂'
  abundanceFraction: number;   // 0.9842, 0.01106, 0.003947
  wavenumber: number;          // cm⁻¹ (ν₀)
  wavelengthMicrons: number;   // µm (λ = 10000 / ν₀)
  frequencyTHz: number;        // THz (f = c * ν₀ * 100 / 1e12)
  intensity: number;           // cm⁻¹ / (molecule · cm⁻²) à 296 K (S_ij)
  einsteinA: number;           // s⁻¹ (coefficient d'émission spontanée)
  airWidth: number;            // cm⁻¹ / atm (γ_air élargissement pression air)
  selfWidth: number;           // cm⁻¹ / atm (γ_self élargissement propre)
  lowerEnergy: number;         // cm⁻¹ (E'')
  tempDependence: number;      // sans unité (n_air)
  pressureShift: number;       // cm⁻¹ / atm (δ_air)
  upperVibrational: string;    // ex: '01¹0' ou '00⁰1'
  lowerVibrational: string;    // ex: '00⁰0'
  upperJ: number;              // J'
  lowerJ: number;              // J''
  branch: VibrationalBranch;   // P (ΔJ = -1), Q (ΔJ = 0), R (ΔJ = +1)
  bandDescription: string;     // ex: '15 µm (ν2 bending mode)' ou '4.3 µm (ν3 asymmetric stretch)'
}

export type LineProfileType = 'Lorentz' | 'Doppler' | 'Voigt';

export interface BeerLambertParams {
  molecule: string;
  isotopologue: string;        // 'all' | '626' | '636'
  concentrationPpm: number;    // ex: 280, 420, 1000 ppm
  temperatureK: number;        // ex: 296 K, 220 K (haute atmosphère)
  pressureAtm: number;         // ex: 1.0 atm (sol), 0.2 atm (tropopause)
  pathLengthMeters: number;    // ex: 10 m (cuve labo) ou 8400 m (colonne atmosphérique homogène)
  spectralResolutionCm1: number; // ex: 0.05 cm⁻¹
  centerWavenumberCm1: number; // centre spectral d'intérêt
  windowHalfWidthCm1: number;  // demi-largeur de la fenêtre
  profileType: LineProfileType;
}

export interface SpectralPoint {
  wavenumber: number;          // cm⁻¹
  wavelength: number;          // µm
  frequency: number;           // THz
  absorptionCoefficient: number; // cm⁻¹ (ou m⁻¹)
  opticalDepth: number;        // τ(ν) sans dimension
  transmittance: number;       // T(ν) = exp(-τ) [0 .. 1]
  absorbance: number;          // A(ν) = -ln(T) ou log10
  radiance: number;            // W / (m² · sr · cm⁻¹)
}

export interface SimulationResult {
  params: BeerLambertParams;
  calculatedAt: string;
  totalIntegratedOpticalDepth: number;
  meanTransmittance: number;
  saturatedLinesCount: number;
  points: SpectralPoint[];
  activeLines: SpectralLine[];
  theoreticalFormulas: {
    beerLambert: string;
    opticalDepth: string;
    dopplerWidth: string;
    lorentzWidth: string;
    planckRadiance: string;
  };
}
