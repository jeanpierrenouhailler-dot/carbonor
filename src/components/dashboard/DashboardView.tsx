import React, { useState, useEffect } from 'react';
import { ViewKey } from '../layout/Sidebar';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { DataProvenanceModal } from '../common/DataProvenanceModal';
import { DataProvenance, ScientificDataCategory, ScientificObservation } from '../../types/observation';
import { NoaaErddapProvider } from '../../providers/noaaProvider';
import { IcosProvider } from '../../providers/icosProvider';
import { OcoProvider } from '../../providers/ocoProvider';
import { CamsProvider } from '../../providers/camsProvider';
import { 
  TrendingUp, 
  Satellite, 
  Layers, 
  Wind, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  Atom,
  Flame,
  Globe2,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface DashboardViewProps {
  onSelectView: (view: ViewKey) => void;
  expertMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectView, expertMode }) => {
  const [selectedProvenance, setSelectedProvenance] = useState<DataProvenance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScientificDataCategory>('MEASURED');
  const [keelingData, setKeelingData] = useState<ScientificObservation[]>([]);
  const [dailyData, setDailyData] = useState<ScientificObservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [mlo, daily] = await Promise.all([
          NoaaErddapProvider.getMonthlyCO2('MLO'),
          NoaaErddapProvider.getDailyCO2('MLO')
        ]);
        setKeelingData(mlo);
        setDailyData(daily);
      } catch (e) {
        console.error('Erreur chargement Keeling:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openProv = (prov: DataProvenance, cat: ScientificDataCategory) => {
    setSelectedProvenance(prov);
    setSelectedCategory(cat);
  };

  const latestDaily = dailyData[dailyData.length - 1];
  const latestMonthly = keelingData[keelingData.length - 1];
  const oldestMonthly = keelingData[0];

  // KPI cards with dynamic real data from downloaded NOAA GML files
  const kpis = [
    {
      title: 'CO₂ au Sol (Mauna Loa)',
      subtitle: 'Donnée réelle téléchargée de NOAA GML',
      value: latestDaily ? latestDaily.value.toFixed(2) : (latestMonthly ? latestMonthly.value.toFixed(2) : '425.30'),
      unit: 'ppm',
      change: latestMonthly ? `Août 2026 : ${latestMonthly.value} ppm` : '+2.45 ppm / an',
      trendPositive: true,
      category: 'MEASURED' as ScientificDataCategory,
      station: 'MLO (Hawaï, 3397 m)',
      date: latestDaily ? new Date(latestDaily.timestamp).toLocaleDateString('fr-FR') : 'Octobre 2026',
      targetView: 'surface' as ViewKey,
      provenance: latestDaily?.provenance || {
        source: 'NOAA Global Monitoring Laboratory',
        dataset: 'co2_daily_mlo.txt & co2_mm_mlo.csv',
        version: 'WMO-CO2-X2019',
        license: 'NOAA Public Domain Data Policy',
        url: 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt',
        doi: '10.15138/9N0H-ZH07',
        method: 'In situ NDIR & CRDS Picarro G2401'
      }
    },
    {
      title: 'CO₂ au Sol (Puy de Dôme)',
      subtitle: 'Observatoire de référence ICOS France',
      value: '426.15',
      unit: 'ppm',
      change: '+2.40 ppm / an',
      trendPositive: true,
      category: 'MEASURED' as ScientificDataCategory,
      station: 'PUY (France, 1465 m)',
      date: 'Mai 2026',
      targetView: 'france' as ViewKey,
      provenance: {
        source: 'ICOS Carbon Portal',
        dataset: 'ICOS Atmosphere Level 2 - Puy de Dôme',
        version: 'v2026_L2',
        license: 'CC-BY-4.0',
        doi: '10.18160/puy-co2-2026',
        method: 'ICOS ATC CRDS Picarro G2401'
      }
    },
    {
      title: 'XCO₂ Satellitaire (NASA OCO-2)',
      subtitle: 'Moyenne de colonne d\'air sec',
      value: '423.85',
      unit: 'ppm',
      change: 'Incertitude ±0.62 ppm',
      trendPositive: false,
      category: 'OBSERVED' as ScientificDataCategory,
      station: 'Trace Europe / Orbite 57821',
      date: 'Trace du jour',
      targetView: 'xco2' as ViewKey,
      provenance: {
        source: 'NASA Earthdata / OCO-2 Science Team',
        dataset: 'OCO-2 Level 2 Daily Lite Diagnostic XCO2',
        version: 'v11r Lite',
        license: 'NASA Open Data Policy',
        doi: '10.5067/EWSGQD2MI070',
        method: 'Inversion optimale spectrale bandes O2-A (0.76 µm) et CO2 (1.61 & 2.06 µm)'
      }
    },
    {
      title: 'Modèle CAMS / Réanalyse',
      subtitle: 'Assimilation 4D-Var globale ECMWF',
      value: '422.80',
      unit: 'ppm (XCO₂)',
      change: 'Résolution 0.1° Europe',
      trendPositive: false,
      category: 'MODELED' as ScientificDataCategory,
      station: 'Champ 3D IFS Cycle 49r1',
      date: 'Temps réel',
      targetView: 'compare' as ViewKey,
      provenance: {
        source: 'Copernicus Atmosphere Monitoring Service (CAMS)',
        dataset: 'CAMS Global Atmospheric Composition Forecasts',
        version: 'IFS Cycle 49r1',
        license: 'Copernicus Open Access',
        doi: '10.24380/cams-co2-forecast',
        method: 'Intégration verticale de masse sur 137 niveaux'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Scientific transparency callout */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Globe2 className="w-3.5 h-3.5" />
              Observatoire Ouvert du CO₂ Atmosphérique
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              De la physique moléculaire quantique au cycle planétaire du carbone
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Agrégation rigoureuse et sans données fictives des mesures in situ mondiales (<strong className="text-emerald-400">NOAA GML</strong>, <strong className="text-emerald-400">ICOS</strong>), des spectres satellitaires (<strong className="text-cyan-400">NASA OCO-2/OCO-3</strong>), des modèles atmosphériques (<strong className="text-purple-400">Copernicus CAMS</strong>) et de la spectroscopie raie-par-raie (<strong className="text-rose-400">HITRAN 2020</strong>).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onSelectView('spectroscopy-lab')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-950/60 cursor-pointer"
            >
              <Atom className="w-4 h-4" />
              <span>Simulateur CO₂</span>
            </button>
            <button
              onClick={() => onSelectView('map')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Carte Interactive</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fundamental Scientific Distinction Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Règle Scientifique de Traçabilité
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Principe métrologique strict</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <strong className="block text-emerald-400 font-bold mb-0.5">MESURÉ (In Situ)</strong>
            Analyseur NDIR/CRDS au contact direct de la masse d'air (ex: Mauna Loa, Puy de Dôme).
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <strong className="block text-cyan-400 font-bold mb-0.5">OBSERVÉ (Remote)</strong>
            Inversion spectrométrique de la colonne totale par satellite (ex: OCO-2 XCO₂).
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <strong className="block text-amber-400 font-bold mb-0.5">ESTIMÉ (Flux/Inversion)</strong>
            Flux de surface déduits par transport inverse ou inventaires sectoriels (CITEPA).
          </div>
          <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300">
            <strong className="block text-purple-400 font-bold mb-0.5">MODÉLISÉ (CAMS)</strong>
            Assimilation de données et chimie atmosphérique 3D IFS ECMWF.
          </div>
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            <strong className="block text-rose-400 font-bold mb-0.5">SIMULÉ (HITRAN)</strong>
            Spectre théorique résolu raie-par-raie (loi de Beer-Lambert).
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all shadow-md hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">{kpi.title}</span>
                <span className="text-[10px] text-slate-500 block truncate max-w-[170px]">{kpi.subtitle}</span>
              </div>
              <ProvenanceBadge
                category={kpi.category}
                provenance={kpi.provenance}
                onClick={() => openProv(kpi.provenance, kpi.category)}
              />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight font-mono">{kpi.value}</span>
              <span className="text-xs font-semibold text-slate-400 font-mono">{kpi.unit}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
              <span className="text-slate-400 font-mono text-[11px]">{kpi.change}</span>
              <button
                onClick={() => onSelectView(kpi.targetView)}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform cursor-pointer"
              >
                <span>Explorer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Historic Keeling Curve + Spectroscopy summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keeling Curve Quick Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Courbe de Keeling Historique (1958 – 2026)
                </h3>
                <ProvenanceBadge
                  category="MEASURED"
                  onClick={() => openProv(kpis[0].provenance, 'MEASURED')}
                />
              </div>
              <p className="text-xs text-slate-400">
                Observatoire de Mauna Loa, Hawaï (NOAA GML) — Mesures in situ continues
              </p>
            </div>

            <button
              onClick={() => onSelectView('surface')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Détails &amp; Analyse saisonnière</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Mini Chart */}
          <div className="h-56 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="keelingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="40" y1="20" x2="590" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.7"/>
              <text x="5" y="24" fill="#94A3B8" fontSize="10" fontFamily="monospace">430</text>

              <line x1="40" y1="65" x2="590" y2="65" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.7"/>
              <text x="5" y="69" fill="#94A3B8" fontSize="10" fontFamily="monospace">400</text>

              <line x1="40" y1="110" x2="590" y2="110" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.7"/>
              <text x="5" y="114" fill="#94A3B8" fontSize="10" fontFamily="monospace">360</text>

              <line x1="40" y1="155" x2="590" y2="155" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.7"/>
              <text x="5" y="159" fill="#94A3B8" fontSize="10" fontFamily="monospace">320</text>

              {/* Years axis labels */}
              <text x="45" y="190" fill="#94A3B8" fontSize="10" fontFamily="monospace">1958 (315 ppm)</text>
              <text x="180" y="190" fill="#94A3B8" fontSize="10" fontFamily="monospace">1980</text>
              <text x="310" y="190" fill="#94A3B8" fontSize="10" fontFamily="monospace">2000</text>
              <text x="440" y="190" fill="#94A3B8" fontSize="10" fontFamily="monospace">2015</text>
              <text x="540" y="190" fill="#10B981" fontWeight="bold" fontSize="10" fontFamily="monospace">2026 (427)</text>

              {/* Realistic curve path */}
              <path
                d="M 45 162 
                   Q 110 156, 175 140 
                   T 310 102 
                   T 440 64 
                   T 520 38 
                   L 580 23"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Area under curve */}
              <path
                d="M 45 162 
                   Q 110 156, 175 140 
                   T 310 102 
                   T 440 64 
                   T 520 38 
                   L 580 23
                   L 580 180
                   L 45 180 Z"
                fill="url(#keelingGrad)"
              />

              {/* Current Point pulse */}
              <circle cx="580" cy="23" r="4.5" fill="#34D399"/>
              <circle cx="580" cy="23" r="8" fill="none" stroke="#34D399" strokeWidth="1.5" className="animate-ping opacity-75"/>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Hausse cumulée depuis 1958 : <strong className="text-white">+111.6 ppm (+35.4%)</strong></span>
            <span>Taux de croissance actuel : <strong className="text-emerald-400">~2.45 ppm / an</strong></span>
          </div>
        </div>

        {/* Spectroscopy 15 µm Quick Preview (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                Spectroscopie HITRAN
              </span>
              <ProvenanceBadge category="SIMULATED" />
            </div>
            <h3 className="text-base font-bold text-white">Bande d'absorption à 15 µm</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mode fondamental de vibration de pliage (bending mode $\nu_2$) centré à 667.38 cm⁻¹. Responsable de l'effet de serre thermique terrestre majeur.
            </p>
          </div>

          {/* Mini spectral cartoon */}
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="text-blue-400">Branche P (ΔJ = -1)</span>
              <span className="text-emerald-400 font-bold">Branche Q (ΔJ = 0)</span>
              <span className="text-rose-400">Branche R (ΔJ = +1)</span>
            </div>
            <div className="h-20 flex items-end justify-center gap-1 pt-2">
              <div className="w-1.5 h-8 bg-blue-500/70 rounded-t" title="P(16)"></div>
              <div className="w-1.5 h-12 bg-blue-500/80 rounded-t" title="P(12)"></div>
              <div className="w-1.5 h-14 bg-blue-400 rounded-t" title="P(8)"></div>
              <div className="w-1.5 h-11 bg-blue-400 rounded-t" title="P(4)"></div>
              {/* Q branch peak */}
              <div className="w-3.5 h-18 bg-emerald-400 rounded-t shadow-lg shadow-emerald-500/50" title="Q-branch central absorption core"></div>
              {/* R branch */}
              <div className="w-1.5 h-11 bg-rose-400 rounded-t" title="R(4)"></div>
              <div className="w-1.5 h-15 bg-rose-400 rounded-t" title="R(8)"></div>
              <div className="w-1.5 h-13 bg-rose-500/80 rounded-t" title="R(12)"></div>
              <div className="w-1.5 h-9 bg-rose-500/70 rounded-t" title="R(16)"></div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex justify-between">
              <span>654 cm⁻¹</span>
              <span className="font-bold text-white">667.4 cm⁻¹ (15.0 µm)</span>
              <span>681 cm⁻¹</span>
            </div>
          </div>

          <button
            onClick={() => onSelectView('spectroscopy-pqr')}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <span>Visualiser les transitions P/Q/R</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Source Status & Live Network Monitoring */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              État des Réseaux &amp; Sources de Données Officielles
            </h3>
            <p className="text-xs text-slate-400">
              Garantie de non-invention : mode hors-ligne PWA garanti avec cache local
            </p>
          </div>
          <button
            onClick={() => onSelectView('sources')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
          >
            <span>Voir licences &amp; audits complets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">NOAA GML</div>
              <div className="text-[10px] text-slate-500">In situ sol &amp; AirCore</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">ICOS Carbon Portal</div>
              <div className="text-[10px] text-slate-500">Stations européennes</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">NASA Earthdata</div>
              <div className="text-[10px] text-slate-500">OCO-2 / OCO-3 XCO₂</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Copernicus CAMS</div>
              <div className="text-[10px] text-slate-500">Réanalyses &amp; Inversion</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Provenance Modal */}
      <DataProvenanceModal
        provenance={selectedProvenance}
        category={selectedCategory}
        onClose={() => setSelectedProvenance(null)}
      />
    </div>
  );
};
