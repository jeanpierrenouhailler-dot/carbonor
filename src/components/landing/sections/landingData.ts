import {
  Atom,
  BookOpen,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  MapPin,
  Radio,
  Satellite,
  Scale,
  ShieldCheck,
  Thermometer,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ViewKey } from '../../layout/Sidebar';
import type { EpistemologicalCategory } from '../ui/CategoryBadge';

export interface ScreenshotItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  description: string;
  targetView: ViewKey;
  highlights: string[];
}

export interface PillarItem {
  key: EpistemologicalCategory;
  stepNumber: string;
  category: string;
  shortLine: string;
  subtitle: string;
  icon: LucideIcon;
  sources: string;
  instruments: string;
  summary: string;
  invariants: string;
  examples: string;
  targetView: ViewKey;
}

export interface PipelineStep {
  num: string;
  title: string;
  shortTitle: string;
  desc: string;
  target: string;
  icon: LucideIcon;
}

export interface ScientificSourceItem {
  id: string;
  shortName: string;
  name: string;
  org: string;
  dataType: string;
  stations: string;
  frequency: string;
  standard: string;
  license: string;
  doi: string;
  link: string;
}

export interface BentoModuleItem {
  code: string;
  title: string;
  description: string;
  metricOrRule: string;
  targetView?: ViewKey;
  actionType?: 'report';
  category: EpistemologicalCategory;
  icon: LucideIcon;
  featured?: boolean;
  screenshot?: ScreenshotItem;
}

export interface MechanismItem {
  id: string;
  title: string;
  shortTitle: string;
  formula: string;
  explanation: string;
  keyTakeaway: string;
}

