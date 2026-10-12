# Sources de Données Officielles & Licences

| Source | Fournisseur | Catégorie | DOI Persistant | Licence | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GML In Situ** | NOAA / ESRL | MESURÉ | `10.15138/9N0H-ZH07` | NOAA Public Domain | Courbe de Keeling Mauna Loa, Barrow, Pôle Sud |
| **AirCore Profiling** | NOAA GML | MESURÉ | `10.15138/aircore-co2` | NOAA Public Domain | Profils stratosphériques (0–30 km) |
| **ICOS Atmosphere L2**| ICOS Carbon Portal | MESURÉ | `10.18160/icos-atmos-release-2026` | CC-BY-4.0 | Observatoires européens (Puy de Dôme, Traînou, OHP) |
| **OCO-2 Lite v11r** | NASA Earthdata | OBSERVÉ | `10.5067/EWSGQD2MI070` | NASA Open Access | $X_{\text{CO}_2}$ moyenne de colonne par réseau de diffraction |
| **CAMS Global IFS** | ECMWF / Copernicus | MODÉLISÉ | `10.24380/cams-co2-forecast` | Copernicus Free & Open | Réanalyses 3D, colonnes et flux d'inversion |
| **HITRAN 2020** | Harvard-Smithsonian CFA | SIMULÉ | `10.1016/j.jqsrt.2021.107949` | HITRAN Academic License | Transitions quantiques raie-par-raie |
| **Inventaire SECTEN**| CITEPA France | ESTIMÉ | `10.citepa/secten-2025` | Licence Ouverte Etalab v2.0 | Émissions nationales sectorielles |
| **Global Carbon Budget**| Global Carbon Project | ESTIMÉ | `10.5194/essd-global-carbon-budget-2025` | CC-BY-4.0 | Puits océaniques, terrestres et bilan mondial |

Toutes les données sont issues de programmes scientifiques ouverts et vérifiées. Aucun jeu de données propriétaire non autorisé n'est utilisé.

---

## Double Régime Opérationnel et Transparence Déontologique

Afin de garantir la crédibilité académique de Carbonor et d'éviter qu'un utilisateur n'assimile des échantillons locaux à des requêtes satellitaires exécutées en direct à la volée :

1. 🟡 **MODE DÉMONSTRATION (Défaut hors-ligne / pédagogique)**
   - **Nature :** Données d'exemple / fixtures scientifiques embarquées.
   - **Provenance :** Échantillons et sous-ensembles réels d'archives ouvertes préenregistrés (NOAA GML, NASA CMR, ICOS, HITRAN).
   - **Garantie :** Aucune requête réseau externe n'est imposée ; visualisations instantanées et fiables même hors-ligne.

2. 🟢 **MODE DONNÉES RÉELLES (Production métrologique)**
   - **Nature :** Données récupérées auprès de la source officielle.
   - **Provenance :** Téléchargement direct ou synchronisé avec les APIs distantes (NASA CMR/GES DISC, NOAA ERDDAP, ICOS Sparql/ATC, Copernicus ADS).
   - **Garantie :** Certificat métrologique complet ISO/IEC 17025 avec horodatage effectif (`retrievedAt`), période de validité (`validFrom`/`validTo`), empreinte cryptographique SHA-256 et âge de cache certifié.

