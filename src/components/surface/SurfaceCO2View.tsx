import React, { useState, useEffect } from 'react';
import { Station, ScientificObservation, DataProvenance, ScientificDataCategory } from '../../types/observation';
import { NoaaErddapProvider } from '../../providers/noaaProvider';
import { IcosProvider } from '../../providers/icosProvider';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { DataProvenanceModal } from '../common/DataProvenanceModal';
import { ExportButton } from '../common/ExportButton';
import { 
  Thermometer, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Download, 
  Info,
  Clock,
  Layers,
  ChevronRight,
  SunMedium
} from 'lucide-react';

export const SurfaceCO2View: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationCode, setSelectedStationCode] = useState<string>('MLO');
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  
  // Resolution: 'hourly' (24h) | 'daily' (90d) | 'monthly' (1958-2026) | 'seasonal'
  const [timeResolution, setTimeResolution] = useState<'hourly' | 'daily' | 'monthly'>('monthly');
  const [observations, setObservations] = useState<ScientificObservation[]>([]);
  const [comparisonStationCode, setComparisonStationCode] = useState<string>('PUY');
  const [comparisonObservations, setComparisonObservations] = useState<ScientificObservation[]>([]);

  const [selectedProvenance, setSelectedProvenance] = useState<DataProvenance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScientificDataCategory>('MEASURED');
  const [loading, setLoading] = useState(true);

  // Load available stations
  useEffect(() => {
    async function loadStations() {
      const noaa = await NoaaErddapProvider.getStations();
      const icos = await IcosProvider.getStations();
      const all = [...noaa, ...icos];
      setStations(all);
      const initial = all.find(s => s.code === 'MLO') || all[0];
      setCurrentStation(initial);
    }
    loadStations();
  }, []);

  // Load observations when station or resolution changes
  useEffect(() => {
    async function loadObs() {
      setLoading(true);
      try {
        if (timeResolution === 'hourly') {
          const data = await NoaaErddapProvider.getHourlyCO2(selectedStationCode);
          setObservations(data);
        } else if (timeResolution === 'daily') {
          const data = await NoaaErddapProvider.getDailyCO2(selectedStationCode);
          setObservations(data);
        } else {
          const data = await NoaaErddapProvider.getMonthlyCO2(selectedStationCode);
          setObservations(data);
        }

        // Comparison dataset if monthly
        if (timeResolution === 'monthly' && comparisonStationCode) {
          const compData = await NoaaErddapProvider.getMonthlyCO2(comparisonStationCode);
          setComparisonObservations(compData);
        }
      } catch (err) {
        console.error('Erreur chargement observations:', err);
      } finally {
        setLoading(false);
      }
    }

    const st = stations.find(s => s.code === selectedStationCode);
    if (st) setCurrentStation(st);
    loadObs();
  }, [selectedStationCode, timeResolution, comparisonStationCode, stations]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-400" />
              Concentrations de CO₂ au Sol (In Situ)
            </h2>
            <ProvenanceBadge category="MEASURED" />
          </div>
          <p className="text-xs text-slate-400">
            Réseau de surveillance mondial NOAA GML et observatoires européens ICOS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            data={observations}
            datasetName={`co2_surface_${selectedStationCode}_${timeResolution}`}
          />
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-2">
            Station :
          </span>
          {stations.map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStationCode(st.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                selectedStationCode === st.code
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/40'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="font-bold">{st.code}</span>
              <span className="opacity-70 text-[10px] ml-1">({st.network})</span>
            </button>
          ))}
        </div>

        {/* Resolution Tabs */}
        <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-mono">
          <button
            onClick={() => setTimeResolution('hourly')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              timeResolution === 'hourly' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            24h Horaire
          </button>
          <button
            onClick={() => setTimeResolution('daily')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              timeResolution === 'daily' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            90 Jours
          </button>
          <button
            onClick={() => setTimeResolution('monthly')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              timeResolution === 'monthly' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Historique (1958–2026)
          </button>
        </div>
      </div>

      {/* Station Summary Metrics */}
      {currentStation && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Dernière Mesure</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{currentStation.currentCO2}</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">ppm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(currentStation.currentCO2Date).toLocaleDateString('fr-FR')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Moyenne Mensuelle</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-200 font-mono">{currentStation.monthlyAverage}</span>
              <span className="text-xs text-slate-400 font-mono">ppm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Moyenne glissante 30 j</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Moyenne Annuelle</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-200 font-mono">{currentStation.yearlyAverage}</span>
              <span className="text-xs text-slate-400 font-mono">ppm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Année civile 2025</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tendance Linéaire</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400 font-mono">+{currentStation.trendYearlyPpm}</span>
              <span className="text-xs text-slate-400 font-mono">ppm/an</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Régression décennale</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Amplitude Saisonière</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-cyan-400 font-mono">±{(currentStation.seasonalAmplitudePpm / 2).toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-mono">ppm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Photosynthèse / Respiration</span>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Série Temporelle : {currentStation?.name} ({selectedStationCode})
            </h3>
            <p className="text-xs text-slate-400">
              {timeResolution === 'hourly' && 'Cycle diurne sur 24 heures (accumulation nocturne dans la couche limite)'}
              {timeResolution === 'daily' && 'Moyennes journalières sur les 90 derniers jours avec bruit synoptique'}
              {timeResolution === 'monthly' && 'Relevés mensuels officiels avec oscillation saisonnière chlorophyllienne'}
            </p>
          </div>

          {currentStation && (
            <ProvenanceBadge
              category="MEASURED"
              provenance={currentStation.provenance}
              onClick={() => {
                setSelectedProvenance(currentStation.provenance);
                setSelectedCategory('MEASURED');
              }}
            />
          )}
        </div>

        {/* SVG Time-series graph */}
        <div className="h-72 w-full pt-2">
          {observations.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="surfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="30" x2="780" y2="30" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
              <text x="10" y="34" fill="#94A3B8" fontSize="10" fontFamily="monospace">430</text>

              <line x1="50" y1="80" x2="780" y2="80" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
              <text x="10" y="84" fill="#94A3B8" fontSize="10" fontFamily="monospace">400</text>

              <line x1="50" y1="130" x2="780" y2="130" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
              <text x="10" y="134" fill="#94A3B8" fontSize="10" fontFamily="monospace">360</text>

              <line x1="50" y1="180" x2="780" y2="180" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
              <text x="10" y="184" fill="#94A3B8" fontSize="10" fontFamily="monospace">320</text>

              {/* Path Generator */}
              {(() => {
                const minVal = timeResolution === 'monthly' ? 310 : Math.min(...observations.map(o => o.value)) - 2;
                const maxVal = timeResolution === 'monthly' ? 435 : Math.max(...observations.map(o => o.value)) + 2;

                const points = observations.map((o, idx) => {
                  const x = 50 + (idx / (observations.length - 1)) * 730;
                  const y = 200 - ((o.value - minVal) / (maxVal - minVal)) * 180;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });

                const d = 'M ' + points.join(' L ');
                const fillPath = `M ${points[0]} L ${points.join(' L ')} L 780,210 L 50,210 Z`;

                return (
                  <>
                    <path d={fillPath} fill="url(#surfGrad)" />
                    <path d={d} fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
                    {/* Draw points if daily or hourly */}
                    {observations.length <= 40 &&
                      observations.map((o, idx) => {
                        const x = 50 + (idx / (observations.length - 1)) * 730;
                        const y = 200 - ((o.value - minVal) / (maxVal - minVal)) * 180;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#10B981"
                            stroke="#0F172A"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 font-mono text-xs">
              Chargement des données in situ...
            </div>
          )}
        </div>

        {/* Footnote explanation of seasonal cycle */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <SunMedium className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Compréhension du Cycle Saisonnier :</strong> Dans l'hémisphère Nord, le CO₂ culmine en mai (respiration hivernale accumulée) puis chute brutalement jusqu'en septembre par absorption chlorophyllienne estivale des forêts boréales et tempérées.
            </span>
          </div>
          <span className="font-mono text-cyan-400 text-[11px] shrink-0">Échelle WMO-CO2-X2019</span>
        </div>
      </div>

      {/* Multi-Station Comparison Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Comparaison Multi-Stations (Contrastes Hémisphériques &amp; Altitudinaux)
            </h3>
            <p className="text-xs text-slate-400">
              Observez l'atténuation du cycle saisonnier au Pôle Sud par rapport à Barrow (Arctique) et l'élévation de fond
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Comparer avec :</span>
            <select
              value={comparisonStationCode}
              onChange={e => setComparisonStationCode(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {stations.filter(s => s.code !== selectedStationCode).map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name} ({s.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-white font-mono">{currentStation?.name} ({currentStation?.code})</strong>
              <span className="text-xs text-emerald-400 font-mono font-bold">{currentStation?.currentCO2} ppm</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Altitude {currentStation?.altitude} m · Amplitude saisonnière crête-à-crête : {currentStation?.seasonalAmplitudePpm} ppm.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            {(() => {
              const comp = stations.find(s => s.code === comparisonStationCode);
              return (
                <>
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-mono">{comp?.name} ({comp?.code})</strong>
                    <span className="text-xs text-cyan-400 font-mono font-bold">{comp?.currentCO2} ppm</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Altitude {comp?.altitude} m · Amplitude saisonnière crête-à-crête : {comp?.seasonalAmplitudePpm} ppm.
                  </p>
                </>
              );
            })()}
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
