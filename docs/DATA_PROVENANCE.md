# Traçabilité et Provenance Scientifique — CARBONOR

Ce document décrit les règles d'intégrité, de traçabilité métrologique et de qualification des données appliquées dans Carbonor.

## 1. Principe Épistémologique Fondamental

$$\text{MESURÉ} \neq \text{OBSERVÉ} \neq \text{ESTIMÉ} \neq \text{MODÉLISÉ} \neq \text{SIMULÉ}$$

| Catégorie | Signification | Sources dans Carbonor |
| :--- | :--- | :--- |
| **MESURÉ** (`MEASURED`) | Mesures physiques directes in situ | NOAA GML / ERDDAP (MLO, BRW, SMO, SPO, MKO, MHD, CGO), ICOS Carbon Portal (PUY, TRN, OHP, BIR, CMN), NOAA Aircraft |
| **OBSERVÉ** (`OBSERVED`) | Grandeurs inversées par télédétection | NASA OCO-2 & OCO-3 ($X_{\text{CO}_2}$ moyenne de colonne sèche) |
| **ESTIMÉ** (`ESTIMATED`) | Bilans sectoriels ou inversions atmosphériques | CITEPA SECTEN, Global Carbon Project, CAMS Surface Flux Inversion |
| **MODÉLISÉ** (`MODELED`) | Champs atmosphériques 3D assimilés par PNT | Copernicus CAMS IFS Cycle 49r1 (grilles 3D et colonnes intégrées) |
| **SIMULÉ** (`SIMULATED`) | Transfert radiatif & modèle quantique | Modèle spectroscopique Dunham-Hamiltonian / profils de Voigt & Beer-Lambert (paramètres HITRAN 2020) |

## 2. Régime Double : `REAL_DATA` vs `DEMO`

- **`🟢 MODE DONNÉES RÉELLES` (`REAL_DATA`)** :
  - Ne sert **jamais** de fixture de démonstration ni de constante codée en dur en cas d'absence de fichier.
  - Si un fichier local ou un flux distant est indisponible ou vide, l'API renvoie explicitement le statut `SOURCE_INDISPONIBLE` (code HTTP 503 ou champ station `status: 'SOURCE_INDISPONIBLE'`, sans valeur `currentCO2` inventée).
  - Les profils embarqués purement démonstratifs (ex. fixture AirCore statique client) sont exclus du flux `/api/profiles` en mode `REAL_DATA`.

- **`🟡 MODE DÉMONSTRATION` (`DEMO`)** :
  - Identifie explicitement toute donnée issue de fixtures ou sous-ensembles pédagogiques par `origin: 'DEMO'`, `dataMode: 'DEMO'` et `isRealData: false`.

## 3. Taxonomie des Origines (`DataOrigin`) & Fraîcheur (`DataFreshness`)

Chaque objet de provenance (`DataProvenance`) comporte :
- `origin` :
  - `LIVE_REMOTE` : donnée téléchargée en direct depuis le serveur officiel durant la session.
  - `REMOTE_CACHED` : donnée téléchargée depuis la source officielle et relue depuis `/cache/*` avec horodatage réel (`mtime` du fichier sur disque).
  - `LOCAL_ARCHIVE` : archive locale structurée (ex. tables CITEPA SECTEN archivées) ou fichier de référence.
  - `SIMULATED` : sortie calculée par équation physique (spectroscopie Dunham/Beer-Lambert/Voigt).
  - `DEMO` : jeu d'exemple / fixture embarquée.
- `freshness` :
  - `FRESH` : cache âgé de $\le 7$ jours.
  - `STALE` : cache âgé de $8$ à $30$ jours.
  - `EXPIRED` : cache âgé de $> 30$ jours.
  - `UNKNOWN` : date d'acquisition absente ou fichier indisponible.

## 4. Intégrité Cryptographique SHA-256 (FIPS 180-4)

- L'utilitaire `CacheService.computeChecksum()` implémente l'algorithme **SHA-256** conforme FIPS 180-4 (empreinte de 64 caractères hexadécimaux préfixée par `sha256:`).
- Le vecteur officiel sur chaîne vide `""` produit bien `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- Tous les pipelines (NOAA, ICOS, NASA OCO, CAMS) et exports (CSV, GeoJSON, NetCDF CDL, SVG, PDF, NDJSON, JSON) calculent cette empreinte à la volée sur les enregistrements exportés.

## 5. Limites Connues & Transparence

- **NASA Earthdata (OCO-2 / OCO-3)** : La synchronisation `/api/oco/sync` interroge en direct l'API publique NASA CMR (métadonnées de granules). Le téléchargement des fichiers complets NetCDF/HDF5 depuis GES DISC nécessite un compte Earthdata Login (`bearer token` / `.netrc`).
- **Copernicus CAMS ADS** : L'endpoint `/api/cams/sync` interroge le catalogue ADS public ; le téléchargement de champs 3D NetCDF/GRIB requiert une clé CDS/ADS API personnelle.
- **ICOS Carbon Portal** : Le test `/api/icos/sync` vérifie la joignabilité de l'endpoint SPARQL officiel et relit les fichiers `.CO2` présents sur disque dans `/cache/icos/`.
- **Exports NetCDF & Parquet** :
  - `exportToNetCdf()` génère un fichier **CDL (Common Data Language) conforme CF-1.8** prêt pour `ncgen`, et non un binaire HDF5/NetCDF-4 compilé côté navigateur.
  - `exportToParquet()` retourne un statut explicite `PARQUET_NOT_INSTALLED` (HTTP 501 sur `/api/export?format=parquet`) et oriente vers `exportToNdjson()` (compatible DuckDB / Pandas / Polars).
