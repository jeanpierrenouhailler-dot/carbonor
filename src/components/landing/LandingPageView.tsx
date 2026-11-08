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
  Compass, 
  ExternalLink,
  Flame,
  CheckCircle2,
  Sliders,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface LandingPageViewProps {
  onSelectView: (view: ViewKey) => void;
  onOpenReport?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSelectView,
  onOpenReport
}) => {
  const { dataMode, isRealData, toggleDataMode, modeLabel } = useDataMode();

  // Mini-calculateur interactif de forçage radiatif sur la landing
  const [co2Slider, setCo2Slider] = useState<number>(426);
  const baselineCo2 = 280; // ppm préindustriel (carottes glaciaires Law Dome & Dome C)

  // Formule scientifique du GIEC (Myhre et al., 1998 / Ramaswamy et al., AR5 & AR6)
  // ΔF = 5.35 * ln(C / C0) W/m²
  const radiativeForcing = parseFloat((5.35 * Math.log(co2Slider / baselineCo2)).toFixed(2));
  
  // Sensibilité climatique d'équilibre (Equilibrium Climate Sensitivity ECS ~ 3.0 °C pour un doublement = 3.71 W/m²)
  // Paramètre de rétroaction climatique λ ~ 0.8 K / (W/m²)
  const deltaTempEquilibrium = parseFloat((radiativeForcing * 0.8).toFixed(2));

  // Opacité optique relative approximative au centre de la bande 15 µm
  const opticalDepthRatio = parseFloat((co2Slider / baselineCo2).toFixed(2));

  // Onglet interactif pour la distinction épistémologique
  const [selectedPillar, setSelectedPillar] = useState<'measured' | 'observed' | 'estimated' | 'modeled' | 'simulated'>('measured');

  const pillars = {
    measured: {
      category: 'MESURÉ (In Situ)',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/20',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      sources: 'NOAA GML · Observatoires ICOS · Réseau GAW/OMM',
      instruments: 'Spectromètres CRDS Picarro G2401 · Analyseurs NDIR · Échelle WMO-CO2-X2019',
      summary: 'L\'air ambiant entre physiquement dans une cellule optique de mesure. La concentration est déterminée par absorption infrarouge ou résonance en cavité optique fermée, étalonnée quotidiennement sur des gaz étalons primaires certifiés.',
      examples: 'Mauna Loa (3397 m), Puy de Dôme (1465 m), Mace Head, Cape Grim, Pôle Sud.',
      targetView: 'surface' as ViewKey
    },
    observed: {
      category: 'OBSERVÉ (Télédétection)',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/20',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/30',
      sources: 'NASA Earthdata · Satellites OCO-2 & OCO-3',
      instruments: 'Spectromètres à réseau haute résolution (0.76 µm O₂-A, 1.61 µm WCO₂, 2.06 µm SCO₂)',
      summary: 'La lumière solaire réfléchie par le sol traverse toute l\'épaisseur de l\'atmosphère. L\'atténuation spectrale est inversée par algorithme d\'estimation optimale (ACOS v11) pour déduire la moyenne de colonne d\'air sec XCO₂.',
      examples: 'Sondages orbitaux quotidiens, empreintes au sol de 1.29 × 2.25 km, diagnostic Flag 0/1.',
      targetView: 'xco2' as ViewKey
    },
    estimated: {
      category: 'ESTIMÉ (Flux & Inversion)',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/20',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/30',
      sources: 'CITEPA (SECTEN) · Global Carbon Project · GIEC',
      instruments: 'Transport inverse bayésien · Modèles de trafic COPERT · Inventaires CRF/CCNUCC',
      summary: 'Les émissions et puits de carbone ne sont pas directement mesurables en continu sur chaque mètre carré : ils sont déduits par modélisation statistique d\'activités humaines et par inversion du gradient atmosphérique.',
      examples: 'Inventaire national français 2026, puits forestier UTCATF, budget carbone mondial.',
      targetView: 'flux' as ViewKey
    },
    modeled: {
      category: 'MODÉLISÉ (Modèles 3D)',
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/20',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/30',
      sources: 'Copernicus CAMS · Centre Européen ECMWF',
      instruments: 'Modèle numérique IFS Cycle 49r1 · Assimilation variationnelle 4D-Var',
      summary: 'Résolution numérique tridimensionnelle des équations de Navier-Stokes couplées à la photochimie atmosphérique. Intègre des millions d\'observations sol et satellites pour interpoler l\'état global en tout point du globe.',
      examples: 'Grille atmosphérique 3D Europe, profils barométriques de surface jusqu\'à 10 hPa.',
      targetView: 'compare' as ViewKey
    },
    simulated: {
      category: 'SIMULÉ (Transfert Radiatif)',
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgColor: 'bg-rose-950/20',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/30',
      sources: 'Base HITRAN 2020 (Harvard-Smithsonian CfA) · Protocole HAPI',
      instruments: 'Spectroscopie quantique raie-par-raie (LBL) · Loi de Beer-Lambert · Profils de Voigt',
      summary: 'Calcul ab initio des transitions de rotation-vibration de la molécule CO₂ à partir des nombres quantiques J, des coefficients d\'élargissement par pression et des intensités de raie fondamentales.',
      examples: '2 551 raies exactes résolues, bandes fondamentales à 15 µm (ν₂) et 4.3 µm (ν₃).',
      targetView: 'spectroscopy-lab' as ViewKey
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-4 md:pt-8">
        {/* Glow ambient background subtle lighting */}
        <div 
          aria-hidden="true" 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-gradient-to-b from-cyan-600/10 via-emerald-600/5 to-transparent blur-3xl pointer-events-none -z-10" 
        />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Scientific Status Tagline */}
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold">CO₂ Atmosphère</span>
            <span aria-hidden="true">·</span>
            <span>Spectroscopie &amp; Climatologie Planétaire</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">PWA Scientifique Ouverte</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            L'Observatoire du <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">CO₂ Atmosphérique</span>, de la molécule au climat
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            La première plateforme scientifique réunissant en temps réel la spectroscopie quantique raie-par-raie (HITRAN), les réseaux de mesure in situ (NOAA, ICOS), la télédétection satellitaire (NASA OCO-2/3) et l'assimilation 3D (Copernicus CAMS).
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectView('dashboard')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-sm font-bold shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/40 transition-all cursor-pointer"
            >
              <span>Accéder au Tableau de Bord</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectView('spectroscopy-lab')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Atom className="w-4 h-4 text-rose-400" />
              <span>Simulateur Beer-Lambert</span>
            </button>

            <button
              onClick={() => onSelectView('map')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Carte Multi-Réseaux</span>
            </button>
          </div>

          {/* Key Facts Metric Ribbon */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block">Concentration Globale</span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">426.50 <span className="text-xs text-slate-400 font-normal">ppm</span></span>
              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Courbe de Keeling (NOAA MLO)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block">Raies Spectrales HITRAN</span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">2 551 <span className="text-xs text-slate-400 font-normal">raies</span></span>
              <span className="text-[10px] text-rose-400 font-mono mt-1 block">Bandes 15 µm et 4.3 µm résolues</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block">Observatoires Mondiaux</span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">50+ <span className="text-xs text-slate-400 font-normal">stations</span></span>
              <span className="text-[10px] text-cyan-400 font-mono mt-1 block">NOAA GML, ICOS ATC, AirCore</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block">Intégrité Métrologique</span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">100% <span className="text-xs text-slate-400 font-normal">certifié</span></span>
              <span className="text-[10px] text-teal-400 font-mono mt-1 block">Norme WMO-CO2-X2019</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Core Scientific Principle Section */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            La Règle Métrologique Fondamentale
          </h2>
          <div className="text-2xl md:text-3xl font-black text-white tracking-tight">
            <span className="text-emerald-400">MESURÉ</span>
            <span className="text-slate-600 mx-2">≠</span>
            <span className="text-cyan-400">OBSERVÉ</span>
            <span className="text-slate-600 mx-2">≠</span>
            <span className="text-amber-400">ESTIMÉ</span>
            <span className="text-slate-600 mx-2">≠</span>
            <span className="text-purple-400">MODÉLISÉ</span>
            <span className="text-slate-600 mx-2">≠</span>
            <span className="text-rose-400">SIMULÉ</span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Pour garantir une rigueur scientifique irréprochable, l'application interdit tout mélange silencieux entre une mesure physique directe, une inversion satellitaire, un inventaire statistique et une simulation théorique.
          </p>
        </div>

        {/* Interactive Pillar Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl max-w-2xl mx-auto">
          {(Object.keys(pillars) as Array<keyof typeof pillars>).map(key => {
            const p = pillars[key];
            const isActive = selectedPillar === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPillar(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.category.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Detailed Card */}
        {(() => {
          const current = pillars[selectedPillar];
          return (
            <div className={`p-6 rounded-2xl border ${current.borderColor} ${current.bgColor} transition-all max-w-4xl mx-auto space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <span className={`text-sm font-mono font-bold ${current.color} block`}>
                    {current.category}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {current.sources}
                  </span>
                </div>
                <button
                  onClick={() => onSelectView(current.targetView)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <span>Explorer ce domaine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {current.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold mb-1">
                    Instruments &amp; Protocoles :
                  </span>
                  <span className="text-slate-300 leading-normal block">
                    {current.instruments}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold mb-1">
                    Exemples dans Carbonor :
                  </span>
                  <span className="text-slate-300 leading-normal block">
                    {current.examples}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 3. Interactive Physics Calculator Teaser */}
      <section className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-rose-400">
              <Atom className="w-3.5 h-3.5" />
              <span>Physique Moléculaire de l'Effet de Serre</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
              Testez le forçage radiatif logarithmique du CO₂
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Faites glisser la concentration pour calculer instantanément l'énergie radiative piégée dans la troposphère selon les équations du transfert radiatif (loi de Planck et forçage du GIEC).
            </p>
          </div>

          <button
            onClick={() => onSelectView('spectroscopy-lab')}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 text-xs font-mono font-bold border border-rose-500/40 transition-colors cursor-pointer"
          >
            <span>Laboratoire Quantique Complet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Slider Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Concentration atmosphérique :</span>
              <span className="text-lg font-bold text-cyan-400">{co2Slider} ppm</span>
            </div>

            <input
              type="range"
              min="200"
              max="900"
              step="5"
              value={co2Slider}
              onChange={e => setCo2Slider(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            {/* Benchmark buttons */}
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

          {/* Results Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Forçage Radiatif ΔF</span>
              <span className="text-xl font-bold text-rose-400 mt-1 block">+{radiativeForcing} <span className="text-xs text-slate-400 font-normal">W/m²</span></span>
              <span className="text-[10px] text-slate-400 block mt-1">ΔF = 5.35 · ln(C/280)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Réchauffement Équilibre</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">+{deltaTempEquilibrium} <span className="text-xs text-slate-400 font-normal">°C</span></span>
              <span className="text-[10px] text-slate-400 block mt-1">Sans rétroactions lentes</span>
            </div>

            <div className="col-span-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 text-[11px] text-slate-300 leading-relaxed font-sans">
              <strong className="text-white font-semibold">Mécanisme physique :</strong> Le cœur de la bande à 15 µm est déjà optiquement saturé au centre. Le réchauffement supplémentaire est généré par l'élargissement des ailes spectrales (élargissement collisionnel de Lorentz), ce qui explique la dépendance logarithmique stricte.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Application Modules Showcase */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            Architecture Complète de la Plateforme
          </h2>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Tous les outils de la recherche climatique réunis
          </h3>
          <p className="text-xs md:text-sm text-slate-400">
            Naviguez d'un simple clic vers l'un des modules analytiques spécialisés de Carbonor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Sol */}
          <div 
            onClick={() => onSelectView('surface')}
            className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">MESURÉ · In Situ</span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Mesures au Sol &amp; Keeling
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Données horaires et mensuelles historiques depuis 1958 pour Mauna Loa, Puy de Dôme, Mace Head et le Pôle Sud (échelles officielles WMO).
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>NOAA GML &amp; ICOS ATC</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 2: Satellite */}
          <div 
            onClick={() => onSelectView('xco2')}
            className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Satellite className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">OBSERVÉ · Satellites</span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Sondages Satellites OCO-2 / OCO-3
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Colonnes moyennes d'air sec XCO₂ par spectrométrie réseau SWIR, filtrage des quality flags (0/1) et empreintes individuelles de 1.29 × 2.25 km.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>NASA Earthdata L2 Lite</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 3: Carte Multi-Réseaux */}
          <div 
            onClick={() => onSelectView('map')}
            className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-teal-500/40 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-teal-400 font-semibold">SIG · OpenStreetMap</span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              Carte Interactive Multi-Réseaux
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vrai fond OpenStreetMap Leaflet avec sélecteur de styles (Standard, Sombre, Topo, Satellite) croisant stations au sol, trace OCO et grilles CAMS.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>Projection EPSG:3857</span>
              <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 4: Spectroscopie HITRAN */}
          <div 
            onClick={() => onSelectView('spectroscopy-lines')}
            className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-rose-500/40 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
                <Atom className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-rose-400 font-semibold">SIMULÉ · Quantique</span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Explorateur de Raies HITRAN 2020
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Base de 2 551 transitions avec nombres quantiques J, coefficients d'élargissement par air/self, énergies d'état inférieur E'' et profils de Voigt.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>Protocole HAPI / Harvard</span>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 5: Profils Verticaux */}
          <div 
            onClick={() => onSelectView('profiles')}
            className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-purple-400 font-semibold">ATMOSPHÈRE · 0–30 km</span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              Profils Verticaux &amp; AirCore
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Carottages d'air continus par ballon AirCore jusqu'à la stratosphère et gradient nocturne de la tour de Traînou (4 hauteurs réelles : 5m, 50m, 100m, 180m).
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>Traînou &amp; AirCore NOAA</span>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 6: Flux & Émissions */}
          <div 
            onClick={() => onSelectView('flux')}
            className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-500/40 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                <Wind className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">ESTIMÉ · Flux &amp; Inventaires</span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Flux CAMS &amp; Inventaires CITEPA
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assimilation inverse des échanges nets de surface (photosynthèse NEE printanière), bilan mondial GCP et rapport officiel SECTEN par secteur.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>ECMWF IFS &amp; CITEPA</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Provenance & Metrological Status Section */}
      <section className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Transparence Déontologique &amp; Double Régime
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pour éviter toute confusion avant une publication scientifique, Carbonor sépare rigoureusement le fonctionnement pédagogique autonome des flux certifiés en direct.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleDataMode}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                isRealData
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                  : 'bg-amber-950 text-amber-300 border-amber-500/50 hover:bg-amber-900'
              }`}
            >
              <span>{isRealData ? '🟢 Mode Actif : Données Réelles' : '🟡 Mode Actif : Démonstration'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-amber-400 font-bold">🟡 MODE DÉMONSTRATION</strong>
              <span className="text-[10px] text-amber-300/80">Offline / Pédagogie</span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Données d'exemples et fixtures scientifiques embarquées. Permet une démonstration instantanée et l'usage en classe ou hors-ligne sans requêter les serveurs distants.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-emerald-400 font-bold">🟢 MODE DONNÉES RÉELLES</strong>
              <span className="text-[10px] text-emerald-300/80">Recherche / Audit</span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Données récupérées auprès des sources officielles (NOAA GML, NASA CMR, ICOS, Copernicus). Chaque point est enrichi de son certificat métrologique, DOI et hash SHA-256.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Scientific Exports & Open Science */}
      <section className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Download className="w-3.5 h-3.5" />
            <span>Science Ouverte &amp; Reproductibilité</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Exports normalisés compatibles avec tous vos outils
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Exportez n'importe quel jeu en <strong>CSV certifié, GeoJSON RFC 7946, NetCDF CF-1.8 CDL, SVG haute résolution, Parquet/NDJSON ou Rapport PDF ISO/IEC 17025</strong> avec métadonnées de traçabilité complètes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Générer un Rapport PDF</span>
            </button>
          )}

          <button
            onClick={() => onSelectView('sources')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <span>Consulter les Licences &amp; DOIs</span>
          </button>
        </div>
      </section>

      {/* 7. Footer Citation & Credits */}
      <footer className="pt-8 border-t border-slate-900 text-xs text-slate-400 space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Carbonor</span>
            <span>·</span>
            <span>Observatoire Scientifique Ouvert du CO₂</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={() => onSelectView('docs')} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Documentation
            </button>
            <button onClick={() => onSelectView('pipeline-audit')} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Audit des Données
            </button>
            <button onClick={() => onSelectView('sources')} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Licences Officielles
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Données issues des programmes scientifiques officiels : NOAA Global Monitoring Laboratory, ICOS Carbon Portal, NASA Earthdata (OCO-2/3 Science Team), Copernicus Atmosphere Monitoring Service (ECMWF), HITRAN Database (Harvard-Smithsonian CfA) et CITEPA (SECTEN).
        </p>
      </footer>
    </div>
  );
};