export interface AudienceItem {
  role: string;
  tag: string;
  description: string;
  icon: LucideIcon;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const HERO_STATS = [
  {
    label: 'Concentration globale au sol',
    numericValue: 426.5,
    decimals: 2,
    unit: 'ppm',
    source: 'NOAA Mauna Loa · WMO-X2019',
    category: 'measured' as EpistemologicalCategory,
  },
  {
    label: 'Moyenne colonne sèche XCO₂',
    numericValue: 422.31,
    decimals: 2,
    unit: 'ppm',
    source: 'NASA OCO-2 · ACOS v11',
    category: 'observed' as EpistemologicalCategory,
  },
  {
    label: 'Transitions quantiques CO₂',
    numericValue: 2551,
    decimals: 0,
    unit: 'raies',
    source: 'Base HITRAN 2020 · Harvard',
    category: 'simulated' as EpistemologicalCategory,
  },
  {
    label: "Réseau mondial d'observatoires",
    numericValue: 50,
    decimals: 0,
    suffix: '+',
    unit: 'stations',
    source: 'NOAA GML, ICOS, AirCore',
    category: 'measured' as EpistemologicalCategory,
  },
];

export const APP_SCREENSHOTS: ScreenshotItem[] = [
  {
    id: 'dashboard',
    title: 'Tableau de Bord & Keeling (1958–2026)',
    subtitle: 'Synthèse Métrologique Planétaire',
    category: 'Tableau de Bord',
    image: '/screenshots/dashboard_overview.jpg',
    description:
      'Visualisation séculaire de la courbe de Keeling (NOAA Mauna Loa) de 315 à 426 ppm, confrontation des indicateurs (Sol 425.30 ppm, Satellite XCO₂ 422.31 ppm, Modèle CAMS 423.24 ppm, 2 551 raies HITRAN) et cartouche spectroscopique à 15 µm.',
    targetView: 'dashboard',
    highlights: [
      'Courbe de Keeling continue 1958–2026 avec oscillation saisonnière de la biosphère',
      '4 indicateurs avec distinction stricte entre mesure, observation et modèle',
      'Cartouche spectroscopique de la bande fondamentale à 15 µm résolue raie-par-raie',
    ],
  },
  {
    id: 'map',
    title: 'Carte Interactive Multi-Réseaux',
    subtitle: 'Réseaux In Situ & Trace Orbitale OCO-2',
    category: 'Carte Interactive',
    image: '/screenshots/interactive_map_osm.jpg',
    description:
      "Cartographie Leaflet sur fond réel OpenStreetMap (styles Standard, Sombre, Topo, Satellite) croisant 50+ stations mondiales NOAA/ICOS, trace satellitaire avec sondages discrets OCO-2 et panneau d'inspection station (Puy de Dôme 1 465 m, 428.72 ppm).",
    targetView: 'map',
    highlights: [
      'Fond cartographique OpenStreetMap projeté en Web Mercator EPSG:3857',
      'Marqueurs de stations au sol interactifs avec métadonnées certifiées',
      'Trace orbitale NASA OCO-2 avec points de sondage et profil transversal',
    ],
  },
  {
    id: 'xco2',
    title: 'Télédétection Satellitaire XCO₂',
    subtitle: 'NASA OCO-2 & OCO-3 Lite Diagnostic',
    category: 'Télédétection',
    image: '/screenshots/satellite_xco2_orbit.jpg',
    description:
      'Couverture orbitale mondiale, profil transversal de latitude XCO₂, discrimination des 3 bandes spectrométriques (0.76 µm O₂-A, 1.61 µm WCO₂, 2.06 µm SCO₂), filtrage par Quality Flag (Flag 0 valide vs Flag 1 suspect) et analyse des 8 empreintes spatiales.',
    targetView: 'xco2',
    highlights: [
      "Fraction molaire de colonne moyenne d'air sec XCO₂ par spectrométrie SWIR",
      'Profil transversal de latitude montrant les gradients hémisphériques',
      "Filtrage strict par Quality Flag 0 et détection d'aérosols",
    ],
  },
  {
    id: 'spectroscopy',
    title: 'Laboratoire Virtuel de Transfert Radiatif',
    subtitle: 'Spectroscopie HITRAN 2020 & Beer-Lambert',
    category: 'Physique Moléculaire',
    image: '/screenshots/spectroscopy_lab.jpg',
    description:
      'Résolution quantique raie-par-raie de la molécule de CO₂ : branches P, Q centrale (667.4 cm⁻¹) et R de la bande à 15 µm, curseur de concentration 280 à 1000 ppm, calcul du forçage radiatif instantané et comparaison des profils de raie de Voigt.',
    targetView: 'spectroscopy-lab',
    highlights: [
      'Bande de flexion ν₂ à 15 µm (667 cm⁻¹) résolue avec 2 551 transitions HITRAN',
      'Calcul instantané du forçage ΔF = 5.35 ln(C/C₀) W/m²',
      'Décomposition des élargissements Doppler thermique et Lorentz collisionnel',
    ],
  },
];

export const EPISTEMOLOGY_PILLARS: PillarItem[] = [
  {
    key: 'measured',
    stepNumber: '01',
    category: 'MESURÉ',
    shortLine: 'Mesures physico-chimiques directes au sol par analyseurs calibrés.',
    subtitle: 'Mesures Physico-Chimiques In Situ Directes',
    icon: Thermometer,
    sources: 'NOAA GML · Observatoires ICOS · Réseau GAW/OMM',
    instruments: 'Spectromètres CRDS Picarro G2401 · Analyseurs NDIR · Échelle WMO-CO2-X2019',
    summary:
      "L'air ambiant entre physiquement dans une cellule optique de mesure. La concentration est déterminée par absorption infrarouge ou résonance en cavité optique fermée, étalonnée quotidiennement sur des gaz étalons primaires certifiés.",
    invariants:
      'Mesure directe de la fraction molaire au sol (ppm). Incertitude métrologique type : ± 0.12 ppm.',
    examples: 'Mauna Loa (3 397 m), Puy de Dôme (1 465 m), Mace Head, Barrow, Cape Grim, Pôle Sud.',
    targetView: 'surface',
  },
  {
    key: 'observed',
    stepNumber: '02',
    category: 'OBSERVÉ',
    shortLine: 'Inversions spectrales depuis l’espace sur toute la colonne d’air sec.',
    subtitle: 'Télédétection Indirecte par Inversion Spectrale',
    icon: Satellite,
    sources: 'NASA Earthdata · Satellites OCO-2 & OCO-3 (Science Team JPL)',
    instruments: 'Spectromètres à réseau haute résolution (0.76 µm O₂-A, 1.61 µm WCO₂, 2.06 µm SCO₂)',
    summary:
      "La lumière solaire réfléchie par la surface terrestre traverse deux fois toute l'épaisseur de l'atmosphère. L'atténuation spectrale est inversée par algorithme d'estimation optimale (ACOS v11) pour déduire la moyenne de colonne d'air sec XCO₂.",
    invariants:
      "XCO₂ n'est pas une concentration au sol : c'est une moyenne pondérée par la masse d'air sur toute l'épaisseur atmosphérique. Incertitude type : ± 1.2 ppm.",
    examples: 'Sondages orbitaux quotidiens, empreintes au sol de 1.29 × 2.25 km, diagnostic Flag 0/1.',
    targetView: 'xco2',
  },
  {
    key: 'estimated',
    stepNumber: '03',
    category: 'ESTIMÉ',
    shortLine: 'Flux nets inversés et bilans sectoriels comptables des territoires.',
    subtitle: 'Flux Inversés & Bilan Comptable Sectoriel',
    icon: Flame,
    sources: 'CITEPA (SECTEN) · Global Carbon Project · GIEC / CCNUCC',
    instruments: 'Transport inverse bayésien · Modèles de trafic COPERT · Inventaires CRF',
    summary:
      "Les émissions anthropiques et les flux biosphériques ne sont pas mesurables en continu sur chaque mètre carré du territoire. Ils sont estimés par modélisation statistique d'activités socio-économiques et par inversion du gradient atmosphérique.",
    invariants:
      'Estimations sectorielles réactualisées annuellement. Puits biosphériques calculés par bilan net.',
    examples: 'Inventaire national français 2026, puits forestier UTCATF (-28.4 Mt CO₂e), budget mondial.',
    targetView: 'flux',
  },
  {
    key: 'modeled',
    stepNumber: '04',
    category: 'MODÉLISÉ',
    shortLine: 'Champs 3D assimilés par modèles numériques météorologiques.',
    subtitle: 'Assimilation Numérique 3D & Réanalyses ECMWF',
    icon: Layers,
    sources: 'Copernicus CAMS · Centre Européen pour les Prévisions Météorologiques (ECMWF)',
    instruments: 'Modèle de circulation générale IFS Cycle 49r1 · Assimilation variationnelle 4D-Var',
    summary:
      "Résolution numérique tridimensionnelle des équations d'hydrodynamique atmosphérique couplées aux flux chimiques. Le modèle intègre des millions d'observations sol et satellites pour interpoler l'état global en tout point du globe.",
    invariants:
      "Grille tridimensionnelle discrétisée en mailles de 10 à 25 km, de la surface jusqu'à 10 hPa.",
    examples: 'Grille atmosphérique 3D Europe, profils barométriques verticaux, prévisions de transport.',
    targetView: 'compare',
  },
  {
    key: 'simulated',
    stepNumber: '05',
    category: 'SIMULÉ',
    shortLine: 'Calculs physiques quantiques des transitions moléculaires.',
    subtitle: 'Physique Moléculaire Ab Initio & Transfert Radiatif',
    icon: Atom,
    sources: 'Base HITRAN 2020 (Harvard-Smithsonian CfA) · Protocole HAPI',
    instruments: 'Spectroscopie quantique raie-par-raie (LBL) · Loi de Beer-Lambert · Profils de Voigt',
    summary:
      "Calcul des transitions de rotation-vibration de la molécule CO₂ à partir des nombres quantiques J, des coefficients d'élargissement par pression et des intensités de raie fondamentales.",
    invariants:
      '2 551 raies résolues dans les bandes fondamentales à 15 µm (ν₂) et 4.3 µm (ν₃).',
    examples: 'Calcul de transmittance spectrale T(ν) = exp(-τ(ν)), saturation du centre et ailes de Lorentz.',
    targetView: 'spectroscopy-lab',
  },
];

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    num: '01',
    title: 'Sources Scientifiques Officielles',
    shortTitle: 'Sources officielles',
    desc: 'Acquisition automatisée auprès des archives de référence : flux NOAA GML / ERDDAP, portail européen ICOS, métadonnées NASA Earthdata CMR, réanalyses Copernicus CAMS et paramètres spectroscopiques HITRAN.',
    target: 'NOAA · ICOS · NASA · ECMWF · HITRAN',
    icon: Database,
  },
  {
    num: '02',
    title: 'Collecte & Contrôle Cryptographique',
    shortTitle: 'Collecte & SHA-256',
    desc: "Chaque lot récupéré ou lu en cache disque reçoit son horodatage effectif (UTC), son indicateur d'origine (LIVE_REMOTE, REMOTE_CACHED, LOCAL_ARCHIVE) et son empreinte FIPS 180-4 SHA-256.",
    target: 'SHA-256 FIPS 180-4 · Horodatage UTC',
    icon: ShieldCheck,
  },
  {
    num: '03',
    title: 'Validation & Normalisation',
    shortTitle: 'Validation & Unités',
    desc: "Filtrage par drapeaux de qualité (Quality Flag 0 sur OCO-2, statuts ICOS validés) et normalisation vers les étalons internationaux WMO-CO2-X2019 (ppm) et cm⁻¹.",
    target: 'WMO-CO2-X2019 · Quality Flags',
    icon: Scale,
  },
  {
    num: '04',
    title: 'Traitement Physique & Statistique',
    shortTitle: 'Calculs scientifiques',
    desc: 'Calcul raie-par-raie selon Beer-Lambert, convolution de profils de Voigt (Doppler + Lorentz), intégration de colonne et métriques de comparaison (MBE, RMSE, corrélation).',
    target: 'Profils de Voigt · Biais & RMSE',
    icon: Cpu,
  },
  {
    num: '05',
    title: 'Visualisation Interactive',
    shortTitle: 'Interface analytique',
    desc: 'Cartographie Leaflet OpenStreetMap multi-réseaux, courbes de Keeling historiques, profils stratosphériques AirCore et spectres infrarouges interactifs.',
    target: 'Leaflet OSM · Graphiques réactifs',
    icon: Eye,
  },
  {
    num: '06',
    title: 'Intercomparaison & Exports Ouverts',
    shortTitle: 'Exports & Traçabilité',
    desc: "Confrontation Sol / Satellite / Modèle sans amalgame épistémologique et exports ouverts (CSV, GeoJSON RFC 7946, NetCDF CF-1.8 CDL, NDJSON, SVG, Rapport PDF).",
    target: 'NetCDF CF-1.8 · NDJSON · PDF',
    icon: Download,
  },
];

