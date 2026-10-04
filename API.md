# Documentation de l'API Interne

Le serveur Express expose des routes normalisées répondant en JSON ou flux de téléchargement :

## 1. État des Fournisseurs
`GET /api/status`
- Retourne l'état de chaque fournisseur de données (ONLINE / CACHED / OFFLINE), la licence et le DOI officiel.

## 2. Stations de Mesure au Sol
`GET /api/stations?network=NOAA|ICOS`
- Retourne les métadonnées géographiques et métrologiques des stations (code, nom, pays, altitude, coordonnées, instrument).

## 3. Séries Temporelles de Surface
`GET /api/observations/surface?station=MLO&resolution=hourly|daily|monthly`
- `resolution=hourly` : Relevés continus des dernières 24 heures.
- `resolution=daily` : Relevés journaliers sur 90 jours.
- `resolution=monthly` : Série historique mensuelle complète (1958 à 2026).

## 4. Données Satellitaires OCO-2 & OCO-3
`GET /api/xco2?track=Europe-France|Global`
- Retourne les sondages individuels avec latitude, longitude, XCO2, incertitude, angle zénithal solaire, footprint et quality flag (0 ou 1).

## 5. Profils Verticaux
`GET /api/profiles`
- Retourne les profils AirCore (0–30 km), aéronef NOAA, réanalyse CAMS et mât tour de Traînou (5m, 50m, 100m, 180m).

## 6. Flux de Surface & Inversions
`GET /api/flux`
- Retourne les flux nets, puits biologiques (NEE), émissions anthropiques et flux déduits par inversion bayésienne CAMS.

## 7. Inventaires d'Émissions
`GET /api/emissions`
- Retourne les émissions sectorielles nationales (CITEPA) et le bilan mondial (GCP).

## 8. Spectroscopie HITRAN
`GET /api/spectroscopy/lines?band=15um|4um&branch=P|Q|R`
- Catalogue de transitions quantiques avec nombres d'onde $\nu_0$, intensités $S_{ij}$, et coefficients de demi-largeurs.

## 9. Simulateur Radiatif
`POST /api/spectroscopy/simulate`
- Corps de la requête : `{ concentrationPpm, temperatureK, pressureAtm, pathLengthMeters, profileType }`
- Retourne le profil spectral : transmittance $T(\nu)$, profondeur optique $\tau(\nu)$, absorbance et radiance.

## 10. Export de Données
`POST /api/export`
- Formats supportés : `csv`, `json`.
