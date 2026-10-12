import { describe, it, expect } from 'vitest';
import { SpectroscopyEngine } from '../../src/scientific/spectroscopyEngine';
import { RadiativeTransferValidator } from '../../src/scientific/radiativeTransferValidation';
import { HitranHapiProvider } from '../../src/providers/hitranHapiProvider';
import { NoaaErddapProvider } from '../../src/providers/noaaProvider';
import { IcosProvider } from '../../src/providers/icosProvider';
import { OcoProvider } from '../../src/providers/ocoProvider';
import { CamsProvider } from '../../src/providers/camsProvider';

describe('Scénarios E2E : Parcours Utilisateur Complets', () => {
  describe('Scénario 1 : Exploration au Laboratoire Beer-Lambert & Forçage Radiatif', () => {
    it('simule le forçage radiatif du CO₂ entre niveau préindustriel (280 ppm) et actuel (420 ppm)', () => {
      // Étape 1 : Simulation 280 ppm (référence préindustrielle)
      const res280 = SpectroscopyEngine.simulateSpectrum({
        molecule: 'CO2',
        isotopologue: 'all',
        concentrationPpm: 280,
        temperatureK: 296,
        pressureAtm: 1.0,
        pathLengthMeters: 100,
        spectralResolutionCm1: 0.1,
        centerWavenumberCm1: 667.38,
        windowHalfWidthCm1: 20,
        profileType: 'Voigt'
      });

      // Étape 2 : Simulation 420 ppm (niveau actuel)
      const res420 = SpectroscopyEngine.simulateSpectrum({
        molecule: 'CO2',
        isotopologue: 'all',
        concentrationPpm: 420,
        temperatureK: 296,
        pressureAtm: 1.0,
        pathLengthMeters: 100,
        spectralResolutionCm1: 0.1,
        centerWavenumberCm1: 667.38,
        windowHalfWidthCm1: 20,
        profileType: 'Voigt'
      });

      // Étape 3 : Vérification de la physique du forçage radiatif
      // Le cœur de la bande 15 µm est saturé dans les deux cas (T=0)
      const center280 = res280.points.find(p => Math.abs(p.wavenumber - 667.38) < 0.1);
      const center420 = res420.points.find(p => Math.abs(p.wavenumber - 667.38) < 0.1);
      expect(center280?.transmittance).toBe(0);
      expect(center420?.transmittance).toBe(0);

      // L'absorption supplémentaire se produit dans les ailes semi-transparentes
      expect(res420.meanTransmittance).toBeLessThan(res280.meanTransmittance);
      expect(res420.saturatedLinesCount).toBeGreaterThanOrEqual(res280.saturatedLinesCount);
    });
  });

  describe('Scénario 2 : Audit & Validation Métrologique du Transfert Radiatif', () => {
    it('exécute le banc d’essai, confirme 100% de succès métrologique et génère le rapport d’audit', () => {
      // Étape 1 : Lancement de la batterie
      const suite = RadiativeTransferValidator.runFullValidationSuite();

      // Étape 2 : Vérification du statut global et des indicateurs de conformité
      expect(suite.summary.overallStatus).toBe('VALIDATED');
      expect(suite.summary.failedCount).toBe(0);
      expect(suite.summary.passedCount).toBe(8);

      // Étape 3 : Vérification que chaque résultat comporte ses résidus et points comparatifs
      suite.results.forEach(res => {
        expect(res.status).toBe('PASSED');
        expect(res.comparisonPoints.length).toBeGreaterThan(0);
        expect(res.scientificSummary).toBeDefined();
        expect(res.diagnosticNotes.length).toBeGreaterThan(0);
      });

      // Étape 4 : Validation du format du rapport d’audit exportable
      const auditExport = {
        summary: suite.summary,
        tests: suite.results.map(r => ({
          name: r.testCase.name,
          rmse: r.metrics.transmittance.rmse,
          r2: r.metrics.transmittance.r2,
          status: r.status
        }))
      };

      expect(auditExport.summary.totalTests).toBe(8);
      expect(auditExport.tests.length).toBe(8);
    });
  });

  describe('Scénario 3 : Explorateur de Raies & Filtrage Quantique Isotope', () => {
    it('permet de basculer entre mode embarqué et mode scientifique HAPI avec filtrage isotopique', async () => {
      // Mode Embarqué
      const embedded = HitranHapiProvider.getEmbeddedLines();
      expect(embedded.length).toBeGreaterThan(2000);

      // Mode Scientifique HAPI : requête filtrée sur ¹³C¹⁶O₂ (636)
      const hapi636 = await HitranHapiProvider.queryHapi({
        isotopologue: '636',
        branch: 'ALL',
        numin: 645,
        numax: 655
      });

      expect(hapi636.lines.length).toBeGreaterThan(0);
      hapi636.lines.forEach(l => {
        expect(l.isotopologue).toBe('636');
        expect(l.isotopologueName).toBe('¹³C¹⁶O₂');
      });
    });
  });

  describe('Scénario 4 : Observatoire Climat Multi-Échelles (Sol, Satellite, Modèle)', () => {
    it('vérifie l’intégrité des 4 couches de données du cycle du carbone', async () => {
      // 1. Sol (NOAA & ICOS)
      const noaaStations = await NoaaErddapProvider.getStations();
      expect(noaaStations.length).toBeGreaterThan(0);

      // 2. Satellite (NASA OCO-2)
      const ocoSoundings = await OcoProvider.getXCO2('Europe-France');
      expect(Array.isArray(ocoSoundings)).toBe(true);

      // 3. Modèle / Inversion (Copernicus CAMS)
      const camsFluxes = await CamsProvider.getSurfaceFlux();
      expect(Array.isArray(camsFluxes)).toBe(true);

      // 4. Profils Verticaux CAMS
      const verticalProf = await CamsProvider.getVerticalConcentration(48.85, 2.35);
      expect(verticalProf).toBeDefined();
      expect(verticalProf.maxAltitudeKm).toBeGreaterThan(20);
    });
  });
});
