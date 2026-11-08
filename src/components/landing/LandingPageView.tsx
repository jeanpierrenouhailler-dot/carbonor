import React, { useState } from 'react';
import { ViewKey } from '../layout/Sidebar';
import { useDataMode } from '../../context/DataModeContext';
import { 
  ArrowRight, 
  Atom, 
  MapPin, 
  Satellite, 
  TrendingUp, 
  Layers, 
  Wind, 
  Scale, 
  ShieldCheck, 
  Download, 
  FileText, 
  Globe2, 
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Eye,
  Maximize2,
  X,
  ChevronDown,
  Database,
  Cpu,
  GraduationCap,
  HelpCircle,
  Activity,
  Check,
  Copy,
  Radio,
  Sparkles,
  Users,
  Search,
  Share2
} from 'lucide-react';

interface LandingPageViewProps {
  onSelectView: (view: ViewKey) => void;
  onOpenReport?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSelectView,
  onOpenReport
}) => {
  const { isRealData, toggleDataMode } = useDataMode();

  // Galerie de captures réelles
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<any | null>(null);

  // Mini-calculateur interactif de forçage radiatif sur la landing
  const [co2Slider, setCo2Slider] = useState<number>(426);
  const baselineCo2 = 280; // ppm préindustriel (Law Dome / Dome C)
  const radiativeForcing = parseFloat((5.35 * Math.log(co2Slider / baselineCo2)).toFixed(2));
  const deltaTempEquilibrium = parseFloat((radiativeForcing * 0.8).toFixed(2));

  // Onglet interactif pour la distinction épistémologique
  const [selectedPillar, setSelectedPillar] = useState<'measured' | 'observed' | 'estimated' | 'modeled' | 'simulated'>('measured');

  // Accordéons interactifs pour la FAQ (12 questions)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Accordéon interactif pour les 5 mécanismes pédagogiques
  const [activeMechanism, setActiveMechanism] = useState<number>(0);

  // Étape active dans le diagramme du pipeline
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Copie de citation dans le presse-papier
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const appScreenshots = [
    {
      id: 'dashboard',
      title: 'Tableau de Bord & Keeling (1958-2026)',
      subtitle: 'Synthèse Métrologique Planétaire',
      category: 'Tableau de Bord',
      image: '/screenshots/dashboard_overview.jpg',
      description: 'Visualisation séculaire de la courbe de Keeling (NOAA Mauna Loa) de 315 à 426 ppm, indicateurs en temps réel (Sol 425.30 ppm, Satellite XCO₂ 422.31 ppm, Modèle CAMS 423.24 ppm, 2 551 raies HITRAN) et cartouche spectroscopique à 15 µm.',
      targetView: 'dashboard' as ViewKey,
      highlights: [
        'Courbe de Keeling continue 1958–2026 avec oscillation saisonnière de la biosphère',
        '4 indicateurs temps réel avec certificats métrologiques officiels',
        'Cartouche spectroscopique de la bande fondamentale à 15 µm résolue raie-par-raie'
      ]
    },
    {
      id: 'map',
      title: 'Cartographie Multi-Réseaux OpenStreetMap',
      subtitle: 'Réseaux In Situ & Trace Orbitale OCO-2',
      category: 'Carte Interactive',
      image: '/screenshots/interactive_map_osm.jpg',
      description: 'Cartographie Leaflet sur fond réel OpenStreetMap (styles Standard, Sombre, Topo, Satellite) croisant 50+ stations mondiales NOAA/ICOS, trace satellitaire avec sondages discrets OCO-2 et panneau d\'inspection station (Puy de Dôme 1465 m, 428.72 ppm).',
      targetView: 'map' as ViewKey,
      highlights: [
        'Fond cartographique réel OpenStreetMap projeté en Web Mercator EPSG:3857',
        'Marqueurs de stations au sol interactifs avec infobulles complètes',
        'Trace orbitale NASA OCO-2 avec points de sondage individuels et profil transversal'
      ]
    },
    {
      id: 'spectroscopy',
      title: 'Laboratoire Virtuel de Transfert Radiatif',
      subtitle: 'Spectroscopie HITRAN 2020 & Beer-Lambert',
      category: 'Physique Moléculaire',
      image: '/screenshots/spectroscopy_lab.jpg',
      description: 'Résolution quantique raie-par-raie de la molécule de CO₂ : branches P, Q centrale (667.4 cm⁻¹) et R de la bande à 15 µm, curseur de concentration 280 à 1000 ppm, calcul du forçage radiatif instantané et comparaison des profils de raie de Voigt.',
      targetView: 'spectroscopy-lab' as ViewKey,
      highlights: [
        'Bande de flexion ν₂ à 15 µm (667 cm⁻¹) résolue avec 2 551 transitions HITRAN',
        'Curseur de concentration avec calcul de forçage ΔF = 5.35 ln(C/C₀) W/m²',
        'Décomposition des élargissements Doppler thermique et Lorentz collisionnel'
      ]
    },
    {
      id: 'xco2',
      title: 'Télédétection Satellitaire XCO₂',
      subtitle: 'NASA OCO-2 & OCO-3 Lite Diagnostic',
      category: 'Télédétection',
      image: '/screenshots/satellite_xco2_orbit.jpg',
      description: 'Couverture orbitale mondiale, profil transversal de latitude XCO₂, discrimination des 3 bandes spectrométriques (0.76 µm O₂-A, 1.61 µm WCO₂, 2.06 µm SCO₂), filtrage par Quality Flag (Flag 0 valide vs Flag 1 suspect) et analyse des 8 empreintes spatiales.',
      targetView: 'xco2' as ViewKey,
      highlights: [
        'Fraction molaire de colonne moyenne d\'air sec XCO₂ par spectrométrie SWIR',
        'Profil transversal de latitude montrant les gradients hémisphériques',
        'Filtrage strict par Quality Flag 0 (Assimilation Grade) et détection d\'aérosols'
      ]
    }
  ];

  const pillars = {
    measured: {
      category: 'MESURÉ',
      subtitle: 'Mesures Physico-Chimiques In Situ Directes',
      badge: 'In Situ · Échelle WMO',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/20',
      sources: 'NOAA GML · Observatoires ICOS · Réseau GAW/OMM',
      instruments: 'Spectromètres CRDS Picarro G2401 · Analyseurs NDIR · Échelle WMO-CO2-X2019',
      summary: 'L\'air ambiant entre physiquement dans une cellule optique de mesure. La concentration est déterminée par absorption infrarouge ou résonance en cavité optique fermée, étalonnée quotidiennement sur des gaz étalons primaires certifiés.',
      invariants: 'Mesure directe de la fraction molaire au sol (ppm). Incertitude métrologique type : ± 0.12 ppm.',
      examples: 'Mauna Loa (3 397 m), Puy de Dôme (1 465 m), Mace Head, Barrow, Cape Grim, Pôle Sud.',
      targetView: 'surface' as ViewKey
    },
    observed: {
      category: 'OBSERVÉ',
      subtitle: 'Télédétection Indirecte par Inversion Spectrale',
      badge: 'Satellites · Colonne XCO₂',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/20',
      sources: 'NASA Earthdata · Satellites OCO-2 & OCO-3 (Science Team JPL)',
      instruments: 'Spectromètres à réseau haute résolution (0.76 µm O₂-A, 1.61 µm WCO₂, 2.06 µm SCO₂)',
      summary: 'La lumière solaire réfléchie par la surface terrestre traverse deux fois toute l\'épaisseur de l\'atmosphère. L\'atténuation spectrale est inversée par algorithme d\'estimation optimale (ACOS v11) pour déduire la moyenne de colonne d\'air sec XCO₂.',
      invariants: 'XCO₂ n\'est pas une concentration au sol : c\'est une moyenne pondérée par la masse d\'air sur toute l\'épaisseur atmosphérique. Incertitude type : ± 1.2 ppm.',
      examples: 'Sondages orbitaux quotidiens, empreintes au sol de 1.29 × 2.25 km, diagnostic Flag 0/1.',
      targetView: 'xco2' as ViewKey
    },
    estimated: {
      category: 'ESTIMÉ',
      subtitle: 'Flux Inversés & Bilan Comptable Sectoriel',
      badge: 'Flux · Inventaires',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/20',
      sources: 'CITEPA (SECTEN) · Global Carbon Project · GIEC / CCNUCC',
      instruments: 'Transport inverse bayésien · Modèles de trafic COPERT · Inventaires CRF',
      summary: 'Les émissions anthropiques et les flux biosphériques ne sont pas mesurables en continu sur chaque mètre carré du territoire. Ils sont estimés par modélisation statistique d\'activités socio-économiques et par inversion du gradient atmosphérique.',
      invariants: 'Estimations sectorielles réactualisées annuellement. Puits biosphériques calculés par bilan net.',
      examples: 'Inventaire national français 2026, puits forestier UTCATF, budget carbone mondial.',
      targetView: 'flux' as ViewKey
    },
    modeled: {
      category: 'MODÉLISÉ',
      subtitle: 'Assimilation Numérique 3D & Réanalyses ECMWF',
      badge: 'Modèles 3D · IFS 4D-Var',
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/20',
      sources: 'Copernicus CAMS · Centre Européen pour les Prévisions Météorologiques (ECMWF)',
      instruments: 'Modèle de circulation générale IFS Cycle 49r1 · Assimilation variationnelle 4D-Var',
      summary: 'Résolution numérique tridimensionnelle des équations d\'hydrodynamique atmosphérique couplées aux flux chimiques. Le modèle intègre des millions d\'observations sol et satellites pour interpoler l\'état global en tout point du globe.',
      invariants: 'Grille tridimensionnelle discrétisée en mailles de 10 à 25 km, de la surface jusqu\'à 10 hPa.',
      examples: 'Grille atmosphérique 3D Europe, profils barométriques verticaux, prévisions de transport.',
      targetView: 'compare' as ViewKey
    },
    simulated: {
      category: 'SIMULÉ',
      subtitle: 'Physique Moléculaire Ab Initio & Transfert Radiatif',
      badge: 'Quantique · HITRAN 2020',
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgColor: 'bg-rose-950/20',
      sources: 'Base HITRAN 2020 (Harvard-Smithsonian CfA) · Protocole HAPI',
      instruments: 'Spectroscopie quantique raie-par-raie (LBL) · Loi de Beer-Lambert · Profils de Voigt',
      summary: 'Calcul ab initio des transitions de rotation-vibration de la molécule CO₂ à partir des nombres quantiques J, des coefficients d\'élargissement par pression et des intensités de raie fondamentales.',
      invariants: '2 551 raies exactes résolues, bandes fondamentales à 15 µm (ν₂) et 4.3 µm (ν₃). Aucun paramètre empirique ajusté arbitrairement.',
      examples: 'Calcul de transmittance spectrale T(ν) = exp(-τ(ν)), saturation du centre et élargissement des ailes.',
      targetView: 'spectroscopy-lab' as ViewKey
    }
  };

  const pipelineSteps = [
    {
      num: '01',
      title: 'Sources Scientifiques Officielles',
      desc: 'Acquisition automatique auprès des archives certifiées : flux NOAA GML (obspack), requêtes SPARQL ICOS Carbon Portal, granules NASA Earthdata CMR, réanalyses Copernicus CAMS CDS et base quantique HITRAN.',
      target: 'NOAA · ICOS · NASA · ECMWF · HITRAN',
      icon: Database
    },
    {
      num: '02',
      title: 'Collecte & Contrôle Métrologique',
      desc: 'Téléchargement sécurisé des flux bruts avec calcul d\'empreinte cryptographique SHA-256. Vérification de conformité des en-têtes et des métadonnées de station (WGS84, altitude, type de capteur).',
      target: 'SHA-256 · Checksum · Headers ISO',
      icon: ShieldCheck
    },
    {
      num: '03',
      title: 'Validation & Normalisation',
      desc: 'Filtrage strict par drapeaux de qualité (Quality Flags OCO-2 QF=0, drapeaux ICOS Validated). Normalisation des unités vers les standards métrologiques internationaux : fraction molaire en ppm (WMO-CO2-X2019) et nombre d\'onde en cm⁻¹.',
      target: 'Échelle WMO-CO2-X2019 · Quality Flags',
      icon: Scale
    },
    {
      num: '04',
      title: 'Traitement Scientifique & Calculs',
      desc: 'Calcul raie-par-raie de transmittance de Beer-Lambert, convolution de profils de Voigt (Lorentz + Doppler), intégration verticale de colonne et décomposition des tendances séculaires désaisonnalisées.',
      target: 'Profils de Voigt · Décomposition STL',
      icon: Cpu
    },
    {
      num: '05',
      title: 'Visualisation Interactive Haute Fidélité',
      desc: 'Rendu graphique cartographique Leaflet OpenStreetMap, courbes de Keeling lissées, profils de sondages orbitaux et spectres quantiques interactifs à 60 images par seconde.',
      target: 'Leaflet OSM · Graphiques réactifs',
      icon: Eye
    },
    {
      num: '06',
      title: 'Comparaison, Audit & Exports Certifiés',
      desc: 'Intercomparaison multi-sources (Sol vs Satellite vs Modèle), calcul d\'anomalies locales et génération d\'exports aux formats scientifiques ouverts (CSV, GeoJSON, NetCDF, Parquet, Rapport PDF certifié).',
      target: 'NetCDF CF-1.8 · GeoJSON · PDF ISO 17025',
      icon: Download
    }
  ];

  const scientificMechanisms = [
    {
      id: 'ir-absorption',
      title: '1. Comment la molécule de CO₂ absorbe-t-elle le rayonnement infrarouge ?',
      shortTitle: 'Absorption Infrarouge Quantique',
      formula: 'ν₂ = 667.4 cm⁻¹  (λ = 14.98 µm) · ΔF = 5.35 · ln(C/C₀)',
      explanation: 'Le dioxyde de carbone est une molécule linéaire O=C=O sans moment dipolaire permanent à l\'état de repos. Cependant, le mode de vibration de flexion (pliage bending noté ν₂) brise la symétrie de la molécule et induit un dipôle électrique oscillant qui résonne précisément à 667.4 cm⁻¹ (soit environ 15 µm). Or, le spectre d\'émission thermique de la Terre culmine exactement autour de 10–15 µm (loi de Wien pour T ~ 288 K). Le CO₂ absorbe donc avec une extrême efficacité les photons thermiques telluriques réémis vers l\'espace, avant de réémettre cette énergie dans toutes les directions, y compris vers le sol.',
      keyTakeaway: 'Le centre de la bande 15 µm est saturé optiquement dès ~100 ppm. L\'effet de serre additionnel provient de l\'élargissement collisionnel de Lorentz dans les ailes de la raie, ce qui confère au forçage radiatif sa dépendance logarithmique stricte.'
    },
    {
      id: 'satellite-remote-sensing',
      title: '2. Comment un satellite mesure-t-il le CO₂ à des centaines de kilomètres ?',
      shortTitle: 'Télédétection Satellitaire OCO-2',
      formula: 'XCO₂ = N_CO₂ / N_air_sec = (Colonne CO₂) / (Colonne O₂ / 0.2095)',
      explanation: 'Des satellites comme NASA OCO-2 et OCO-3 ne mesurent pas directement la concentration par contact. Ils embarquent trois spectromètres à réseau haute résolution observant la lumière solaire réfléchie par la Terre dans le proche infrarouge : la bande O₂-A (0.76 µm) pour déterminer avec précision la colonne d\'air sec et la pression de surface, et deux bandes de CO₂ (1.61 µm faible absorption et 2.06 µm forte absorption). L\'algorithme d\'inversion ACOS v11 résout l\'équation de transfert radiatif pour déduire la colonne totale intégrée.',
      keyTakeaway: 'Le ratio entre les photons absorbés par le CO₂ et ceux absorbés par l\'oxygène moléculaire permet d\'éliminer les variations de pression barométrique et de vapeur d\'eau, fournissant la fraction molaire moyenne d\'air sec XCO₂.'
    },
    {
      id: 'ground-vs-xco2',
      title: '3. Pourquoi la concentration au sol diffère-t-elle de la moyenne XCO₂ ?',
      shortTitle: 'Concentration Sol vs Moyenne XCO₂',
      formula: 'XCO₂ = ∫ w(p) · c(p) dp  ≠  c(sol)',
      explanation: 'Une station de surface comme Mauna Loa ou le Puy de Dôme échantillonne l\'air au ras du sol ou au sommet d\'une montagne. Elle est directement exposée aux flux biologiques locaux (photosynthèse diurne, respiration du sol nocturne) et à la couche limite planétaire (500 m à 2 000 m d\'épaisseur), où les variations nycthémérales peuvent atteindre 30 à 50 ppm. À l\'inverse, le satellite observe la colonne atmosphérique complète jusqu\'à 50 km d\'altitude : 80% de la masse d\'air se situe dans la troposphère libre, qui est mélangée à l\'échelle hémisphérique.',
      keyTakeaway: 'XCO₂ amortit les oscillations locales de surface et reflète la masse globale du réservoir atmosphérique, tandis que la mesure au sol capte la signature immédiate des écosystèmes et des panaches urbains.'
    },
    {
      id: 'carbon-cycle-fluxes',
      title: '4. Comment le carbone circule-t-il entre atmosphère, océans et biosphère ?',
      shortTitle: 'Cycle du Carbone & Réservoirs',
      formula: 'Atmosphère (~880 GtC) · Puits Végétal (~3.5 GtC/an) · Puits Océanique (~3.0 GtC/an)',
      explanation: 'Sur les ~40 milliards de tonnes de CO₂ (~10.9 GtC) émises annuellement par la combustion des énergies fossiles et la déforestation, environ 46% s\'accumulent dans l\'atmosphère (la fraction aéroportée). Le reste est absorbé à parts quasi égales par les puits naturels : l\'océan mondial (via la dissolution physique selon la loi de Henry et la pompe biologique) et la biosphère continentale (via la stimulation de la photosynthèse végétale). Ce couplage explique la spectaculaire "respiration planétaire" visible sur la courbe de Keeling, avec une chute de 6 à 8 ppm chaque été boréal.',
      keyTakeaway: 'Si les puits naturels de carbone venaient à saturer sous l\'effet du réchauffement, la fraction aéroportée augmenterait mécaniquement, accélérant la hausse atmosphérique.'
    },
    {
      id: 'model-observation-divergence',
      title: '5. Pourquoi les modèles numériques et les observations peuvent-ils diverger ?',
      shortTitle: 'Divergence Modèles vs Observations',
      formula: 'Écart Local = Modèle IFS (Maille ~15 km)  -  Point In Situ (0 m)  ±  Incertitude',
      explanation: 'Un modèle de réanalyse comme Copernicus CAMS IFS discrétise l\'atmosphère en mailles de 10 à 25 km et simule la moyenne d\'une cellule entière. Une station au sol mesure un volume d\'air de quelques centimètres cubes influencé par la topographie immédiate, les inversions thermiques de vallée ou le couvert forestier voisin. De même, les satellites nécessitent un ciel dégagé (les nuages bloquent le signal) et un angle solaire suffisant, créant des biais d\'échantillonnage spatio-temporels.',
      keyTakeaway: 'La divergence ne signifie pas qu\'une source est fausse : elle traduit la confrontation saine entre une mesure ponctuelle locale et une moyenne spatiotemporelle intégrée.'
    }
  ];

  const scientificSourcesList = [
    {
      id: 'noaa',
      name: 'NOAA Global Monitoring Laboratory',
      org: 'National Oceanic and Atmospheric Administration (États-Unis)',
      dataType: 'Mesures au sol continues in situ, carottes AirCore, flacons',
      stations: 'Mauna Loa, Barrow (Utqiaġvik), Pôle Sud, Samoa, Trinidad Head',
      frequency: 'Horaire, quotidien, mensuel depuis 1958',
      standard: 'Échelle WMO-CO2-X2019 (référence mondiale OMM)',
      license: 'Domaine public gouvernemental américain (US Public Domain)',
      doi: 'doi:10.15138/V1IZ-MV11',
      link: 'https://gml.noaa.gov/ccgg/trends/'
    },
    {
      id: 'icos',
      name: 'ICOS Carbon Portal',
      org: 'Integrated Carbon Observation System (Infrastructure Européenne ERIC)',
      dataType: 'Réseaux de tours à flux hautes, mesures in situ atmosphériques Classe 1 & 2',
      stations: 'Puy de Dôme, Tour de Traînou (5 à 180 m), Observatoire de Haute-Provence, Mace Head',
      frequency: 'Données quasi temps réel (Near Real Time) & flux validés',
      standard: 'Protocole ICOS ATC / Normes européennes labellisées',
      license: 'Licence Creative Commons Attribution 4.0 International (CC-BY 4.0)',
      doi: 'doi:10.18160/P7E9-EKEA',
      link: 'https://www.icos-cp.eu/'
    },
    {
      id: 'nasa',
      name: 'NASA Earthdata / OCO-2 & OCO-3',
      org: 'Jet Propulsion Laboratory / NASA Goddard (États-Unis)',
      dataType: 'Colonnes moyennes de CO₂ (XCO₂) par spectrométrie réseau proche infrarouge',
      stations: 'Couverture orbitale polaire héliosynchrone (OCO-2) et station ISS (OCO-3)',
      frequency: 'Revisite orbitale de 16 jours, sondages quotidiens en bande étroite',
      standard: 'ACOS Version 11 Lite Diagnostic (Quality Flag 0 certifié)',
      license: 'Politique Science Ouverte NASA (Open Data Policy)',
      doi: 'doi:10.5067/WWS3HHB02NOS',
      link: 'https://oco2.jpl.nasa.gov/'
    },
    {
      id: 'cams',
      name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
      org: 'Centre Européen pour les Prévisions Météorologiques à Moyen Terme (ECMWF)',
      dataType: 'Réanalyses tridimensionnelles des gaz à effet de serre et prévisions 3D',
      stations: 'Grille mondiale et régionale européenne (niveaux verticaux 1000 à 10 hPa)',
      frequency: 'Pas de temps de 3 heures, assimilation variationnelle 4D-Var',
      standard: 'Modèle numérique IFS Cycle 49r1',
      license: 'Licence Copernicus Open Access Service',
      doi: 'doi:10.24381/cds.e6c8e3cc',
      link: 'https://atmosphere.copernicus.eu/'
    },
    {
      id: 'hitran',
      name: 'HITRAN Molecular Database',
      org: 'Harvard-Smithsonian Center for Astrophysics (CfA, Cambridge MA)',
      dataType: 'Spectroscopie quantique fondamentale de transition raie-par-raie',
      stations: 'Molécule ¹²C¹⁶O₂ et isotopologues (2 551 transitions fondamentales)',
      frequency: 'Édition de référence HITRAN 2020 avec mises à jour HAPI',
      standard: 'Paramètres quantiques HITRAN (ν₀, S, γ_air, γ_self, n_air, δ_air)',
      license: 'Accès académique libre via Harvard Dataverse',
      doi: 'doi:10.1016/j.jqsrt.2021.107949',
      link: 'https://hitran.org/'
    },
    {
      id: 'citepa',
      name: 'CITEPA — Inventaire SECTEN',
      org: 'Centre Interprofessionnel Technique d\'Études de la Pollution Atmosphérique (France)',
      dataType: 'Inventaires nationaux d\'émissions territoriales françaises par secteur d\'activité',
      stations: 'Transports, Industrie de l\'énergie, Bâtiment résidentiel/tertiaire, Agriculture, UTCATF',
      frequency: 'Bilan officiel annuel réactualisé',
      standard: 'Format officiel de rapportage CCNUCC / Format Pivot National',
      license: 'Open Data Gouvernemental / Données publiques',
      doi: 'Rapport CITEPA SECTEN 2025/2026',
      link: 'https://www.citepa.org/fr/secten/'
    },
    {
      id: 'gcp',
      name: 'Global Carbon Project (GCP)',
      org: 'Future Earth / Global Carbon Budget Consortium',
      dataType: 'Bilan mondial annuel du carbone (émissions fossiles, ciment, déforestation, puits)',
      stations: 'Agrégation planétaire multi-instituts (50+ laboratoires partenaires)',
      frequency: 'Publication annuelle dans Earth System Science Data (ESSD)',
      standard: 'Consensus scientifique international évalué par les pairs',
      license: 'Creative Commons CC-BY 4.0',
      doi: 'doi:10.5194/essd-16-5683-2024',
      link: 'https://globalcarbonbudget.org/'
    }
  ];

  const targetAudiences = [
    {
      role: 'Chercheurs & Climatologues',
      icon: Atom,
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
      description: 'Accédez à des données validées, contrôlées par Quality Flags et exportables dans les formats de la science ouverte (NetCDF CF-1.8, CSV certifié, Parquet). Intercomparez les mesures au sol avec les colonnes satellitaires et les réanalyses CAMS pour vos études de variabilité régionale.',
      tag: 'Données certifiées · Exports CF-1.8'
    },
    {
      role: 'Enseignants & Professeurs',
      icon: GraduationCap,
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
      description: 'Proposez des travaux pratiques vivants en SVT, Physique-Chimie ou Enseignement Scientifique (Lycée et Université). Démontrez la loi de Beer-Lambert, faites manipuler la courbe de Keeling réelle et illustrez concrètement la saturation du centre de bande à 15 µm.',
      tag: 'Support de cours · TP interactifs'
    },
    {
      role: 'Étudiants & Universitaires',
      icon: BookOpen,
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
      description: 'Comprenez enfin les liens profonds entre les nombres quantiques moléculaires (spectroscopie de rotation-vibration), les bilans radiatifs de la Terre et les grands cycles biogéochimiques planétaires sans dépendre de manuels abstraits.',
      tag: 'Apprentissage intuitif & rigoureux'
    },
    {
      role: 'Journalistes Scientifiques',
      icon: FileText,
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
      description: 'Vérifiez vos chiffres à la source sans sensationnalisme. Générez des rapports PDF téléchargeables prêts à citer et exportez des graphiques vectoriels nets avec horodatages précis et sources métrologiques authentiques.',
      tag: 'Fact-checking sourcé · Rapports PDF'
    },
    {
      role: 'Décideurs & Analystes RSE',
      icon: Activity,
      color: 'border-teal-500/30 bg-teal-950/20 text-teal-400',
      description: 'Explorez la répartition sectorielle des émissions territoriales (CITEPA SECTEN) et visualisez le rôle crucial des puits forestiers et océaniques pour mieux contextualiser les trajectoires de décarbonation.',
      tag: 'Inventaires sectoriels · Trajectoires'
    },
    {
      role: 'Citoyens Éclairés & Passionnés',
      icon: Users,
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-400',
      description: 'Accédez librement et sans barrière financière au laboratoire numérique utilisé par la communauté scientifique. Découvrez les mesures quotidiennes de Mauna Loa ou du Puy de Dôme en toute transparence.',
      tag: 'Science Citoyenne Ouverte'
    }
  ];

  const faqItems = [
    {
      q: 'Carbonor est-elle une application gratuite et ouverte ?',
      a: 'Oui, Carbonor est une plateforme 100% gratuite, sans publicité, sans inscription obligatoire et sans abonnement payant. Son code source est intégralement ouvert sous licence libre MIT sur GitHub (https://github.com/jeanpierrenouhailler-dot/carbonor). Tous les scientifiques, enseignants et passionnés peuvent auditer les algorithmes, réutiliser le code et contribuer aux améliorations.'
    },
    {
      q: 'Les données sont-elles réellement mises à jour auprès des sources officielles ?',
      a: 'Oui. Carbonor dispose de connecteurs d\'API automatisés interrogeant régulièrement les serveurs officiels de la NOAA (GML), du portail carbone européen ICOS, du catalogue NASA Earthdata (CMR) et des flux Copernicus CAMS. Chaque donnée importée est horodatée en temps universel (UTC) et assortie de son certificat de traçabilité.'
    },
    {
      q: 'D\'où provient la valeur de ~426 ppm affichée sur le tableau de bord ?',
      a: 'Elle provient directement de l\'observatoire de référence mondial de Mauna Loa à Hawaï (NOAA GML), situé à 3 397 mètres d\'altitude au-dessus de l\'inversion thermique du Pacifique. Cette valeur reflète la fraction molaire moyenne mensuelle et annuelle globale de l\'atmosphère de l\'hémisphère Nord, exprimée sur l\'échelle internationale de calibration WMO-CO2-X2019.'
    },
    {
      q: 'Pourquoi trouve-t-on des concentrations différentes selon les stations ?',
      a: 'Le CO₂ n\'est pas parfaitement homogène instantanément. Les observatoires au niveau de la mer ou en plaine (comme la tour de Traînou à 5 m de hauteur) enregistrent l\'inversion nocturne où la respiration végétale et les émissions urbaines accumulent le CO₂ près du sol. À l\'inverse, les stations de haute montagne (Puy de Dôme à 1 465 m, Jungfraujoch à 3 580 m) ou le Pôle Sud mesurent l\'air de la troposphère libre, beaucoup plus représentatif de la masse planétaire globale.'
    },
    {
      q: 'Quelle est la différence fondamentale entre ppm (au sol) et XCO₂ (satellite) ?',
      a: 'La mesure au sol en ppm (parties par million) quantifie la fraction molaire du gaz dans l\'échantillon d\'air prélevé au niveau du sol par un analyseur physique. XCO₂ est la fraction molaire moyenne de la colonne verticale complète d\'air sec mesurée par satellite depuis l\'espace. XCO₂ intègre toute l\'atmosphère (troposphère + stratosphère) et ne doit jamais être confondu avec une mesure de surface.'
    },
    {
      q: 'Comment fonctionne le moteur de spectroscopie dans l\'application ?',
      a: 'Carbonor résout la physique quantique raie-par-raie (Line-by-Line) en utilisant les paramètres fondamentaux de 2 551 transitions moléculaires du CO₂ issues de la base internationale HITRAN 2020. Le calcul convolue un profil de Voigt (qui associe l\'élargissement thermique Doppler et l\'élargissement par pression collisionnelle de Lorentz) pour déterminer le coefficient d\'absorption k(ν), la profondeur optique τ(ν) et la transmittance selon la loi de Beer-Lambert.'
    },
    {
      q: 'Peut-on utiliser les visualisations et données pour des publications ou des cours ?',
      a: 'Absolument. Vous êtes vivement encouragé à réutiliser les graphiques, cartes et données de Carbonor pour vos articles de recherche, mémoires universitaires, cours ou présentations publiques. Les données primaires conservent leurs licences d\'origine respectives (CC-BY 4.0 pour ICOS et le Global Carbon Project, domaine public pour la NOAA et la NASA).'
    },
    {
      q: 'Pourquoi les mesures au sol et les observations satellitaires ne coïncident-elles pas toujours ?',
      a: 'Parce qu\'elles ne mesurent pas la même chose physique ! Une mesure au sol est ultra-locale et soumise aux variations quotidiennes immédiates de la biosphère et du trafic. Le satellite mesure une colonne totale d\'air de plusieurs dizaines de kilomètres, moyennée sur une empreinte spatiale de 1.29 × 2.25 km, pondérée par une fonction de poids qui accorde plus d\'importance aux couches moyennes de la troposphère qu\'aux tout premiers mètres de surface.'
    },
    {
      q: 'Qu\'est-ce que la courbe de Keeling et pourquoi est-elle si importante ?',
      a: 'Initiée en 1958 par le chercheur Charles David Keeling à Mauna Loa, c\'est la plus longue série de mesures atmosphériques directes continues de l\'histoire humaine. Elle a prouvé sans contestation possible la hausse continue et inexorable du CO₂ causée par les activités industrielles (passant de 315 ppm en 1958 à plus de 426 ppm en 2026), tout en révélant la "respiration saisonnière" de la biosphère de l\'hémisphère Nord.'
    },
    {
      q: 'L\'application fonctionne-t-elle sans connexion Internet (hors ligne) ?',
      a: 'Oui ! Carbonor a été développée comme une Progressive Web App (PWA) complète. Lorsque vous êtes hors connexion (dans un train, en classe sans Wi-Fi ou sur le terrain), l\'application bascule instantanément en 🟡 Mode Démonstration : toutes les fixtures scientifiques certifiées, les spectres HITRAN et la cartographie restent 100% consultables et calculables localement dans votre navigateur.'
    },
    {
      q: 'Comment citer Carbonor dans une publication scientifique ou un rapport ?',
      a: 'Vous pouvez utiliser la citation normalisée suivante : « Carbonor Research Team (2026). Carbonor : Observatoire ouvert du CO₂ atmosphérique et du cycle du carbone, de la spectroscopie moléculaire HITRAN aux réseaux d\'observation sol et satellites. https://github.com/jeanpierrenouhailler-dot/carbonor ».'
    },
    {
      q: 'Comment contribuer au développement ou signaler une anomalie ?',
      a: 'Le projet est hébergé sur GitHub. Vous pouvez ouvrir une issue pour signaler un bogue, proposer une nouvelle source de données ou soumettre une Pull Request pour enrichir les fonctionnalités scientifiques ou l\'ergonomie de la plateforme.'
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-20 pb-20 selection:bg-cyan-500 selection:text-slate-950">
      {/* Mini-Navigation Sticky Quick Access Bar */}
      <nav 
        aria-label="Navigation de la présentation" 
        className="sticky top-2 z-30 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono text-slate-300 scrollbar-none"
      >
        <div className="flex items-center gap-1 shrink-0 px-2 text-cyan-400 font-bold tracking-wider">
          <Globe2 className="w-3.5 h-3.5" />
          <span>CARBONOR</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => scrollToSection('pourquoi')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Pourquoi ?
          </button>
          <button 
            onClick={() => scrollToSection('fonctionnement')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button 
            onClick={() => scrollToSection('fonctionnalites')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Modules
          </button>
          <button 
            onClick={() => scrollToSection('mecanismes')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Sciences
          </button>
          <button 
            onClick={() => scrollToSection('sources')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Sources
          </button>
          <button 
            onClick={() => scrollToSection('rigueur')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Transparence
          </button>
          <button 
            onClick={() => scrollToSection('faq')} 
            className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => onSelectView('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-sm transition-all hover:brightness-110 cursor-pointer"
          >
            <span>Lancer l'App</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </nav>

      {/* =========================================================================
          SECTION 1 — HERO : Comprendre le CO₂ à l'échelle planétaire
          ========================================================================= */}
      <section id="hero" className="relative pt-6 md:pt-12">
        {/* Glow atmosphérique d'arrière-plan */}
        <div 
          aria-hidden="true" 
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-b from-cyan-600/15 via-teal-600/10 to-transparent blur-3xl pointer-events-none -z-10" 
        />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Tagline scientifique */}
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold">CO₂ Atmosphère</span>
            <span aria-hidden="true">·</span>
            <span>Cycle du Carbone</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">Spectroscopie Moléculaire &amp; Climat</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            CARBONOR
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-cyan-200/90 font-medium tracking-tight max-w-3xl mx-auto">
            « Explorer le CO₂ atmosphérique. Comprendre le cycle du carbone. Décrypter les mécanismes du climat. »
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            De la molécule de dioxyde de carbone aux échanges de carbone à l'échelle planétaire, Carbonor réunit les observations, les mesures, les modèles et les outils scientifiques nécessaires pour explorer le comportement du CO₂ dans l'atmosphère terrestre.
          </p>

          {/* Deux boutons d'action prescrits */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onSelectView('dashboard')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-sm font-bold shadow-xl shadow-cyan-950/50 hover:shadow-cyan-900/40 transition-all cursor-pointer"
            >
              <span>Découvrir Carbonor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('pourquoi')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Comprendre son fonctionnement</span>
            </button>
          </div>

          {/* Visuel immersif : Terre depuis l'espace, atmosphère lumineuse, molécules CO₂ et flux SVG */}
          <div className="pt-8 relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden p-6 md:p-8 shadow-2xl">
              {/* Représentation visuelle de la Terre et de la couche atmosphérique */}
              <div className="relative flex items-center justify-center h-48 sm:h-56 overflow-hidden">
                {/* Arc planétaire illuminé */}
                <div 
                  className="absolute bottom-[-140px] w-[500px] sm:w-[700px] h-[320px] rounded-[100%] bg-gradient-to-t from-cyan-900/40 via-blue-950/60 to-slate-950 border-t-2 border-cyan-400/80 shadow-[0_-20px_60px_rgba(6,182,212,0.35)]" 
                />

                {/* Couche lumineuse de l'atmosphère (troposphère + stratosphère) */}
                <div 
                  className="absolute bottom-[-135px] w-[520px] sm:w-[730px] h-[335px] rounded-[100%] border-t border-teal-300/40 blur-[2px] pointer-events-none" 
                />

                {/* Flux atmosphériques ondulants en SVG */}
                <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 800 240" fill="none">
                  <path 
                    d="M 50 140 Q 250 80, 400 130 T 750 110" 
                    stroke="url(#fluxGrad1)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    className="animate-pulse"
                  />
                  <path 
                    d="M 30 160 Q 220 110, 420 150 T 780 130" 
                    stroke="url(#fluxGrad2)" 
                    strokeWidth="1.2" 
                    strokeDasharray="6 3" 
                  />
                  <defs>
                    <linearGradient id="fluxGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="fluxGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Molécules de CO₂ stylisées (O=C=O) flottant dans la colonne */}
                <div className="absolute top-6 left-12 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-cyan-300 backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="Oxygène" />
                  <span className="text-slate-400">=</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" title="Carbone" />
                  <span className="text-slate-400">=</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="Oxygène" />
                  <span className="ml-1 text-slate-300 font-semibold">CO₂ (ν₂ = 667 cm⁻¹)</span>
                </div>

                <div className="absolute top-10 right-10 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-emerald-300 backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                  <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sondage OCO-2 · XCO₂ 422.3 ppm</span>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                  <span className="text-[11px] font-mono text-cyan-300/80 tracking-widest uppercase">
                    Troposphère &amp; Stratosphère Terrestres (0 à 30 km)
                  </span>
                </div>
              </div>

              {/* Ruban d'indicateurs scientifiques discrets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-left">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Concentration Globale Sol</span>
                  <span className="text-xl font-bold text-white font-mono mt-0.5 block">426.50 <span className="text-xs text-slate-400 font-normal">ppm</span></span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">NOAA Mauna Loa (WMO-X2019)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Moyenne Colonne XCO₂</span>
                  <span className="text-xl font-bold text-cyan-400 font-mono mt-0.5 block">422.31 <span className="text-xs text-slate-400 font-normal">ppm</span></span>
                  <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">NASA OCO-2 (ACOS v11)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Transitions Quantiques</span>
                  <span className="text-xl font-bold text-rose-400 font-mono mt-0.5 block">2 551 <span className="text-xs text-slate-400 font-normal">raies</span></span>
                  <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">Base HITRAN 2020 (Harvard)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Réseau d'Observatoires</span>
                  <span className="text-xl font-bold text-teal-400 font-mono mt-0.5 block">50+ <span className="text-xs text-slate-400 font-normal">stations</span></span>
                  <span className="text-[10px] text-teal-400 font-mono mt-0.5 block">NOAA GML, ICOS, AirCore</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — Pourquoi Carbonor ?
          ========================================================================= */}
      <section id="pourquoi" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" />
            <span>Épistémologie &amp; Intégrité Métrologique</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Pourquoi Carbonor a-t-elle été créée ?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Le dioxyde de carbone atmosphérique ne peut pas être compris à partir d'une seule mesure isolée. Pour explorer sérieusement le climat, il est indispensable de distinguer la concentration locale au sol, les observations satellitaires en colonne totale, les gradients verticaux, les inventaires sectoriels d'émissions et les simulations radiatives ab initio.
          </p>
        </div>

        {/* Le grand principe épistémologique fondamental */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 max-w-4xl mx-auto text-center space-y-4 shadow-xl">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            La Règle Métrologique Fondamentale de Carbonor
          </span>
          <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-tight text-white flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="px-3 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">MESURÉ</span>
            <span className="text-slate-500">≠</span>
            <span className="px-3 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/40">OBSERVÉ</span>
            <span className="text-slate-500">≠</span>
            <span className="px-3 py-1 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-500/40">ESTIMÉ</span>
            <span className="text-slate-500">≠</span>
            <span className="px-3 py-1 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-500/40">MODÉLISÉ</span>
            <span className="text-slate-500">≠</span>
            <span className="px-3 py-1 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-500/40">SIMULÉ</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ces cinq catégories ne sont <strong>pas interchangeables</strong>. Une observation satellitaire indirecte ne remplace jamais un étalon de mesure in situ au sol, de même qu'un inventaire statistique d'émissions ne décrit pas la concentration locale instantanée.
          </p>
        </div>

        {/* Présentation approfondie des 5 piliers métrologiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Bloc 1 : MESURÉ */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                1. MESURÉ
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">In Situ · Au Sol</span>
            </div>
            <h3 className="text-base font-bold text-white">Mesures Directes par Instruments</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Mesures physiques directes de l'air ambiant par spectrométrie laser CRDS (Picarro G2401) ou cellules NDIR, raccordées aux gaz étalons primaires de l'échelle mondiale <strong>WMO-CO2-X2019</strong>.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-emerald-500/20 space-y-1">
              <div><strong>Sources :</strong> NOAA GML, ICOS ATC, Réseau GAW/OMM</div>
              <div><strong>Exemples :</strong> Mauna Loa, Puy de Dôme, Pôle Sud</div>
            </div>
          </div>

          {/* Bloc 2 : OBSERVÉ */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                2. OBSERVÉ
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">Télédétection · Colonne</span>
            </div>
            <h3 className="text-base font-bold text-white">Inversion par Télédétection Satellitaire</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Informations obtenues indirectement depuis l'espace par spectrométrie de réflexion solaire (bandes 0.76, 1.61 et 2.06 µm), inversées pour fournir la colonne totale d'air sec <strong>XCO₂</strong>.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-cyan-500/20 space-y-1">
              <div><strong>Sources :</strong> NASA OCO-2 &amp; OCO-3, Algorithme ACOS v11</div>
              <div><strong>Règle :</strong> XCO₂ n'est pas une concentration au sol</div>
            </div>
          </div>

          {/* Bloc 3 : ESTIMÉ */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-500/30">
                3. ESTIMÉ
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">Flux &amp; Inventaires</span>
            </div>
            <h3 className="text-base font-bold text-white">Flux &amp; Émissions Déduits</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Émissions et absorptions déduites par méthodes d'inversion bayésienne ou par inventaires statistiques socio-économiques (combustibles fossiles, procédés industriels, puits UTCATF).
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-amber-500/20 space-y-1">
              <div><strong>Sources :</strong> CITEPA (SECTEN), Global Carbon Project</div>
              <div><strong>Application :</strong> Bilan carbone mondial, inventaires nationaux</div>
            </div>
          </div>

          {/* Bloc 4 : MODÉLISÉ */}
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-950/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-900/60 text-purple-300 border border-purple-500/30">
                4. MODÉLISÉ
              </span>
              <span className="text-[10px] font-mono text-purple-400 font-semibold">Assimilation 3D · ECMWF</span>
            </div>
            <h3 className="text-base font-bold text-white">Champs Atmosphériques Numériques</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Champs tridimensionnels calculés par modèles de circulation générale et réanalyses météorologiques combinant les équations de Navier-Stokes et l'assimilation variationnelle de données (4D-Var).
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-purple-500/20 space-y-1">
              <div><strong>Sources :</strong> Copernicus Atmosphere Monitoring Service (CAMS IFS)</div>
              <div><strong>Échelle :</strong> Grille 3D interpolée de 10 à 25 km de résolution</div>
            </div>
          </div>

          {/* Bloc 5 : SIMULÉ */}
          <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/15 space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-900/60 text-rose-300 border border-rose-500/30">
                5. SIMULÉ
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-semibold">Quantique · Ab Initio</span>
            </div>
            <h3 className="text-base font-bold text-white">Calculs Physiques de Spectroscopie Moléculaire</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Résultats obtenus par calculs physiques fondamentaux : résolution des transitions de vibration-rotation moléculaire, loi de Beer-Lambert, élargissements collisionnel de Lorentz et thermique Doppler (profil de Voigt).
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><strong>Base de référence :</strong> HITRAN 2020 (Harvard-Smithsonian CfA)</div>
              <div><strong>Transitions résolues :</strong> 2 551 raies exactes à 15 µm et 4.3 µm</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — Comment fonctionne Carbonor ?
          ========================================================================= */}
      <section id="fonctionnement" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5" />
            <span>Chaîne de Traitement des Données</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Comment fonctionne Carbonor ?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            De la collecte automatisée auprès des archives scientifiques internationales jusqu'à la restitution graphique interactive, découvrez les 6 étapes de notre pipeline métrologique.
          </p>
        </div>

        {/* Diagramme interactif du pipeline : 6 étapes */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {pipelineSteps.map((step, idx) => {
              const isActive = activePipelineStep === idx;
              const IconComp = step.icon;
              return (
                <button
                  key={step.num}
                  onClick={() => setActivePipelineStep(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                    isActive
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/60'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{step.num}</span>
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {step.title.split(' ')[0]} {step.title.split(' ')[1] || ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Détail de l'étape sélectionnée */}
          {(() => {
            const currentStep = pipelineSteps[activePipelineStep];
            return (
              <div className="p-6 rounded-2xl border border-cyan-500/40 bg-slate-900/80 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold block">
                      ÉTAPE {currentStep.num} SUR 06
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {currentStep.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs font-mono self-start sm:self-auto">
                    {currentStep.target}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {currentStep.desc}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Tableau récapitulatif des sources officielles avec utilisation réelle dans le code */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 max-w-5xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Sources Scientifiques Réelles Intégrées dans Carbonor</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-emerald-400 font-bold block">NOAA / GML (États-Unis)</span>
              <p className="text-slate-300 font-sans text-[11px]">Série mensuelle Keeling Mauna Loa 1958-2026, stations GAW, carottages AirCore.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-cyan-400 font-bold block">ICOS Carbon Portal (Europe)</span>
              <p className="text-slate-300 font-sans text-[11px]">Observatoires européens labellisés Classe 1 &amp; 2 (Puy de Dôme, tour de Traînou).</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-teal-400 font-bold block">NASA Earthdata (OCO-2 &amp; OCO-3)</span>
              <p className="text-slate-300 font-sans text-[11px]">Colonnes totales XCO₂ par spectrométrie SWIR, granules L2 Lite v11 avec flags qualité.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-purple-400 font-bold block">Copernicus CAMS (ECMWF)</span>
              <p className="text-slate-300 font-sans text-[11px]">Réanalyses atmosphériques 3D, modèle IFS 4D-Var et flux de surface NEE.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-rose-400 font-bold block">Base HITRAN 2020 (Harvard)</span>
              <p className="text-slate-300 font-sans text-[11px]">2 551 raies quantiques exactes pour le calcul de Beer-Lambert raie-par-raie.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-amber-400 font-bold block">CITEPA &amp; Global Carbon Project</span>
              <p className="text-slate-300 font-sans text-[11px]">Inventaires nationaux sectoriels SECTEN et bilan mondial annuel du carbone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — Les Fonctionnalités Scientifiques (10 Modules)
          ========================================================================= */}
      <section id="fonctionnalites" className="space-y-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>Modules Analytiques Spécialisés</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Les 10 Grandes Fonctionnalités Scientifiques
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Chaque module a été conçu pour répondre à une question physique ou méthodologique précise, avec des graphiques réactifs, des formules explicites et des accès directs aux données.
          </p>
        </div>

        {/* 4.1 & 4.2 : Tableau de bord & Carte OSM (avec captures réelles) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* 4.1 Tableau de bord planétaire */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Module 4.1</span>
                <h3 className="text-lg font-bold text-white">Tableau de Bord Planétaire</h3>
              </div>
              <button
                onClick={() => onSelectView('dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Ouvrir</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <img 
              src="/screenshots/dashboard_overview.jpg" 
              alt="Tableau de bord et courbe de Keeling" 
              className="w-full h-44 object-cover object-top rounded-xl border border-slate-800 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setZoomedScreenshot(appScreenshots[0])}
            />
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Visualisation continue de la courbe de Keeling depuis 1958, confrontation des 4 indicateurs en temps réel (Sol 425.30 ppm, Satellite XCO₂ 422.31 ppm, Modèle CAMS 423.24 ppm, 2 551 raies HITRAN) et cartouche spectroscopique à 15 µm.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-white font-semibold">Distinction essentielle :</strong> Différence claire entre concentration instantanée, moyenne mensuelle lissée et tendance séculaire désaisonnalisée.
            </div>
          </div>

          {/* 4.2 Carte interactive mondiale */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">Module 4.2</span>
                <h3 className="text-lg font-bold text-white">Carte Interactive Multi-Réseaux</h3>
              </div>
              <button
                onClick={() => onSelectView('map')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Ouvrir</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <img 
              src="/screenshots/interactive_map_osm.jpg" 
              alt="Carte interactive OpenStreetMap" 
              className="w-full h-44 object-cover object-top rounded-xl border border-slate-800 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setZoomedScreenshot(appScreenshots[1])}
            />
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Vrai fond cartographique OpenStreetMap Leaflet avec sélecteur de styles (Standard, Sombre, Topo, Satellite) croisant 50+ stations mondiales NOAA/ICOS, trace satellitaire avec sondages discrets OCO-2 et panneau d'inspection station.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-white font-semibold">SIG réel :</strong> Projection Web Mercator EPSG:3857, coordonnées WGS84 certifiées et superposition des couches de surface et orbitales.
            </div>
          </div>
        </div>

        {/* 4.3 & 4.4 : Concentration au sol & Observations Satellitaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* 4.3 Concentration du CO₂ au sol */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Module 4.3</span>
                <h3 className="text-lg font-bold text-white">Concentration du CO₂ au Sol (In Situ)</h3>
              </div>
              <button
                onClick={() => onSelectView('surface')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Mesures continues par analyseurs à résonance en cavité optique fermée (CRDS Picarro G2401) et spectromètres NDIR. Séries horaires, quotidiennes et historiques mensuelles raccordées à l'échelle WMO-CO2-X2019.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Mauna Loa (3 397 m)</span>
                <span className="text-white font-bold block mt-0.5">426.50 ppm</span>
                <span className="text-emerald-400 text-[9px] block">NOAA GML</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Puy de Dôme (1 465 m)</span>
                <span className="text-white font-bold block mt-0.5">428.72 ppm</span>
                <span className="text-emerald-400 text-[9px] block">ICOS ATC</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Unité physique : fraction molaire en <strong>ppm</strong> (parties par million = µmol de CO₂ par mol d'air sec).
            </div>
          </div>

          {/* 4.4 Observations satellitaires XCO₂ */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Module 4.4</span>
                <h3 className="text-lg font-bold text-white">Observations Satellitaires XCO₂ (OCO-2/3)</h3>
              </div>
              <button
                onClick={() => onSelectView('xco2')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Mesure de la fraction molaire moyenne de la colonne verticale totale d'air sec par spectrométrie à réseau dans le proche infrarouge (bande O₂-A à 0.76 µm, WCO₂ à 1.61 µm, SCO₂ à 2.06 µm).
            </p>
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-200">
              <strong className="text-white font-semibold block mb-1">Règle de distinction primordiale :</strong>
              XCO₂ n'est pas une concentration au sol. C'est une intégrale verticale pondérée sur toute la hauteur de l'atmosphère (troposphère + stratosphère).
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Filtrage automatique par <strong>Quality Flag</strong> : Flag 0 (Assimilation Grade) vs Flag 1 (Suspect / Nuageux).
            </div>
          </div>
        </div>

        {/* 4.5 & 4.6 : Profils verticaux & Spectroscopie HITRAN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* 4.5 Profils verticaux atmosphériques */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">Module 4.5</span>
                <h3 className="text-lg font-bold text-white">Profils Verticaux &amp; AirCore (0 à 30 km)</h3>
              </div>
              <button
                onClick={() => onSelectView('profiles')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Exploration des gradients verticaux de concentration du CO₂ de la surface jusqu'à la stratosphère : carottages d'air continus par ballon AirCore NOAA/ICOS et gradient nocturne de la tour de Traînou (5m, 50m, 100m, 180m).
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>0 – 2 km (Couche limite planétaire) :</span>
                <span className="text-amber-400 font-bold">Forte variabilité locale</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>2 – 12 km (Troposphère libre) :</span>
                <span className="text-cyan-400 font-bold">Mélange hémisphérique</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>12 – 30 km (Stratosphère) :</span>
                <span className="text-purple-400 font-bold">Gradient d'âge de l'air</span>
              </div>
            </div>
          </div>

          {/* 4.6 Laboratoire de spectroscopie moléculaire */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">Module 4.6</span>
                <h3 className="text-lg font-bold text-white">Laboratoire de Spectroscopie HITRAN</h3>
              </div>
              <button
                onClick={() => onSelectView('spectroscopy-lines')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Base complète de 2 551 raies spectrales de la molécule de CO₂ issues d'HITRAN 2020 : bandes de rotation-vibration à 15 µm (ν₂) et 4.3 µm (ν₃), nombres quantiques J, branches P, Q centrale (667.4 cm⁻¹) et R.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
              <div><strong>Profil de raie de Voigt :</strong> V(ν) = L(ν) ⊗ G(ν)</div>
              <div><strong>Élargissement Lorentz :</strong> γ_air = 0.071 cm⁻¹/atm (collisionnel)</div>
              <div><strong>Élargissement Doppler :</strong> γ_D = 0.0015 cm⁻¹ (thermique)</div>
            </div>
          </div>
        </div>

        {/* 4.7 & 4.8 : Laboratoire Beer-Lambert & Flux CAMS/CITEPA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* 4.7 Laboratoire virtuel de transfert radiatif */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">Module 4.7</span>
                <h3 className="text-lg font-bold text-white">Simulateur Beer-Lambert &amp; Forçage</h3>
              </div>
              <button
                onClick={() => onSelectView('spectroscopy-lab')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Lancer le Labo</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Calcul ab initio de la transmittance spectrale T(ν) = exp(-τ(ν)), de la saturation au cœur de la raie et du forçage radiatif troposphérique logarithmique formulé par le GIEC.
            </p>
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2 font-mono text-xs">
              <div className="text-rose-300 font-bold">Loi du Forçage Radiatif : ΔF = 5.35 · ln(C / C₀) W/m²</div>
              <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                Le forçage radiatif est logarithmique car le cœur de la bande 15 µm est opaque dès les concentrations préindustrielles. L'énergie piégée supplémentaire s'opère dans les ailes de Lorentz.
              </p>
            </div>
          </div>

          {/* 4.8 Flux, émissions et cycle du carbone */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">Module 4.8</span>
                <h3 className="text-lg font-bold text-white">Flux, Émissions &amp; Inventaires CITEPA</h3>
              </div>
              <button
                onClick={() => onSelectView('flux')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Échanges nets de surface (photosynthèse printanière NEE, respiration du sol), bilan mondial Global Carbon Project et décomposition sectorielle des émissions françaises du CITEPA (SECTEN).
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Transports France</span>
                <span className="text-amber-400 font-bold block mt-0.5">31.4% des émissions</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Puits Forestier UTCATF</span>
                <span className="text-emerald-400 font-bold block mt-0.5">-28.4 Mt CO₂e</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4.9 & 4.10 : Comparateur Multi-Sources & Exports Certifiés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* 4.9 Comparateur multi-sources */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Module 4.9</span>
                <h3 className="text-lg font-bold text-white">Comparateur Multi-Sources &amp; Écarts</h3>
              </div>
              <button
                onClick={() => onSelectView('compare')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Comparer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Confrontation directe et simultanée entre mesures in situ au sol (NOAA/ICOS), colonnes satellitaires (NASA OCO-2) et assimilation 3D (Copernicus CAMS). Détection automatique des écarts-types et des anomalies de représentativité.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-white font-semibold">Analyse de cohérence :</strong> Calcul automatique du biais moyen (Mean Bias Error MBE) et de l'écart quadratique moyen (RMSE).
            </div>
          </div>

          {/* 4.10 Exports de données et science ouverte */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Module 4.10</span>
                <h3 className="text-lg font-bold text-white">Exports Normalisés &amp; Science Ouverte</h3>
              </div>
              {onOpenReport && (
                <button
                  onClick={onOpenReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>Rapport PDF</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Exportez n'importe quel jeu de données en <strong>CSV certifié, GeoJSON RFC 7946, NetCDF CF-1.8 CDL, Parquet/NDJSON, SVG vectoriel haute résolution</strong> ou <strong>Rapport d'audit PDF ISO/IEC 17025</strong> avec empreinte cryptographique SHA-256.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">CSV Metadata WMO</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">NetCDF CF-1.8</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">GeoJSON RFC 7946</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">Parquet / NDJSON</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">Rapport ISO 17025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mini-Simulateur Radiatif Interactif sur la Landing Page */}
      <section className="p-6 md:p-8 rounded-2xl border border-rose-500/30 bg-rose-950/15 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-rose-400 font-bold">
              <Atom className="w-3.5 h-3.5" />
              <span>Simulateur Didactique Embarqué</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
              Expérimentez le forçage radiatif du CO₂ en direct
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Déplacez le curseur de concentration pour recalculer instantanément le forçage radiatif troposphérique ΔF selon la formule logarithmique du GIEC.
            </p>
          </div>

          <button
            onClick={() => onSelectView('spectroscopy-lab')}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-md transition-colors cursor-pointer"
          >
            <span>Laboratoire Quantique Complet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Concentration atmosphérique :</span>
              <span className="text-xl font-bold text-cyan-400">{co2Slider} ppm</span>
            </div>

            <input
              type="range"
              min="200"
              max="900"
              step="5"
              value={co2Slider}
              onChange={e => setCo2Slider(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              aria-label="Concentration de CO2 en ppm"
            />

            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <button
                onClick={() => setCo2Slider(280)}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  co2Slider === 280 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                280 ppm (Préindustriel)
              </button>
              <button
                onClick={() => setCo2Slider(426)}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  co2Slider === 426 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                426 ppm (Actuel 2026)
              </button>
              <button
                onClick={() => setCo2Slider(560)}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  co2Slider === 560 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                560 ppm (Doublement 2×CO₂)
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Forçage Radiatif ΔF</span>
              <span className="text-xl font-bold text-rose-400 mt-1 block">+{radiativeForcing} <span className="text-xs text-slate-400 font-normal">W/m²</span></span>
              <span className="text-[10px] text-slate-500 block mt-1">ΔF = 5.35 · ln(C/280)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Réchauffement Équilibre</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">+{deltaTempEquilibrium} <span className="text-xs text-slate-400 font-normal">°C</span></span>
              <span className="text-[10px] text-slate-500 block mt-1">λ ~ 0.8 K/(W/m²)</span>
            </div>

            <div className="col-span-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 text-[11px] text-slate-300 leading-relaxed font-sans">
              <strong className="text-white font-semibold">Physique sous-jacente :</strong> Le cœur de la bande à 15 µm est déjà optiquement saturé. Le forçage supplémentaire provient de l'absorption dans les ailes de Lorentz, ce qui explique la dépendance logarithmique exacte.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — Comprendre les Mécanismes Scientifiques
          ========================================================================= */}
      <section id="mecanismes" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">
            <Atom className="w-3.5 h-3.5" />
            <span>Pédagogie &amp; Vulgarisation Rigoureuse</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Comprendre les Mécanismes Scientifiques
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Cinq questions fondamentales pour décrypter la physique du dioxyde de carbone, de l'échelle quantique microscopique aux équilibres thermodynamiques planétaires.
          </p>
        </div>

        {/* 5 blocs interactifs pour les 5 mécanismes */}
        <div className="max-w-4xl mx-auto space-y-4">
          {scientificMechanisms.map((mech, idx) => {
            const isSelected = activeMechanism === idx;
            return (
              <div 
                key={mech.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isSelected 
                    ? 'border-cyan-500/50 bg-slate-900/90 shadow-xl' 
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setActiveMechanism(isSelected ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isSelected}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                      {mech.shortTitle}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {mech.title}
                    </h3>
                  </div>
                  <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0 transition-transform ${isSelected ? 'rotate-180 text-cyan-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isSelected && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-800/80 animate-in fade-in duration-150">
                    <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-rose-300 border border-slate-800">
                      {mech.formula}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      {mech.explanation}
                    </p>
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-200">
                      <strong className="text-white font-semibold block mb-0.5">À retenir :</strong>
                      {mech.keyTakeaway}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — Les Sources Scientifiques
          ========================================================================= */}
      <section id="sources" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">
            <Database className="w-3.5 h-3.5" />
            <span>Transparence des Données Primaires</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Les Sources Scientifiques Officielles
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Carbonor n'invente aucune mesure. Toutes les données exploitées proviennent des plus grandes institutions scientifiques mondiales, sous licences ouvertes et avec attribution stricte.
          </p>
        </div>

        {/* Fiches détaillées des 7 sources majeures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {scientificSourcesList.map(source => (
            <div key={source.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{source.name}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">{source.org}</span>
                </div>
                <a
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="Visiter le portail officiel"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-slate-300">
                  <span className="text-slate-400">Nature :</span> {source.dataType}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Stations :</span> {source.stations}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Standard :</span> {source.standard}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Licence :</span> {source.license}
                </div>
                <div className="text-cyan-400 pt-1 text-[11px]">
                  <strong>Référence / DOI :</strong> {source.doi}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — Rigueur Scientifique et Transparence
          ========================================================================= */}
      <section id="rigueur" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Déontologie &amp; Traçabilité</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Rigueur Scientifique &amp; Transparence
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Pour être digne de confiance avant toute publication ou utilisation pédagogique, Carbonor applique les standards d'audit les plus exigeants de la métrologie atmosphérique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Traçabilité Cryptographique</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Chaque flux de données collecté est validé par empreinte SHA-256, horodaté en temps universel coordonné (UTC) et associé à ses coordonnées géodésiques WGS84 précises.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 w-fit">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Incertitudes &amp; Quality Flags</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Aucun chiffre n'est affiché sans son intervalle d'incertitude type (± 0.12 ppm au sol, ± 1.2 ppm en satellite) et son drapeau de qualité (Quality Flag 0 certifié pour OCO-2).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400 w-fit">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Mode Dégradé &amp; Cache Transparent</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              En cas de perte de connexion réseau, l'application ne freeze jamais : elle bascule en 🟡 Mode Démonstration en avertissant l'utilisateur que des fixtures locales sont exploitées.
            </p>
          </div>
        </div>

        {/* Sélecteur de mode interactif dans la section rigueur */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-mono font-bold text-white block">
              Basculez entre le Mode Démonstration et le Mode Données Réelles :
            </span>
            <span className="text-xs text-slate-400 block font-sans">
              {isRealData 
                ? '🟢 Mode Actif : Flux direct auprès des API officielles avec certificats' 
                : '🟡 Mode Actif : Fixtures scientifiques locales embarquées autonomes'}
            </span>
          </div>

          <button
            onClick={toggleDataMode}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
              isRealData
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                : 'bg-amber-950 text-amber-300 border-amber-500/50 hover:bg-amber-900'
            }`}
          >
            <span>Basculer en {isRealData ? 'Mode Démonstration 🟡' : 'Mode Réel 🟢'}</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8 — PWA & Fonctionnement Hors Ligne
          ========================================================================= */}
      <section id="pwa" className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 max-w-5xl mx-auto space-y-6 scroll-mt-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conception Moderne Progressive Web App</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Une application pensée pour le terrain, les amphis et les laboratoires
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Carbonor s'installe d'un simple clic sur votre ordinateur (macOS, Windows, Linux) ou votre mobile (iOS, Android). Grâce à son Service Worker et à son cache local, elle reste 100% fonctionnelle même sans connexion Internet.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-center font-bold">
              ✓ 100% Fonctionnel Hors Ligne
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs text-center font-bold">
              ✓ Conforme PWA Standard W3C
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white font-bold block">Installation Instantanée</strong>
            <p className="text-slate-400 font-sans text-[11px]">Aucun téléchargement lourd ni passage par un App Store. Cliquez sur « Installer » dans votre navigateur.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white font-bold block">Persistance Locale</strong>
            <p className="text-slate-400 font-sans text-[11px]">Vos préférences d'affichage, sélections de stations et calculs de forçage sont mémorisés localement.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white font-bold block">Accessibilité Clavier &amp; ARIA</strong>
            <p className="text-slate-400 font-sans text-[11px]">Balisage sémantique complet, contrastes optimisés et navigation intégrale au clavier sans souris.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9 — À qui s'adresse Carbonor ?
          ========================================================================= */}
      <section id="public" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Publics &amp; Usages Ciblés</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            À qui s'adresse Carbonor ?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            De la recherche académique à l'enseignement secondaire, découvrez comment Carbonor répond aux besoins spécifiques de chaque communauté d'utilisateurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {targetAudiences.map((aud, idx) => {
            const IconComp = aud.icon;
            return (
              <div key={idx} className={`p-5 rounded-2xl border ${aud.color.split(' ')[0]} bg-slate-900/60 space-y-3 shadow-lg flex flex-col justify-between`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
                      <IconComp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{aud.tag}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{aud.role}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{aud.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 10 — FAQ Interactive (12 Questions)
          ========================================================================= */}
      <section id="faq" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions Fréquentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Foire Aux Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Retrouvez les réponses aux 12 questions les plus courantes sur le fonctionnement, les données et l'utilisation de Carbonor.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/40 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.q}
                  </span>
                  <div className={`p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bloc Citation dans un travail de recherche */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 max-w-3xl mx-auto space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              Format de Citation Recommandé
            </span>
            <button
              onClick={() => copyToClipboard('Carbonor Research Team (2026). Carbonor : Observatoire ouvert du CO₂ atmosphérique et du cycle du carbone, de la spectroscopie moléculaire HITRAN aux réseaux d\'observation sol et satellites. https://github.com/jeanpierrenouhailler-dot/carbonor')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors cursor-pointer"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copier la citation</span>
                </>
              )}
            </button>
          </div>
          <p className="text-slate-300 font-sans text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            « Carbonor Research Team (2026). Carbonor : Observatoire ouvert du CO₂ atmosphérique et du cycle du carbone, de la spectroscopie moléculaire HITRAN aux réseaux d'observation sol et satellites. https://github.com/jeanpierrenouhailler-dot/carbonor »
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — Appel à l'action final (CTA)
          ========================================================================= */}
      <section id="cta" className="relative p-8 md:p-12 rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-950 text-center max-w-4xl mx-auto space-y-6 shadow-2xl scroll-mt-20 overflow-hidden">
        <div 
          aria-hidden="true" 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/20 blur-3xl pointer-events-none -z-10" 
        />

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Explorez l'atmosphère dès aujourd'hui
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Accédez gratuitement à Carbonor, manipulez les données scientifiques et explorez le cycle du carbone avec les outils de la recherche moderne.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onSelectView('dashboard')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-sm font-bold shadow-xl shadow-cyan-950/60 transition-all cursor-pointer"
          >
            <span>Accéder à Carbonor</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/jeanpierrenouhailler-dot/carbonor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Découvrir le projet sur GitHub</span>
          </a>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12 — Footer Complet
          ========================================================================= */}
      <footer className="pt-12 border-t border-slate-800 text-xs text-slate-400 space-y-8 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Colonne 1 : Logo & Présentation */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>CARBONOR</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Plateforme scientifique ouverte pour explorer le CO₂ atmosphérique, de la spectroscopie moléculaire HITRAN aux observations planétaires in situ et satellites.
            </p>
            <div className="text-[10px] text-slate-500 pt-1">
              Licence Open-Source MIT · 2026
            </div>
          </div>

          {/* Colonne 2 : Modules Scientifiques */}
          <div className="space-y-2">
            <strong className="text-white text-xs block font-bold uppercase tracking-wider">
              Modules
            </strong>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => onSelectView('dashboard')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Tableau de Bord &amp; Keeling
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('map')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Carte OpenStreetMap
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('surface')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Concentration au Sol In Situ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('xco2')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Télédétection XCO₂ (OCO-2)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('profiles')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Profils Verticaux AirCore
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('spectroscopy-lab')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Laboratoire Beer-Lambert
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('spectroscopy-lines')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Raies Quantiques HITRAN
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('flux')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Flux CAMS &amp; CITEPA
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('compare')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Comparateur Multi-Sources
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Données & Rigueur */}
          <div className="space-y-2">
            <strong className="text-white text-xs block font-bold uppercase tracking-wider">
              Données &amp; Rigueur
            </strong>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => onSelectView('sources')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Sources &amp; Licences Officielles
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('pipeline-audit')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Audit du Pipeline &amp; SHA-256
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('docs')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Méthodes Scientifiques
                </button>
              </li>
              <li>
                <a href="https://gml.noaa.gov/ccgg/trends/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  NOAA Global Monitoring Lab ↗
                </a>
              </li>
              <li>
                <a href="https://www.icos-cp.eu/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  ICOS Carbon Portal ↗
                </a>
              </li>
              <li>
                <a href="https://oco2.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  NASA OCO-2 Science Team ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Projet & Communauté */}
          <div className="space-y-2">
            <strong className="text-white text-xs block font-bold uppercase tracking-wider">
              Projet &amp; Partage
            </strong>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a 
                  href="https://github.com/jeanpierrenouhailler-dot/carbonor" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Dépôt GitHub Officiel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              {onOpenReport && (
                <li>
                  <button onClick={onOpenReport} className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
                    <FileText className="w-3 h-3 text-emerald-400" />
                    <span>Télécharger Rapport PDF</span>
                  </button>
                </li>
              )}
              <li className="pt-2 text-slate-500 font-sans text-[10px]">
                Étalons certifiés WMO-CO2-X2019. Résolution raie-par-raie HITRAN 2020.
              </li>
            </ul>
          </div>
        </div>

        {/* Mentions légales et déontologiques de bas de page */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-slate-400 font-sans text-center sm:text-left">
            Données scientifiques fournies à titre de recherche et d'enseignement ouvert. Partenaires métrologiques : NOAA GML, ICOS ERIC, NASA Earthdata JPL, Copernicus ECMWF, Harvard-Smithsonian CfA et CITEPA.
          </p>
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <span>v2.4.0</span>
            <span>·</span>
            <span>PWA Ouverte</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">Carbonor 2026</span>
          </div>
        </div>
      </footer>

      {/* Modal Plein Écran pour l'Inspection Haute Définition des Captures Réelles */}
      {zoomedScreenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setZoomedScreenshot(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-6xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 md:p-6 overflow-hidden space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  {zoomedScreenshot.category} · Capture Haute Définition
                </span>
                <h3 className="text-base font-bold text-white">
                  {zoomedScreenshot.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = zoomedScreenshot.targetView;
                    setZoomedScreenshot(null);
                    onSelectView(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <span>Ouvrir dans l'App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomedScreenshot(null)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Fermer la vue agrandie"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-auto rounded-xl border border-slate-800 bg-black/50">
              <img
                src={zoomedScreenshot.image}
                alt={zoomedScreenshot.title}
                className="w-full h-auto object-contain"
              />
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {zoomedScreenshot.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