export const SCIENTIFIC_SOURCES: ScientificSourceItem[] = [
  {
    id: 'noaa',
    shortName: 'NOAA GML',
    name: 'NOAA Global Monitoring Laboratory',
    org: 'National Oceanic and Atmospheric Administration (États-Unis)',
    dataType: 'Mesures au sol continues in situ, carottes AirCore, flacons',
    stations: 'Mauna Loa, Barrow (Utqiaġvik), Pôle Sud, Samoa, Mace Head, Cape Grim',
    frequency: 'Horaire, quotidien, mensuel depuis 1958',
    standard: 'Échelle WMO-CO2-X2019 (référence mondiale OMM)',
    license: 'Domaine public gouvernemental américain (US Public Domain)',
    doi: 'doi:10.15138/9N0H-ZH07',
    link: 'https://gml.noaa.gov/ccgg/trends/',
  },
  {
    id: 'icos',
    shortName: 'ICOS ERIC',
    name: 'ICOS Carbon Portal',
    org: 'Integrated Carbon Observation System (Infrastructure Européenne ERIC)',
    dataType: 'Réseaux de tours à flux hautes, mesures in situ atmosphériques Classe 1 & 2',
    stations: 'Puy de Dôme, Tour de Traînou (5 à 180 m), Observatoire de Haute-Provence',
    frequency: 'Données quasi temps réel & séries validées L2',
    standard: 'Protocole ICOS ATC / Normes européennes labellisées',
    license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    doi: 'doi:10.18160/icos-atmos-release-2026',
    link: 'https://www.icos-cp.eu/',
  },
  {
    id: 'nasa',
    shortName: 'NASA OCO-2/3',
    name: 'NASA Earthdata / OCO-2 & OCO-3',
    org: 'Jet Propulsion Laboratory / NASA Goddard (États-Unis)',
    dataType: 'Colonnes moyennes de CO₂ (XCO₂) par spectrométrie proche infrarouge',
    stations: 'Orbite polaire héliosynchrone (OCO-2) et Station Spatiale ISS (OCO-3)',
    frequency: 'Revisite orbitale de 16 jours, granules CMR et sondages quotidiens',
    standard: 'ACOS Version 11 Lite Diagnostic (Quality Flag 0)',
    license: 'Politique Science Ouverte NASA (Open Data Policy)',
    doi: 'doi:10.5067/EWSGQD2MI070',
    link: 'https://oco2.jpl.nasa.gov/',
  },
  {
    id: 'cams',
    shortName: 'Copernicus CAMS',
    name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
    org: 'Centre Européen pour les Prévisions Météorologiques à Moyen Terme (ECMWF)',
    dataType: 'Réanalyses tridimensionnelles des gaz à effet de serre et inversions de flux',
    stations: 'Grille mondiale et européenne (niveaux verticaux 1 000 à 10 hPa)',
    frequency: 'Pas de temps 3 h, assimilation variationnelle 4D-Var',
    standard: 'Modèle numérique IFS Cycle 49r1',
    license: 'Licence Copernicus Free & Open Access',
    doi: 'doi:10.24380/cams-co2-forecast',
    link: 'https://atmosphere.copernicus.eu/',
  },
  {
    id: 'hitran',
    shortName: 'HITRAN 2020',
    name: 'HITRAN Molecular Database',
    org: 'Harvard-Smithsonian Center for Astrophysics (Cambridge MA)',
    dataType: 'Paramètres spectroscopiques quantiques de transition raie-par-raie',
    stations: 'Molécule ¹²C¹⁶O₂ et isotopologues (2 551 transitions fondamentales)',
    frequency: 'Édition de référence HITRAN 2020 avec protocole HAPI',
    standard: 'Paramètres quantiques HITRAN (ν₀, S, γ_air, γ_self, n_air, δ_air)',
    license: 'Accès académique libre via Harvard Dataverse',
    doi: 'doi:10.1016/j.jqsrt.2021.107949',
    link: 'https://hitran.org/',
  },
  {
    id: 'citepa',
    shortName: 'CITEPA SECTEN',
    name: 'CITEPA — Inventaire SECTEN',
    org: "Centre Interprofessionnel Technique d'Études de la Pollution Atmosphérique (France)",
    dataType: "Inventaires nationaux d'émissions territoriales françaises par secteur",
    stations: 'Transports, Industrie énergie, Bâtiment, Agriculture, UTCATF',
    frequency: 'Bilan officiel annuel réactualisé',
    standard: 'Format officiel de rapportage CCNUCC / Format Pivot National',
    license: 'Licence Ouverte Etalab v2.0',
    doi: 'Rapport CITEPA SECTEN 2025/2026',
    link: 'https://www.citepa.org/fr/secten/',
  },
  {
    id: 'gcp',
    shortName: 'Global Carbon Project',
    name: 'Global Carbon Project (GCP)',
    org: 'Future Earth / Global Carbon Budget Consortium',
    dataType: 'Bilan mondial annuel du carbone (émissions fossiles et puits naturels)',
    stations: 'Agrégation planétaire multi-instituts (50+ laboratoires partenaires)',
    frequency: 'Publication annuelle dans Earth System Science Data (ESSD)',
    standard: 'Consensus scientifique international évalué par les pairs',
    license: 'Creative Commons CC-BY 4.0',
    doi: 'doi:10.5194/essd-global-carbon-budget-2025',
    link: 'https://globalcarbonbudget.org/',
  },
];

