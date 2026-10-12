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

export type LineProfileType = 'Lorentz' | 'Doppler' | 'Voigt' | 'Pseudo-Voigt';

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
  absorbance: number;          // A(ν) = 1 - T (ou -ln(T))
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

/**
 * Types pour la batterie de validation scientifique du transfert radiatif
 */
export type ValidationCategory =
  | 'profile_integrals'
  | 'asymptotic_limits'
  | 'pt_dependence'
  | 'isotopologues'
  | 'beer_lambert_benchmarks'
  | 'radis_comparison';

export type ValidationQuantity = 'tau' | 'transmittance' | 'absorbance' | 'radiance';

export interface ValidationPointComparison {
  wavenumber: number;          // cm⁻¹
  calcTau: number;             // τ calculé par le moteur
  refTau: number;              // τ de référence (HITRAN / RADIS / analytique)
  calcT: number;               // T calculée
  refT: number;                // T de référence
  calcA: number;               // A calculée
  refA: number;                // A de référence
  calcRad: number;             // Radiance calculée (W/(m²·sr·cm⁻¹))
  refRad: number;              // Radiance de référence
  deltaT: number;              // T_calc - T_ref
  deltaTau: number;            // tau_calc - tau_ref
  deltaRad: number;            // rad_calc - rad_ref
}

export interface ValidationMetricStats {
  maxAbsError: number;
  rmse: number;
  meanRelativeErrorPct?: number;
  r2: number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
}

export interface ValidationTestCase {
  id: string;
  name: string;
  subtitle: string;
  category: ValidationCategory;
  referenceSource: 'HITRAN/HAPI' | 'RADIS' | 'Analytique' | 'TIPS-2021' | 'LBLRTM';
  description: string;
  physicalPhenomenon: string;
  formula: string;
  params?: Partial<BeerLambertParams>;
  tolerances: {
    maxAbsErrorT: number;
    rmseT: number;
    minR2: number;
  };
}

export interface ValidationTestResult {
  testCase: ValidationTestCase;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  executionTimeMs: number;
  pointsCount: number;
  metrics: {
    tau: ValidationMetricStats;
    transmittance: ValidationMetricStats;
    absorbance: ValidationMetricStats;
    radiance: ValidationMetricStats;
  };
  comparisonPoints: ValidationPointComparison[];
  scientificSummary: string;
  diagnosticNotes: string[];
}

export interface ValidationSuiteSummary {
  totalTests: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  overallStatus: 'VALIDATED' | 'NON_CONFORME';
  globalRMSETransmittance: number;
  globalMaxAbsErrorTransmittance: number;
  meanR2: number;
  executionTimestamp: string;
  engineVersion: string;
  voigtImplementation: 'Faddeeva (w(z) convolution exacte)' | 'Thompson-Cox-Hastings (Pseudo-Voigt)';
}
