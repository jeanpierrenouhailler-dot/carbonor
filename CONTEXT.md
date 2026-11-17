# CONTEXT.md — Contexte Applicatif &amp; Architectural de Carbonor

> **Dernière mise à jour :** 17 novembre 2026 (`v2.6.0`)
> **Dépôt :** `https://github.com/jeanpierrenouhailler-dot/carbonor`
> **Auteur / Éditeur :** Jean-Pierre Nouhailler (Licence MIT)

---

## 1. Mission &amp; Identité du Projet

**Carbonor** est une Progressive Web App (PWA) scientifique dédiée à l'exploration, l'analyse et la pédagogie autour du dioxyde de carbone ($\text{CO}_2$) atmosphérique, depuis la physique moléculaire quantique jusqu'aux observations satellitaires et inventaires nationaux d'émissions.

### Principes Directeurs Immuables
1. **Rigueur Épistémologique** : distinction explicite dans toute l'interface entre :
   $$\text{MESURÉ} \neq \text{OBSERVÉ} \neq \text{ESTIMÉ} \neq \text{MODÉLISÉ} \neq \text{SIMULÉ}$$
2. **Double Régime Déontologique** (`DataModeContext`) : séparation stricte entre `DEMO` (fixtures scientifiques embarquées hors-ligne) et `REAL_DATA` (flux synchronisés depuis NOAA, ICOS, NASA, CAMS, HITRAN, CITEPA).
3. **Zéro Faux Positif Métrologique** : toute donnée est rattachée à sa provenance (DOI, licence, échelle `WMO-CO2-X2019`, horodatage UTC, empreinte SHA-256).
4. **Accessibilité Novice &amp; Expert** : grâce au mode Pédagogique/Expert, à l'**onboarding contextuel par écran**, aux **infobulles champ par champ (`FieldTooltip`)**, et aux modales scientifiques détaillées (`ScienceTooltip`).

---

## 2. Stack Technique &amp; Architecture

- **Frontend** : React 19 + TypeScript + Vite (`vite-plugin-pwa` / Workbox) + Tailwind CSS v4 (`@theme`).
- **Backend** : Serveur Express (`server.ts`) montant `vite.middlewares` en développement, servant les routes `/api/*` (NOAA, ICOS, OCO, CAMS, HITRAN, CITEPA, `/api/status`, `/api/system/version`) et les fichiers statiques en production.
- **Cartographie** : Leaflet + OpenStreetMap (tuiles Standard, Sombre CartoDB, Relief OpenTopoMap, Imagerie Esri Satellite).
- **Moteur Scientifique (`src/scientific/`)** :
  - Transfert radiatif raie-par-raie avec profil de Voigt exact par fonction de Faddeeva (`w(z)`).
  - Corrections thermodynamiques de Boltzmann + sommes de partition TIPS.
  - Conversions CODATA (`cm⁻¹ ↔ µm ↔ THz`), conversions de flux (`µmol/m²/s ↔ gC/m²/j`) et statistiques comparatives (biais, MAE, RMSE, Pearson $r$).
- **Tests** : Vitest (`tests/` — 14 suites, 100 tests couvrant la physique, les providers, les exports et l'interface).

---

## 3. Systèmes Clés Introduits en v2.6.0

### 3.1. Paramètres Système &amp; Mises à Jour Automatiques (`SystemSettingsContext` + `SystemSettingsModal`)
- **Métadonnées centralisées** : `src/config/appMeta.ts` + `public/version.json` + endpoint serveur `GET /api/system/version` (`Cache-Control: no-store`).
- **Champs affichés** :
  - Version courante (`v2.6.0`),
  - **Date de sortie** (`17 novembre 2026`),
  - **Date de la dernière vérification** (persistée dans `localStorage` sous `carbonor_last_update_check`).
- **Actions manuelles** :
  - **« Vérifier les mises à jour »** : interroge `/api/system/version`, `/version.json` et `ServiceWorkerRegistration.update()`.
  - **« Forcer la mise à jour »** : purge les caches navigateur/Workbox (`window.caches`), déclenche `SKIP_WAITING` via `updateSW(true)` et recharge proprement l'application.
- **Mises à jour automatiques en arrière-plan** :
  - Vérification silencieuse initiale après 6 secondes, polling toutes les 15 minutes (`900 000 ms`), et re-vérification à la reprise de focus (`visibilitychange` ≥ 5 min).
  - En cas de nouvelle version ou de `onNeedRefresh` Workbox, installation automatique en arrière-plan et affichage d'une notification discrète non bloquante.

### 3.2. Onboarding Légal &amp; Clause de Non-Responsabilité (`OnboardingContext` + `LegalOnboardingModal`)
- Affiché au premier lancement (persisté via `carbonor_legal_accepted_v1`), et réouvrable depuis le menu **Outils**, le modal **Paramètres Système** ou le **footer**.
- Contient la **clause explicite de non-responsabilité** indiquant que l'éditeur (`Jean-Pierre Nouhailler`) **n'est pas responsable des données fournies, affichées ou calculées dans l'application**, lesquelles proviennent d'organismes tiers ou de fixtures d'exemple et sont fournies « en l'état » à des fins pédagogiques et scientifiques.
- Requiert le cochage explicite de la case d'acceptation avant d'accéder à l'application.

### 3.3. Onboarding Contextuel &amp; Infobulles Champ par Champ
- **`ContextualOnboardingBanner`** (`src/components/onboarding/ContextualOnboardingBanner.tsx`) : encadré structuré (objectif de l'écran + 3 conseils pratiques) rendu automatiquement sur chacune des 17 vues (`ViewKey`), masquable par écran et réactivable globalement via **Paramètres Système** ou **Outils**.
- **`FieldTooltip`** (`src/components/common/FieldTooltip.tsx`) : infobulle accessible au survol, au focus et au clic, placée à côté de chaque champ de saisie, sélecteur, case à cocher, bouton de filtre et curseur dans tous les modules interactifs.

### 3.4. Thème Clair &amp; Thème Sombre (`ThemeContext`)
- Gestion centralisée dans `src/context/ThemeContext.tsx` (`'dark' | 'light'`, persisté dans `carbonor_theme`).
- Applique `data-theme="dark" | "light"` et la classe correspondante sur `<html>`, met à jour `<meta name="theme-color">`, et s'appuie sur les jetons `@theme` (`--color-obs-*`) ainsi que des règles CSS dédiées dans `src/index.css` pour garantir la lisibilité de toutes les vues, modales, graphiques et popups Leaflet en mode Clair comme en mode Sombre.

### 3.5. Identité Visuelle &amp; Installation PWA
- Logo SVG vectoriel (`public/logo.svg` + composant `<BrandLogo />`).
- Bouton explicite **« Installer l'application »** (`PWAInstallButton`) présent dans la barre supérieure, le menu Outils, les Paramètres Système et la section PWA de la page de présentation (compatible Android/Desktop via `beforeinstallprompt` et iOS/Safari via guide dédié).

---

## 4. Déploiement &amp; Hébergement

- **Cloudflare Pages** : fichier `wrangler.toml` configuré (`pages_build_output_dir = "dist"`, `compatibility_date`), `esbuild` aligné avec Vite 8, routes SPA via `public/_redirects` et en-têtes via `public/_headers`.
- **Serveur Full-Stack** : `server.ts` lance immédiatement l'écoute sur le port `3000` (`VITE_APP_PORT` / `PORT`) et diffère le pré-chargement réseau NOAA/NASA en arrière-plan (`setTimeout(..., 3000)`) pour garantir un démarrage instantané sans blocage.
