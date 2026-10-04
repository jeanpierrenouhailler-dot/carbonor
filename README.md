# CO₂ Atmosphère & Cycle du Carbone (PWA Scientifique)

Application web progressive (PWA) de référence pour l'exploration du dioxyde de carbone ($CO_2$) atmosphérique, de la spectroscopie moléculaire quantique jusqu'aux bilans de flux régionaux et planétaires.

## Principe Scientifique Fondamental

$$\text{MESURÉ} \neq \text{OBSERVÉ} \neq \text{ESTIMÉ} \neq \text{MODÉLISÉ} \neq \text{SIMULÉ}$$

- **MESURÉ (In Situ)** : Mesures physico-chimiques directes (analyseurs NDIR et CRDS Picarro G2401 au sol ou sous ballon AirCore).
- **OBSERVÉ (Remote Sensing)** : Inversion spectrométrique indirecte de la colonne totale par satellites NASA OCO-2 et OCO-3 ($X_{\text{CO}_2}$).
- **ESTIMÉ (Flux & Inversion)** : Flux déduits par assimilation inverse bayésienne ou inventaires comptables d'activité sectorielle (CITEPA, GIEC).
- **MODÉLISÉ (Modèles 3D)** : Champs météorologiques et chimiques réanalysés par Copernicus CAMS / ECMWF IFS.
- **SIMULÉ (Transfert Radiatif)** : Spectres théoriques synthétisés raie-par-raie selon la base HITRAN 2020 et la loi de Beer-Lambert.

---

## Fonctionnalités Principales

1. **Dashboard & Synthèse Planétaire** : Évolution séculaire de la courbe de Keeling (1958–2026), état des observatoires et santé des flux.
2. **Carte Interactive Multi-couches** : Géolocalisation des stations au sol NOAA/ICOS, traces orbitales et empreintes satellitaires OCO-2/3, champs CAMS.
3. **CO₂ au Sol In Situ** : Données horaires (24h), quotidiennes (90j) et historiques mensuelles pour Mauna Loa, Barrow, Pôle Sud, Puy de Dôme, etc.
4. **XCO₂ Satellitaire** : Sondages NASA OCO-2 / OCO-3 avec distinction formelle $X_{\text{CO}_2} \neq \text{sol}$, filtrage des quality flags (Good vs Warn) et incertitudes.
5. **Profils Verticaux** : Profils stratosphériques AirCore (0 à 30 km), spirales d'aéronefs NOAA et gradient nocturne de la tour de Traînou (180 m).
6. **Spectroscopie HITRAN 2020** : Explorateur de transitions avec nombres quantiques $J'', J'$, coefficients d'élargissement $\gamma_{\text{air}}, \gamma_{\text{self}}$ et énergies d'état inférieur $E''$.
7. **Visualisation Quantique P/Q/R** : Bandes à 15 µm ($\nu_2$) et 4.3 µm ($\nu_3$) avec axes synchronisés (Nombre d'onde $\text{cm}^{-1}$, Longueur d'onde $\mu\text{m}$, Fréquence $\text{THz}$) et décalage isotopique $^{13}\text{C}$.
8. **Laboratoire Virtuel Beer-Lambert** : Simulation interactive (280 à 1000 ppm, P, T, L) démontrant la saturation du cœur de bande et l'élargissement radiatif des ailes.
9. **Flux & Inversions CAMS** : Flux de surface nets, photosynthèse printanière (NEE), émissions fossiles et convertisseur universel d'unités de flux.
10. **Comparateur Multi-Sources** : Biais moyen, MAE, RMSE, corrélation de Pearson et avertissement sur les grandeurs non homogènes.
11. **Rapport Scientifique & Exports** : Génération de rapports certifiés avec DOI officiels et exports multi-formats (CSV, JSON).
12. **Conformité PWA** : Installable sur poste et mobile, service worker Workbox, indicateur de mode hors-ligne et persistance du cache local.

---

## Structure du Répertoire

```text
├── public/                 # Icônes PWA, Favicon et Manifeste Web
├── src/
│   ├── types/              # Modèles TypeScript scientifiques rigoureux
│   ├── scientific/         # Moteur spectroscopique raie-par-raie et conversions
│   ├── providers/          # Adaptateurs NOAA, ICOS, CAMS, NASA OCO et cache
│   ├── hooks/              # Hooks PWA (installation, connectivité)
│   ├── components/         # Composants UI, visualisations et inspecteurs
│   ├── App.tsx             # Point d'entrée React
│   └── main.tsx
├── server.ts               # Serveur Express full-stack avec APIs et Vite
└── documentation/          # Guides d'architecture, spectroscopie, API et tests
```

Consultez les fichiers de documentation dédiés : `ARCHITECTURE.md`, `DATA_SOURCES.md`, `SCIENTIFIC_METHODS.md`, `SPECTROSCOPY.md`, `API.md`, `DEPLOYMENT.md`, `TESTING.md`.