export const BENTO_MODULES: BentoModuleItem[] = [
  {
    code: '4.1',
    title: 'Tableau de Bord Planétaire',
    description:
      'Courbe de Keeling continue depuis 1958, distinction entre concentration instantanée, moyenne mensuelle et tendance séculaire désaisonnalisée.',
    metricOrRule: '426.50 ppm au sol · Série Mauna Loa 1958–2026',
    targetView: 'dashboard',
    category: 'measured',
    icon: TrendingUp,
    featured: true,
    screenshot: APP_SCREENSHOTS[0],
  },
  {
    code: '4.2',
    title: 'Carte Interactive Multi-Réseaux',
    description:
      'Cartographie Leaflet sur fond réel OpenStreetMap croisant 50+ stations mondiales NOAA/ICOS, traces orbitales NASA OCO-2 et champs CAMS.',
    metricOrRule: 'Projection EPSG:3857 · Coordonnées WGS84 certifiées',
    targetView: 'map',
    category: 'measured',
    icon: MapPin,
    featured: true,
    screenshot: APP_SCREENSHOTS[1],
  },
  {
    code: '4.4',
    title: 'Observations Satellitaires XCO₂',
    description:
      'Télédétection OCO-2 et OCO-3 dans les bandes 0.76, 1.61 et 2.06 µm, filtrage strict Quality Flag 0 et profils transversaux de latitude.',
    metricOrRule: 'XCO₂ colonne totale ≠ concentration au sol',
    targetView: 'xco2',
    category: 'observed',
    icon: Satellite,
    featured: true,
    screenshot: APP_SCREENSHOTS[2],
  },
  {
    code: '4.7',
    title: 'Laboratoire Beer-Lambert & Transfert Radiatif',
    description:
      'Calcul ab initio de la transmittance T(ν) = exp(-τ(ν)), saturation au cœur de la bande à 15 µm et forçage radiatif logarithmique du GIEC.',
    metricOrRule: 'ΔF = 5.35 · ln(C / C₀) W/m² · Profils de Voigt',
    targetView: 'spectroscopy-lab',
    category: 'simulated',
    icon: Atom,
    featured: true,
    screenshot: APP_SCREENSHOTS[3],
  },
  {
    code: '4.3',
    title: 'Concentration du CO₂ au Sol',
    description:
      'Mesures continues CRDS et NDIR aux observatoires de référence (Mauna Loa, Puy de Dôme, Barrow, Pôle Sud).',
    metricOrRule: 'Unité : ppm (WMO-CO2-X2019)',
    targetView: 'surface',
    category: 'measured',
    icon: Thermometer,
  },
  {
    code: '4.5',
    title: 'Profils Verticaux AirCore (0–30 km)',
    description:
      'Gradients de la couche limite à la stratosphère via carottages AirCore, sondages aériens et tour de Traînou (5 à 180 m).',
    metricOrRule: 'Troposphère · Tropopause · Stratosphère',
    targetView: 'profiles',
    category: 'measured',
    icon: Layers,
  },
  {
    code: '4.6',
    title: 'Explorateur de Raies HITRAN',
    description:
      'Inspection de 2 551 transitions quantiques (branches P, Q à 667.4 cm⁻¹ et R) avec largeurs Lorentz et Doppler.',
    metricOrRule: 'Bandes 15 µm (ν₂) & 4.3 µm (ν₃)',
    targetView: 'spectroscopy-lines',
    category: 'simulated',
    icon: Radio,
  },
  {
    code: '4.8',
    title: 'Flux, Émissions & Inventaires CITEPA',
    description:
      'Inversions de flux nets CAMS (NEE), budget Global Carbon Project et secteurs français CITEPA SECTEN.',
    metricOrRule: 'Transports 31.4% · Puits UTCATF -28.4 Mt CO₂e',
    targetView: 'flux',
    category: 'estimated',
    icon: Flame,
  },
  {
    code: '4.9',
    title: 'Comparateur Multi-Sources',
    description:
      'Confrontation directe Sol vs Satellite vs Modèle CAMS avec calcul automatique du biais moyen (MBE) et du RMSE.',
    metricOrRule: 'Analyse métrologique des écarts',
    targetView: 'compare',
    category: 'modeled',
    icon: Scale,
  },
  {
    code: '4.10',
    title: 'Exports Ouverts & Rapport Scientifique',
    description:
      'Génération de rapports PDF avec DOI et exports CSV, GeoJSON RFC 7946, NetCDF CF-1.8 CDL, NDJSON et SVG vérifiés SHA-256.',
    metricOrRule: 'Traçabilité WMO & empreinte FIPS 180-4',
    actionType: 'report',
    category: 'measured',
    icon: FileText,
  },
];

