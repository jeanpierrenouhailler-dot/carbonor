/**
 * Types scientifiques fondamentaux pour l'Atmosphère & le Cycle du Carbone.
 * 
 * Principe fondamental :
 * MESURÉ ≠ OBSERVÉ ≠ ESTIMÉ ≠ MODÉLISÉ ≠ SIMULÉ
 */

export type ScientificDataCategory = 
  | 'MEASURED'   // Mesure physico-chimique in situ directe (sol, AirCore, tour, ballon)
  | 'OBSERVED'   // Observation satellitaire indirecte par spectrométrie (OCO-2, OCO-3, GOSAT, TCCON)
  | 'ESTIMATED'  // Flux et émissions déduits (inversion bayésienne atmosphérique, inventaires)
  | 'MODELED'    // Réanalyse et assimilation numérique 3D (Copernicus CAMS, ECMWF IFS)
  | 'SIMULATED'; // Transfert radiatif théorique raie-par-raie (HITRAN, Beer-Lambert)

export interface DataProvenance {
  source: string;              // 'NOAA GML' | 'ICOS Carbon Portal' | 'Copernicus CAMS' | 'NASA Earthdata / OCO-2' | 'HITRAN 2020'
  dataset: string;             // Nom précis du produit / granule
  version?: string;            // Version du jeu de données (ex: v11r, 2024.1)
  observedAt?: string;         // Timestamp d'acquisition ISO
  downloadedAt?: string;       // Timestamp de récupération/cache (rétrocompatibilité)
  retrievedAt?: string;        // Date et heure exacte du téléchargement depuis le serveur officiel
  validFrom?: string;          // Début de la période de validité de l'observation / réanalyse
  validTo?: string;            // Fin de la période de validité de l'observation
  expiresAt?: string;          // Date d'expiration nominale du cache (TTL)
  checksum?: string;           // Empreinte d'intégrité cryptographique (ex: sha256:... ou e-tag)
  requestParameters?: Record<string, any>; // Paramètres exacts de la requête API (lat, lon, filtres)
  quality?: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'SUSPECT' | string; // Qualification métrologique
  cacheAgeDays?: number;       // Âge du cache en jours au moment de la restitution
  isRealData?: boolean;        // Garantie de donnée réelle issue des réseaux scientifiques officiels
  dataMode?: 'DEMO' | 'REAL_DATA'; // 'DEMO' (données d'exemple / fixtures embarquées) ou 'REAL_DATA' (récupérées auprès de la source officielle)
  license: string;             // 'CC-BY-4.0' | 'Open Government / NOAA Public Domain' | 'Copernicus Free & Open'
  url?: string;                // URL vers le portail officiel
  doi?: string;                // Digital Object Identifier persistant
  method: string;              // Méthode métrologique (ex: CRDS, NDIR, Spectrométrie O2-A + WCO2 + SCO2)
  citation?: string;           // Référence bibliographique officielle
}

export interface ScientificObservation {
  id: string;
  source: string;
  dataset: string;
  category: ScientificDataCategory;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;           // en mètres au-dessus du niveau de la mer
  variable: string;            // 'co2_surface' | 'xco2' | 'co2_profile' | 'flux_nee' etc.
  value: number;
  unit: string;                // 'ppm' | 'µmol/mol' | 'µmol/(m²·s)' | 'gC/(m²·d)' | 'MtCO₂/an'
  uncertainty?: number;        // Incertitude 1-sigma standard
  qualityFlag?: string;        // '0' (Valid), '1' (Suspicious), '2' (Invalid)
  provenance: DataProvenance;
}

export interface Station {
  id: string;
  code: string;                // ex: 'MLO', 'PUY', 'BRW', 'SPO', 'TRN', 'OHP'
  name: string;
  country: string;
  network: 'NOAA' | 'ICOS' | 'WMO-GAW';
  latitude: number;
  longitude: number;
  altitude: number;            // m
  samplingInletHeights?: number[]; // [5, 50, 100, 180] pour Traînou tall tower
  currentCO2: number;          // ppm
  currentCO2Date: string;
  monthlyAverage: number;      // ppm
  yearlyAverage: number;       // ppm
  trendYearlyPpm: number;      // +2.4 ppm/an
  seasonalAmplitudePpm: number;// Amplitude crête-à-crête cycle biologique
  instrument: string;          // ex: 'Picarro G2401 CRDS', 'Siemens Ultramat-3 NDIR'
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  provenance: DataProvenance;
}

