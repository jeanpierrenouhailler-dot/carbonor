import { describe, it, expect } from 'vitest';
import { SpectroscopyEngine } from '../../src/scientific/spectroscopyEngine';
import { HITRAN_CO2_LINES } from '../../src/scientific/hitranData';
import { BeerLambertParams } from '../../src/types/spectroscopy';

const lineQ16 = HITRAN_CO2_LINES.find(l => Math.abs(l.wavenumber - 667.38) < 0.05 && l.lowerJ === 16) || HITRAN_CO2_LINES[0];

describe('Moteur de Calcul Spectroscopique (SpectroscopyEngine)', () => {
  describe('Demi-largeur Doppler α_D (Maxwell-Boltzmann)', () => {
    it('calcule la demi-largeur Doppler α_D à 296 K pour le CO₂', () => {
      // α_D = (ν₀ / c) * sqrt(2 * k_B * T * ln(2) / M)
      // Pour ν₀ = 667.38 cm⁻¹, T = 296 K : α_D ~ 0.000620 cm⁻¹
      const alphaD = SpectroscopyEngine.calculateDopplerWidth(667.38, 296.0);
      expect(alphaD).toBeGreaterThan(0.0005);
      expect(alphaD).toBeLessThan(0.001);
      expect(alphaD).toBeCloseTo(0.000620, 4);
    });

    it('vérifie la proportionnalité stricte α_D ∝ √T', () => {
      const aD200 = SpectroscopyEngine.calculateDopplerWidth(667.38, 200);
      const aD300 = SpectroscopyEngine.calculateDopplerWidth(667.38, 300);
      expect(aD300 / aD200).toBeCloseTo(Math.sqrt(300 / 200), 5);
    });

    it('vérifie la proportionnalité linéaire avec le nombre d’onde ν₀', () => {
      const aD_15um = SpectroscopyEngine.calculateDopplerWidth(667.38, 296);
      const aD_43um = SpectroscopyEngine.calculateDopplerWidth(2349.14, 296);
      expect(aD_43um / aD_15um).toBeCloseTo(2349.14 / 667.38, 4);
    });
  });

  describe('Demi-largeur Lorentz α_L (Collisions sous pression)', () => {
    it('calcule la demi-largeur Lorentz α_L proportionnelle à la pression', () => {
      const aL_1atm = SpectroscopyEngine.calculateLorentzWidth(lineQ16, 1.0, 296.0, 420);
      const aL_05atm = SpectroscopyEngine.calculateLorentzWidth(lineQ16, 0.5, 296.0, 420);
      expect(aL_1atm).toBeCloseTo(lineQ16.airWidth, 3);
      expect(aL_05atm).toBeCloseTo(aL_1atm / 2, 4);
    });

    it('vérifie la dépendance thermique en (T₀ / T)^n', () => {
      const aL_296 = SpectroscopyEngine.calculateLorentzWidth(lineQ16, 1.0, 296.0, 420);
      const aL_220 = SpectroscopyEngine.calculateLorentzWidth(lineQ16, 1.0, 220.0, 420);
      // Comme n ~ 0.76 > 0, à plus basse température la densité augmente et α_L augmente
      expect(aL_220).toBeGreaterThan(aL_296);
      expect(aL_220 / aL_296).toBeCloseTo(Math.pow(296.0 / 220.0, lineQ16.tempDependence), 4);
    });
  });

  describe('Sommes de Partition TIPS 2021 & Boltzmann S(T)', () => {
    it('calcule les sommes de partition TIPS pour CO₂ 626 conformes aux tables officielles', () => {
      const q200 = SpectroscopyEngine.calculatePartitionSum('626', 200);
      const q250 = SpectroscopyEngine.calculatePartitionSum('626', 250);
      const q296 = SpectroscopyEngine.calculatePartitionSum('626', 296);
      const q340 = SpectroscopyEngine.calculatePartitionSum('626', 340);

      // Valeurs TIPS 2021 certifiées : Q(200)~181.3, Q(296)~286.1, Q(340)~343.6
      expect(q200).toBeCloseTo(181.3, 0);
      expect(q250).toBeCloseTo(232.8, 0);
      expect(q296).toBeCloseTo(286.1, 0);
      expect(q340).toBeCloseTo(343.6, 0);
    });

    it('ajuste l’intensité S(T) selon la distribution de Boltzmann', () => {
      // À T = T_ref = 296 K, S(T) doit être égal à S(T_ref)
      const sRef = SpectroscopyEngine.adjustIntensityForTemperature(lineQ16, 296.0);
      expect(sRef).toBeCloseTo(lineQ16.intensity, 6);

      // À basse température, les raies d’énergie inférieure E" modérée voient leur population modifiée
      const sCold = SpectroscopyEngine.adjustIntensityForTemperature(lineQ16, 220.0);
      expect(sCold).toBeGreaterThan(0);
      expect(Number.isFinite(sCold)).toBe(true);
    });
  });

  describe('Profils de Raie : Faddeeva vs Pseudo-Voigt vs Doppler/Lorentz', () => {
    const aD = 0.05;
    const aL = 0.05;

    it('vérifie que les intégrales des profils sont unitaire (∫ f(ν) dν = 1.000000)', () => {
      const dopplerInt = SpectroscopyEngine.computeProfileIntegral('Doppler', aD, aL, 10);
      const lorentzInt = SpectroscopyEngine.computeProfileIntegral('Lorentz', aD, aL, 25);
      const faddeevaInt = SpectroscopyEngine.computeProfileIntegral('Voigt', aD, aL, 25);
      const pseudoVoigtInt = SpectroscopyEngine.computeProfileIntegral('Pseudo-Voigt', aD, aL, 25);

      expect(dopplerInt.integral).toBeCloseTo(1.000, 2);
      expect(lorentzInt.integral).toBeCloseTo(1.000, 2);
      expect(faddeevaInt.integral).toBeCloseTo(1.000, 2);
      expect(pseudoVoigtInt.integral).toBeCloseTo(1.000, 2);
    });

    it('quantifie l’écart du pseudo-Voigt de Thompson-Cox-Hastings par rapport au vrai Voigt de Faddeeva', () => {
      // Au centre (Δν = 0)
      const compCenter = SpectroscopyEngine.compareVoigtProfiles(0, aD, aL);
      expect(compCenter.relErrorPct).toBeLessThan(0.5); // Écart faible au sommet

      // Dans la zone de transition (Δν ~ α_D)
      const compTransition = SpectroscopyEngine.compareVoigtProfiles(0.05, aD, aL);
      // L'approximation pseudo-Voigt de Thompson-Cox-Hastings commet typiquement ~1.6% d'erreur
      expect(compTransition.relErrorPct).toBeGreaterThan(1.0);
      expect(compTransition.relErrorPct).toBeLessThan(2.5);
    });

    it('vérifie la symétrie exacte des profils autour du centre de raie', () => {
      const fPlus = SpectroscopyEngine.evaluateVoigtFaddeeva(0.12, aD, aL);
      const fMinus = SpectroscopyEngine.evaluateVoigtFaddeeva(-0.12, aD, aL);
      expect(fPlus).toBeCloseTo(fMinus, 6);
    });
  });

  describe('Rayonnement de Corps Noir de Planck B_ν(T)', () => {
    it('calcule la radiance spectrale de Planck positive et conforme', () => {
      // Pour ν = 667.38 cm⁻¹ (15 µm) à 296 K
      const bNu = SpectroscopyEngine.planckRadiance(667.38, 296.0);
      expect(bNu).toBeGreaterThan(0.1);
      expect(bNu).toBeLessThan(0.3);
      expect(bNu).toBeCloseTo(0.1437, 2);
    });

    it('tend vers 0 quand T tend vers 0', () => {
      const bCold = SpectroscopyEngine.planckRadiance(667.38, 10.0);
      expect(bCold).toBe(0);
    });
  });

  describe('Simulation Complète de Beer-Lambert (simulateSpectrum)', () => {
    it('renvoie T=1.0 (100% transmittance) pour un trajet nul L=0 m', () => {
      const params: BeerLambertParams = {
        molecule: 'CO2',
        isotopologue: 'all',
        concentrationPpm: 420,
        temperatureK: 296,
        pressureAtm: 1.0,
        pathLengthMeters: 0, // Trajet nul
        spectralResolutionCm1: 0.1,
        centerWavenumberCm1: 667.38,
        windowHalfWidthCm1: 5,
        profileType: 'Voigt'
      };

      const res = SpectroscopyEngine.simulateSpectrum(params);
      expect(res.meanTransmittance).toBe(1.0);
      expect(res.totalIntegratedOpticalDepth).toBe(0.0);
      expect(res.saturatedLinesCount).toBe(0);
      res.points.forEach(p => {
        expect(p.opticalDepth).toBe(0);
        expect(p.transmittance).toBe(1);
        expect(p.absorbance).toBe(0);
        expect(p.radiance).toBe(0);
      });
    });

    it('sature au cœur de la bande 15 µm sous conditions atmosphériques (T ≈ 0)', () => {
      const params: BeerLambertParams = {
        molecule: 'CO2',
        isotopologue: 'all',
        concentrationPpm: 420,
        temperatureK: 296,
        pressureAtm: 1.0,
        pathLengthMeters: 100, // 100 m
        spectralResolutionCm1: 0.1,
        centerWavenumberCm1: 667.38,
        windowHalfWidthCm1: 5,
        profileType: 'Voigt'
      };

      const res = SpectroscopyEngine.simulateSpectrum(params);
      const centerPt = res.points.find(p => Math.abs(p.wavenumber - 667.38) < 0.1);
      expect(centerPt).toBeDefined();
      expect(centerPt!.opticalDepth).toBeGreaterThan(10);
      expect(centerPt!.transmittance).toBe(0);
      expect(res.saturatedLinesCount).toBeGreaterThan(0);
    });
  });
});