export const SCIENTIFIC_MECHANISMS: MechanismItem[] = [
  {
    id: 'ir-absorption',
    title: 'Comment la molécule de CO₂ absorbe-t-elle le rayonnement infrarouge ?',
    shortTitle: 'Absorption Infrarouge Quantique',
    formula: 'ν₂ = 667.4 cm⁻¹  (λ = 14.98 µm) · ΔF = 5.35 · ln(C/C₀)',
    explanation:
      "Le dioxyde de carbone est une molécule linéaire O=C=O sans moment dipolaire permanent à l'état de repos. Le mode de vibration de flexion (ν₂) brise la symétrie et induit un dipôle électrique oscillant à 667.4 cm⁻¹ (15 µm), en plein cœur du spectre d'émission thermique de la Terre (loi de Wien à T ~ 288 K). Le CO₂ absorbe ces photons telluriques avant de réémettre dans toutes les directions.",
    keyTakeaway:
      "Le cœur de la bande à 15 µm est optiquement saturé dès ~100 ppm. L'effet additionnel provient des ailes collisionnelles de Lorentz, ce qui confère au forçage radiatif sa loi logarithmique.",
  },
  {
    id: 'satellite-remote-sensing',
    title: 'Comment un satellite mesure-t-il le CO₂ à des centaines de kilomètres ?',
    shortTitle: 'Télédétection Satellitaire OCO-2',
    formula: 'XCO₂ = N_CO₂ / N_air_sec = (Colonne CO₂) / (Colonne O₂ / 0.2095)',
    explanation:
      "Des satellites comme NASA OCO-2 et OCO-3 embarquent trois spectromètres observant la lumière solaire réfléchie dans le proche infrarouge : la bande O₂-A (0.76 µm) pour la colonne d'air sec et la pression de surface, et deux bandes CO₂ (1.61 µm et 2.06 µm). L'algorithme d'inversion ACOS v11 déduit la colonne totale intégrée.",
    keyTakeaway:
      "Le ratio entre l'absorption par le CO₂ et par l'oxygène moléculaire élimine les variations de pression barométrique pour livrer la fraction molaire moyenne d'air sec XCO₂.",
  },
  {
    id: 'ground-vs-xco2',
    title: 'Pourquoi la concentration au sol diffère-t-elle de la moyenne XCO₂ ?',
    shortTitle: 'Concentration Sol vs Moyenne XCO₂',
    formula: 'XCO₂ = ∫ w(p) · c(p) dp  ≠  c(sol)',
    explanation:
      "Une station de surface échantillonne l'air au ras du sol ou en montagne, directement exposé à la photosynthèse diurne, à la respiration nocturne et à la couche limite planétaire (500 m à 2 000 m), où les écarts peuvent atteindre 30 à 50 ppm. Le satellite observe toute la colonne jusqu'à 50 km, dominée par la troposphère libre mélangée à l'échelle hémisphérique.",
    keyTakeaway:
      "XCO₂ amortit les oscillations locales de surface et reflète la masse du réservoir atmosphérique, tandis que la mesure au sol capte la signature immédiate des écosystèmes.",
  },
  {
    id: 'carbon-cycle-fluxes',
    title: 'Comment le carbone circule-t-il entre atmosphère, océans et biosphère ?',
    shortTitle: 'Cycle du Carbone & Réservoirs',
    formula:
      'Atmosphère (~880 GtC) · Puits Végétal (~3.5 GtC/an) · Puits Océanique (~3.0 GtC/an)',
    explanation:
      "Sur les ~40 milliards de tonnes de CO₂ (~10.9 GtC) émises chaque année, environ 46% demeurent dans l'atmosphère. Le reste est absorbé presque à parts égales par l'océan mondial (dissolution physique et pompe biologique) et la biosphère continentale (photosynthèse), produisant le cycle saisonnier de 6 à 8 ppm visible chaque année sur la courbe de Keeling.",
    keyTakeaway:
      'Toute saturation partielle des puits naturels augmente mécaniquement la fraction qui reste dans l’atmosphère.',
  },
  {
    id: 'model-observation-divergence',
    title: 'Pourquoi les modèles numériques et les observations peuvent-ils diverger ?',
    shortTitle: 'Divergence Modèles vs Observations',
    formula: 'Écart Local = Modèle IFS (Maille ~15 km) − Point In Situ (0 m) ± Incertitude',
    explanation:
      "Une réanalyse Copernicus CAMS IFS discrétise l'atmosphère en mailles de 10 à 25 km, tandis qu'une station au sol mesure un volume d'air local influencé par le relief et le couvert végétal immédiat. Les satellites nécessitent quant à eux un ciel dégagé sans couverture nuageuse.",
    keyTakeaway:
      "La divergence traduit la confrontation physique normale entre une mesure ponctuelle locale et une moyenne spatio-temporelle modélisée.",
  },
];

