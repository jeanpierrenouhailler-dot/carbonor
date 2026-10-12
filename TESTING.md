# Suite Automatisée de Tests & Validation Scientifique (Vitest)

Ce document décrit l'architecture complète des tests automatisés du projet, structurée selon la pyramide de test scientifique :

```text
Vitest (Moteur de Test ESM / Node)
       ↓
tests unitaires          (tests/unit/)
       ↓
tests scientifiques      (tests/scientific/)
       ↓
tests providers          (tests/providers/)
       ↓
tests API                (tests/api/)
       ↓
tests intégration        (tests/integration/)
       ↓
tests E2E                (tests/e2e/)
```

---

## 1. Commandes d'Exécution

```bash
# Exécution complète de toute la suite
npm test

# Mode surveillance interactif (watch mode)
npm run test:watch

# Exécution ciblée par couche
npm run test:unit           # Tests unitaires (unitConversions, statistics, cacheService)
npm run test:scientific     # Tests scientifiques (spectroscopyEngine, hitranValidation, radiativeTransferBenchmarks)
npm run test:providers      # Tests des fournisseurs de données (hitranHapi, noaa, icos, oco, cams)
npm run test:api            # Tests des pipelines serveur et endpoints (/api/*)
npm run test:integration    # Tests d'intégration (spectroscopyPipeline, auditValidationWorkflow)
npm run test:e2e            # Tests de scénarios de bout en bout (userFlows)

# Vérification TypeScript
npm run lint
```

---

## 2. Détail des Couches de Tests

### A. Tests Unitaires (`tests/unit/`)
- `unitConversions.test.ts` :
  - Respect exact des constantes fondamentales CODATA 2022 ($c$, $h$, $k_B$, $N_A$, $R$, masses molaires).
  - Réciprocité exacte $\nu \leftrightarrow \lambda$ ($15\ \mu\text{m} \iff 666{,}667\ \text{cm}^{-1}$).
  - Conversion $\nu \leftrightarrow f$ ($667{,}38\ \text{cm}^{-1} \iff 20{,}0075\ \text{THz}$).
  - Densité moléculaire selon la loi des gaz parfaits ($n = P / [k_B T]$).
  - Conversions de flux de carbone : $1\ \mu\text{mol}/(\text{m}^2\cdot\text{s}) \iff 1{,}03775\ \text{gC}/(\text{m}^2\cdot\text{jour})$.
- `statistics.test.ts` :
  - Biais moyen, MAE, RMSE, Pearson $r \in [-1, 1]$, coefficient $R^2$.
  - Gestion des cas limites (séries vides, longueur asymétrique, anti-corrélation).
- `cacheService.test.ts` :
  - Persistance locale typée, isolation par préfixe, étiquetage de statut (`ONLINE`, `CACHED`, `DEGRADED`).

### B. Tests Scientifiques (`tests/scientific/`)
- `spectroscopyEngine.test.ts` :
  - Demi-largeur Doppler $\alpha_D(T) \propto \sqrt{T}$ et proportionnalité à $\nu_0$.
  - Demi-largeur Lorentz $\alpha_L(P, T) \propto P (T_0/T)^n$.
  - Intégrales unitaires des profils : $\int_{-\infty}^{+\infty} f(\nu)\,d\nu = 1{,}000000 \pm 10^{-5}$ (Doppler, Lorentz, Voigt Faddeeva, pseudo-Voigt).
  - Quantification de l'erreur intrinsèque du pseudo-Voigt de Thompson-Cox-Hastings ($\sim 1{,}61\ \%$ en transition).
  - Sommes de partition TIPS 2021 ($Q(T)$ à 200, 250, 296, 340 K) et loi de Boltzmann $S(T)$.
  - Radiance spectrale de Planck $B_\nu(T)$ et simulation raie-par-raie de Beer-Lambert.
- `hitranValidation.test.ts` :
  - Base embarquée de plus de 2 500 raies essentielles couvrant $15\ \mu\text{m}$, $4{,}3\ \mu\text{m}$, $2{,}7\ \mu\text{m}$, $2{,}0\ \mu\text{m}$ et $1{,}6\ \mu\text{m}$.
  - Abondances isotopiques certifiées : $^{12}\text{C}^{16}\text{O}_2$ ($98{,}42\ \%$), $^{13}\text{C}^{16}\text{O}_2$ ($1{,}106\ \%$), $^{12}\text{C}^{16}\text{O}^{18}\text{O}$ ($0{,}395\ \%$).
  - Règle de spin nucléaire de Bose-Einstein : états fondamentaux rotationnels $J''$ strictement pairs pour les molécules centrosymétriques à oxygène de spin nul ($I=0$).
  - Coefficients d'Einstein $A_{ij}$ physiquement réalistes.
- `radiativeTransferBenchmarks.test.ts` :
  - Exécution automatisée des 8 cas de test de validation métrologique contre RADIS, HITRAN HAPI, limites asymptotiques et saturation profonde ($\tau > 30$, $T \to 0$).
  - Vérification des critères de succès : $\text{RMSE}_T < 0{,}0015$, $R^2 > 0{,}9995$.

### C. Tests Providers (`tests/providers/`)
- `hitranHapiProvider.test.ts` :
  - Mode embarqué et mode scientifique HAPI dynamique.
  - Filtrage spectral $[ \nu_{\min}, \nu_{\max} ]$, filtrage isotopologue, sélection par branche vibrationnelle P/Q/R.
- `atmosphericDataProviders.test.ts` :
  - NOAA Global Monitoring Laboratory (séries mensuelles Mauna Loa WMO-CO2-X2019).
  - ICOS Carbon Portal (stations européennes, échelle ATC, métadonnées CC-BY-4.0).
  - NASA OCO-2/OCO-3 (sondages satellitaires $X\text{CO}_2$).
  - Copernicus CAMS (flux de surface et profils AirCore).
  - CITEPA (émissions territoriales et sectorielles SECTEN).

### D. Tests API & Serveur (`tests/api/`)
- `serverEndpoints.test.ts` :
  - Pipeline de données HITRAN serveur (`/api/hitran/query`).
  - Proxies de données NOAA, ICOS, CAMS et inventaires CITEPA.
  - Validation des formats JSON et des codes de réponse.

### E. Tests d'Intégration (`tests/integration/`)
- `spectroscopyPipeline.test.ts` :
  - Chaîne complète : Requête HAPI $\to$ extraction des raies $\to$ calcul thermodynamique $\to$ simulation Beer-Lambert $\to$ vérification de la conservation d'énergie $A(\nu) + T(\nu) = 1{,}0$.
  - Comparaison d'un doublement de $\text{CO}_2$ ($280\ \text{ppm} \to 560\ \text{ppm}$) et élargissement des ailes saturées.
- `auditValidationWorkflow.test.ts` :
  - Comparaison multi-sources NOAA / ICOS et contrôle de conformité à l'échelle WMO-CO2-X2019.

### F. Tests E2E (`tests/e2e/`)
- `userFlows.test.ts` :
  - Scénario 1 : Laboratoire Beer-Lambert et calcul du forçage radiatif.
  - Scénario 2 : Audit métrologique complet et génération de rapport JSON exportable.
  - Scénario 3 : Explorateur de raies et filtrage quantique d'isotopologues.
  - Scénario 4 : Observatoire global multi-couches (sol, satellite, modèle, inventaire).
