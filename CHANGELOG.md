# CHANGELOG — Historique des Versions de Carbonor

Toutes les évolutions notables de l'application **Carbonor** sont consignées dans ce fichier.

---

## [2.6.0] — 2026-11-17

### ✨ Ajouté
- **Menu de Paramètres Système (`SystemSettingsModal`)** :
  - Affichage de la **date de sortie** (`17 novembre 2026`), du numéro de version (`v2.6.0`) et de la **date de dernière vérification** persistée.
  - Bouton **« Vérifier les mises à jour »** (interrogation `/api/system/version`, `/version.json` et `ServiceWorkerRegistration.update()`).
  - Bouton **« Forcer la mise à jour »** (purge des caches Workbox/navigateur, activation immédiate du Service Worker et rechargement).
  - **Système de mises à jour automatiques en arrière-plan** (`SystemSettingsContext`) : vérification silencieuse périodique (toutes les 15 min + au retour de focus) et installation automatique via `virtual:pwa-register`.
- **Onboarding Légal &amp; Clause de Non-Responsabilité (`LegalOnboardingModal`)** :
  - Écran d'accueil initial expliquant l'interface aux novices et incluant la **clause explicite de non-responsabilité** précisant que l'éditeur n'est pas responsable des données fournies dans l'application.
- **Onboarding Contextuel &amp; Infobulles Novices (`ContextualOnboardingBanner` + `FieldTooltip`)** :
  - Bannière contextuelle explicative sur **chacun des 17 écrans** (`ViewKey`), masquable par écran et réinitialisable depuis les paramètres.
  - Infobulles interactives **`?`** sur chaque champ de saisie, liste déroulante, curseur, case à cocher et sélecteur des modules applicatifs et du simulateur d'accueil.
- **Thème Clair (`Revue scientifique de jour`)** :
  - Nouvelle bascule Thème Sombre / Thème Clair (`ThemeContext`) accessible depuis la barre de navigation, l'accueil légal et les paramètres système, avec adaptation complète des jetons CSS, cartes, graphiques et popups Leaflet.
- **Logo Officiel &amp; Bouton « Installer l'application »** :
  - Création du logo vectoriel `public/logo.svg` et du composant `<BrandLogo />`.
  - Remplacement des libellés abrégés par un bouton clair **« Installer l'application »** pour mobile (iOS/Android) et desktop (Windows/macOS/Linux).
- **Documentation** : Mise à jour complète de `README.md` (logo, badges Markdown, icônes, captures d'écran), création de `CONTEXT.md` et `CHANGELOG.md`.

### 🔧 Modifié
- Activation de `devOptions.enabled: true` dans `vite.config.ts` pour `VitePWA` et ajout de `logo.svg` + `version.json` aux assets pré-cachés.
- Ajout de la route serveur `GET /api/system/version` (`Cache-Control: no-store`) dans `server.ts`.

---

## [2.5.0] — 2026-11-16

### 🎨 Refonte Éditoriale de la Page de Présentation
- Refonte complète de `LandingPageView.tsx` en architecture modulaire (`ui/` et `sections/`) dans l'esthétique *Observatoire de nuit / Revue scientifique*.
- Chargement typographique dédié (`Fraunces`, `IBM Plex Sans`, `IBM Plex Mono`) et centralisation des jetons de design `@theme` dans `src/index.css`.
- Réduction de la longueur de défilement via accordéons scientifiques, onglets de pipeline, frise épistémologique interactive et galerie Bento de captures d'écran réelles avec lightbox.

### 🛠️ Corrigé
- Démarrage non bloquant du serveur de développement : différé le pré-chargement réseau NOAA/NASA après `app.listen()` dans `server.ts`.

---

## [2.4.0] — 2026-11-15

### 🚀 Déploiement &amp; Ergonomie Navigation
- Préparation du dépôt pour **Cloudflare Pages** (`wrangler.toml`, alignement `esbuild` / Vite 8, `public/_redirects`, `public/_headers`, guide `CLOUDFLARE_DEPLOYMENT.md`).
- Simplification de la barre de navigation supérieure (`Navbar.tsx`) en 3 zones respirantes avec regroupement des contrôles avancés dans le menu **Outils**.
- Restriction de l'affichage du sélecteur **Mode Démo / Données réelles** aux écrans applicatifs internes (retiré de la landing page).

---

## [2.3.0] — 2026-11-12

### ✨ Ajouté
- Support complet PWA hors-ligne avec Workbox (`vite-plugin-pwa`), icônes 192px/512px/maskable, `OfflineIndicator` et `PWAInstallButton`.
- Augmentation de `maximumFileSizeToCacheInBytes` à 5 MiB pour garantir l'empaquetage des modules scientifiques.

---

## [2.2.0] — 2026-10-20

### 🔬 Validation Radiative &amp; Provenance
- Ajout du banc d'essai métrologique **Faddeeva True Voigt vs Pseudo-Voigt** (`RadiativeTransferValidationView.tsx`) et comparaison avec RADIS.
- Audit complet de traçabilité (`RealDataAuditView.tsx`) avec empreintes SHA-256 et horodatage UTC.
- Exports multi-formats (CSV, GeoJSON RFC 7946, NetCDF CF-1.8 CDL, SVG, PDF, NDJSON, JSON).

---

## [2.0.0] — 2026-10-05

### 🌐 Intégration Multi-Sources Authentiques
- Connexion aux pipelines NOAA GML/ERDDAP, ICOS Carbon Portal, NASA Earthdata CMR (OCO-2/OCO-3), Copernicus CAMS et inventaires CITEPA SECTEN.
- Mise en place du principe épistémologique strict (`MESURÉ ≠ OBSERVÉ ≠ ESTIMÉ ≠ MODÉLISÉ ≠ SIMULÉ`).

---

## [1.0.0] — 2026-09-15

### 🎉 Version Initiale
- Tableau de bord Courbe de Keeling, carte OpenStreetMap Leaflet, explorateur HITRAN et simulateur Beer-Lambert.
