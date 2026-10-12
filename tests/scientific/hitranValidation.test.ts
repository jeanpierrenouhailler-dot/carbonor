import { describe, it, expect } from 'vitest';
import { HITRAN_CO2_LINES, getHitranEssentialCount } from '../../src/scientific/hitranData';

describe('Base Spectroscopique HITRAN 2020 Embarquée', () => {
  it('contient une base riche de plusieurs milliers de raies essentielles', () => {
    const totalLines = HITRAN_CO2_LINES.length;
    expect(totalLines).toBeGreaterThan(2000);
    expect(getHitranEssentialCount()).toBe(totalLines);
  });

  it('couvre toutes les bandes vibrationnelles majeures du CO₂', () => {
    const bandDescriptions = new Set(HITRAN_CO2_LINES.map(l => l.bandDescription));
    expect(bandDescriptions.size).toBeGreaterThanOrEqual(6);

    const has15um = HITRAN_CO2_LINES.some(l => l.bandDescription.includes('15 µm'));
    const has43um = HITRAN_CO2_LINES.some(l => l.bandDescription.includes('4.3 µm'));
    const has27um = HITRAN_CO2_LINES.some(l => l.bandDescription.includes('2.7 µm'));
    const has16um = HITRAN_CO2_LINES.some(l => l.bandDescription.includes('1.61 µm') || l.bandDescription.includes('1.6 µm'));

    expect(has15um).toBe(true);
    expect(has43um).toBe(true);
    expect(has27um).toBe(true);
    expect(has16um).toBe(true);
  });

  it('comprend les trois isotopologues principaux avec leurs abondances certifiées', () => {
    const iso626 = HITRAN_CO2_LINES.filter(l => l.isotopologue === '626');
    const iso636 = HITRAN_CO2_LINES.filter(l => l.isotopologue === '636');
    const iso628 = HITRAN_CO2_LINES.filter(l => l.isotopologue === '628');

    expect(iso626.length).toBeGreaterThan(500);
    expect(iso636.length).toBeGreaterThan(500);
    expect(iso628.length).toBeGreaterThan(1000);

    // Abondances isotopiques naturelles certifiées HITRAN 2020
    expect(iso626[0].abundanceFraction).toBeCloseTo(0.9842, 4);
    expect(iso636[0].abundanceFraction).toBeCloseTo(0.01106, 4);
    expect(iso628[0].abundanceFraction).toBeCloseTo(0.003947, 5);
  });

  it('respecte strictement la règle de spin nucléaire de Bose-Einstein (J" pairs pour ¹²C¹⁶O₂)', () => {
    // Dans l'état fondamental 00⁰0 (Σ_g⁺) du CO₂ 626 centrosymétrique,
    // le spin des deux noyaux d'oxygène ¹⁶O étant nul (I = 0), seuls les états rotationnels
    // symétriques (J" pairs : 0, 2, 4...) sont permis.
    const ground626 = HITRAN_CO2_LINES.filter(l => l.isotopologue === '626' && l.lowerVibrational.startsWith('00'));
    const oddJ626 = ground626.filter(l => l.lowerJ % 2 !== 0);

    expect(oddJ626.length).toBe(0); // STRICTEMENT 0 raie impaire

    // Pour l'isotopologue asymétrique 628 (¹²C¹⁶O¹⁸O), la symétrie d'inversion est rompue :
    // les états pairs ET impairs doivent être présents.
    const lines628 = HITRAN_CO2_LINES.filter(l => l.isotopologue === '628');
    const oddJ628 = lines628.filter(l => l.lowerJ % 2 !== 0);
    const evenJ628 = lines628.filter(l => l.lowerJ % 2 === 0);

    expect(oddJ628.length).toBeGreaterThan(50);
    expect(evenJ628.length).toBeGreaterThan(50);
  });

  it('calcule des coefficients d’émission spontanée d’Einstein A physiquement réalistes', () => {
    const lines15um = HITRAN_CO2_LINES.filter(l => l.bandDescription.includes('15 µm'));
    const lines43um = HITRAN_CO2_LINES.filter(l => l.bandDescription.includes('4.3 µm'));

    // Pour la bande 15 µm : transitions dipolaires (A_ij ~ 0.0001 à 2 s⁻¹)
    lines15um.forEach(l => {
      expect(l.einsteinA).toBeGreaterThanOrEqual(0.0001);
      expect(l.einsteinA).toBeLessThan(10);
    });

    // Pour la bande 4.3 µm : transition très active (A_ij atteignant 10 à 37 s⁻¹)
    const veryStrong43 = lines43um.filter(l => l.intensity > 2e-18);
    expect(veryStrong43.length).toBeGreaterThan(20);
    veryStrong43.forEach(l => {
      expect(l.einsteinA).toBeGreaterThan(5);
      expect(l.einsteinA).toBeLessThan(50);
    });
    const maxA = Math.max(...lines43um.map(l => l.einsteinA));
    expect(maxA).toBeGreaterThan(25);
  });

  it('possède les branches rotationnelles P (ΔJ = -1), Q (ΔJ = 0) et R (ΔJ = +1)', () => {
    const pLines = HITRAN_CO2_LINES.filter(l => l.branch === 'P');
    const qLines = HITRAN_CO2_LINES.filter(l => l.branch === 'Q');
    const rLines = HITRAN_CO2_LINES.filter(l => l.branch === 'R');

    expect(pLines.length).toBeGreaterThan(500);
    expect(qLines.length).toBeGreaterThan(200);
    expect(rLines.length).toBeGreaterThan(500);

    // Vérification des règles de saut quantique ΔJ
    pLines.forEach(l => {
      expect(l.upperJ - l.lowerJ).toBe(-1);
    });
    qLines.forEach(l => {
      expect(l.upperJ - l.lowerJ).toBe(0);
    });
    rLines.forEach(l => {
      expect(l.upperJ - l.lowerJ).toBe(1);
    });
  });
});