export const TARGET_AUDIENCES: AudienceItem[] = [
  {
    role: 'Chercheurs & Climatologues',
    tag: 'Données vérifiées · NetCDF & NDJSON',
    description:
      'Accédez à des séries contrôlées par Quality Flags, empreintes SHA-256 et exports scientifiques ouverts (NetCDF CF-1.8 CDL, CSV métrologique, GeoJSON, NDJSON) pour confronter mesures in situ, colonnes OCO et réanalyses CAMS.',
    icon: Atom,
  },
  {
    role: 'Enseignants & Étudiants',
    tag: 'TP interactifs · Physique & SVT',
    description:
      'Illustrez la loi de Beer-Lambert, les branches quantiques P/Q/R à 15 µm et la courbe de Keeling en travaux pratiques. Reliez enfin les nombres quantiques moléculaires aux grands équilibres du climat.',
    icon: GraduationCap,
  },
  {
    role: 'Journalistes & Analystes',
    tag: 'Fact-checking sourcé · Rapports PDF',
    description:
      'Vérifiez chaque ordre de grandeur à la source avec DOI et intervalles d’incertitude, explorez les inventaires sectoriels CITEPA SECTEN et exportez des graphiques SVG ou rapports PDF prêts à citer.',
    icon: FileText,
  },
  {
    role: 'Citoyens Éclairés & Terrain',
    tag: 'Science Ouverte · PWA Hors-Ligne',
    description:
      'Consultez librement et sans inscription les relevés quotidiens de Mauna Loa ou du Puy de Dôme, même sans connexion internet grâce à l’architecture Progressive Web App.',
    icon: Users,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Carbonor est-elle une application gratuite et ouverte ?',
    a: 'Oui, Carbonor est une plateforme 100% gratuite, sans publicité, sans inscription obligatoire et sans abonnement payant. Son code source est ouvert sous licence libre MIT sur GitHub (https://github.com/jeanpierrenouhailler-dot/carbonor).',
  },
  {
    q: 'Les données sont-elles réellement mises à jour auprès des sources officielles ?',
    a: "Oui. Carbonor interroge les serveurs officiels de la NOAA (GML / ERDDAP), du portail européen ICOS, du catalogue NASA Earthdata (CMR) et des flux Copernicus CAMS. Chaque lot importé ou relu sur cache disque porte son horodatage effectif (UTC) et son empreinte SHA-256.",
  },
  {
    q: "D'où provient la valeur de ~426 ppm affichée sur le tableau de bord ?",
    a: "Elle provient directement de l'observatoire de référence mondial de Mauna Loa à Hawaï (NOAA GML), situé à 3 397 mètres d'altitude, sur l'échelle internationale de calibration WMO-CO2-X2019.",
  },
  {
    q: 'Pourquoi trouve-t-on des concentrations différentes selon les stations ?',
    a: "Les observatoires de plaine (comme la tour de Traînou à 5 m) enregistrent les inversions nocturnes où la respiration végétale accumule le CO₂ près du sol, alors que les stations de haute altitude (Puy de Dôme à 1 465 m, Mauna Loa à 3 397 m) ou le Pôle Sud mesurent la troposphère libre.",
  },
  {
    q: 'Quelle est la différence fondamentale entre ppm (au sol) et XCO₂ (satellite) ?',
    a: "La concentration au sol quantifie la fraction molaire dans l'air prélevé au niveau du capteur in situ, tandis que XCO₂ est la fraction molaire moyenne intégrée sur toute la colonne verticale d'air sec mesurée par satellite depuis l'espace.",
  },
  {
    q: "Comment fonctionne le moteur de spectroscopie dans l'application ?",
    a: 'Carbonor résout le transfert radiatif raie-par-raie à partir de 2 551 transitions moléculaires du CO₂ issues des constantes HITRAN 2020, en convoluant un profil de Voigt (Doppler + Lorentz) selon la loi de Beer-Lambert.',
  },
  {
    q: 'Peut-on utiliser les visualisations et données pour des publications ou des cours ?',
    a: "Oui. Les graphiques, cartes et exports peuvent être réutilisés pour vos articles, cours ou présentations, dans le respect des licences ouvertes d'origine (CC-BY 4.0 pour ICOS et GCP, domaine public pour la NOAA et la NASA).",
  },
  {
    q: 'Pourquoi les mesures au sol et les observations satellitaires ne coïncident-elles pas toujours ?',
    a: "Une mesure au sol est ponctuelle et sensible aux flux immédiats de surface, alors que le satellite intègre toute l'épaisseur de la colonne atmosphérique sur une empreinte au sol de 1.29 × 2.25 km.",
  },
  {
    q: "Qu'est-ce que la courbe de Keeling et pourquoi est-elle si importante ?",
    a: "Initiée en 1958 par Charles David Keeling à Mauna Loa, c'est la plus longue série continue de mesures atmosphériques directes de CO₂, passant de 315 ppm en 1958 à plus de 426 ppm en 2026 tout en montrant la respiration saisonnière de la biosphère.",
  },
  {
    q: "L'application fonctionne-t-elle sans connexion Internet (hors ligne) ?",
    a: 'Oui. Conçue comme une Progressive Web App (PWA), Carbonor fonctionne localement hors connexion en mode Démonstration grâce aux fixtures scientifiques embarquées et au moteur de calcul local.',
  },
  {
    q: 'Comment citer Carbonor dans une publication scientifique ou un rapport ?',
    a: "Citation recommandée : « Carbonor Research Team (2026). Carbonor : Observatoire ouvert du CO₂ atmosphérique et du cycle du carbone, de la spectroscopie moléculaire HITRAN aux réseaux d'observation sol et satellites. https://github.com/jeanpierrenouhailler-dot/carbonor ».",
  },
  {
    q: 'Comment contribuer au développement ou signaler une anomalie ?',
    a: 'Le dépôt GitHub est ouvert aux contributions, signalements et améliorations scientifiques via issues et Pull Requests.',
  },
];

export const RECOMMENDED_CITATION =
  "Carbonor Research Team (2026). Carbonor : Observatoire ouvert du CO₂ atmosphérique et du cycle du carbone, de la spectroscopie moléculaire HITRAN aux réseaux d'observation sol et satellites. https://github.com/jeanpierrenouhailler-dot/carbonor";