export interface XCO2Observation {
  observationId: string;
  soundingId?: string;         // Identifiant NASA sounding officiel 16 chiffres
  timestamp: string;
  latitude: number;
  longitude: number;
  xco2: number;                // ppm (colonne sèche)
  xco2Uncertainty: number;     // ppm (ex: ±0.65 ppm)
  qualityFlag: '0' | '1';      // '0' = Good (assimilation grade), '1' = Warn (filtré)
  satellite: 'OCO-2' | 'OCO-3';
  productVersion?: string;     // 'v11.3r Lite'
  surfaceType?: 'Land' | 'Ocean' | 'Ocean Glint' | 'Target' | 'Transition' | string;
  footprint: number;           // 1 à 8
  solarZenithAngle?: number;   // degrés
  surfacePressureHpa?: number; // hPa
  albedoStrongCO2?: number;    // réflectance 2.06 µm
  orbit?: number;
  operationMode?: string;      // 'Nadir', 'Glint', 'SAM'
  granuleTitle?: string;
  provenance: DataProvenance;
}

export interface ProfileLevel {
  altitudeKm: number;          // km
  pressureHpa: number;         // hPa
  co2Ppm: number;              // ppm
  temperatureK?: number;       // K
  uncertaintyPpm?: number;     // ppm
  qualityFlag?: string;
}

export interface VerticalProfile {
  id: string;
  stationOrLocation: string;
  date: string;
  type: 'AirCore' | 'Aircraft' | 'CAMS Model';
  category: ScientificDataCategory;
  latitude: number;
  longitude: number;
  maxAltitudeKm: number;
  levels: ProfileLevel[];
  provenance: DataProvenance;
}

export type ProviderConnectionStatus =
  | 'CONNECTED'      // Serveur externe interrogé et joignable avec succès (handshake réseau OK)
  | 'FETCHED'        // Données fraîches téléchargées en direct depuis l'API distante durant cette session
  | 'CACHED'         // Données servies depuis le cache disque certifié local (fichiers bruts vérifiés)
  | 'STALE'          // Données en cache dont l'âge dépasse le cycle nominal (> 30 jours sans rafraîchissement)
  | 'OFFLINE'        // Réseau distant injoignable ou machine hors-ligne (mode secours actif)
  | 'ERROR'          // Erreur HTTP (4xx/5xx) ou échec de désérialisation lors de la tentative distante
  | 'NOT_CONFIGURED';// Clé d'API ou jeton d'authentification manquant dans l'environnement

export interface DetailedProviderStatus {
  id: 'noaa' | 'icos' | 'nasa' | 'cams' | 'hitran' | 'citepa' | string;
  name: string;
  category: ScientificDataCategory;
  status: ProviderConnectionStatus;
  statusLabel: string;
  statusExplanation: string;
  url: string;
  license: string;
  doi: string;
  recordsCount: number;
  breakdown: {
    cachedRecords: number;
    liveRecords: number;
    embeddedRecords: number;
  };
  cacheInfo: {
    directory: string;
    filesCount: number;
    totalSizeBytes: number;
    lastModified: string | null;
    isStale: boolean;
    ageDays: number | null;
  };
  upstreamInfo: {
    endpoint: string;
    protocol: string;
    requiresAuth: boolean;
    authConfigured: boolean;
    authEnvVar?: string;
    networkStatus: 'CONNECTED' | 'OFFLINE' | 'ERROR' | 'UNTESTED';
    latencyMs?: number;
    lastLiveFetch: string | null;
    lastChecked?: string;
  };
}

export interface ProviderHealth {
  name: string;
  url: string;
  status: ProviderConnectionStatus | 'ONLINE' | 'CACHED' | 'DEGRADED' | 'OFFLINE';
  lastSync: string;
  license: string;
  doi: string;
  recordsCount: number;
  statusDetails?: string;
}

export interface SystemStatusResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  timestamp: string;
  activeDataMode?: 'DEMO' | 'REAL_DATA';
  activeDataModeLabel?: string;
  activeDataModeDescription?: string;
  principle: string;
  dataIntegrityStatement: string;
  summary: {
    totalProviders: number;
    connectedCount: number;
    fetchedCount: number;
    cachedCount: number;
    staleCount: number;
    offlineCount: number;
    notConfiguredCount: number;
    errorCount: number;
    totalRecords: number;
  };
  providers: DetailedProviderStatus[];
  downloads?: any[];
  icosAudit?: any;
  ocoAudit?: any;
}
