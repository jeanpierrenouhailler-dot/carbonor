import React, { useState, useEffect } from 'react';
import { Station, XCO2Observation, DataProvenance, ScientificDataCategory } from '../../types/observation';
import { NoaaErddapProvider } from '../../providers/noaaProvider';
import { IcosProvider } from '../../providers/icosProvider';
import { OcoProvider } from '../../providers/ocoProvider';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { DataProvenanceModal } from '../common/DataProvenanceModal';
import { ExportButton } from '../common/ExportButton';
import { 
  MapPin, 
  Satellite, 
  Layers, 
  Info, 
  Filter, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass,
  AlertTriangle
} from 'lucide-react';

export const InteractiveMapView: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [ocoSoundings, setOcoSoundings] = useState<XCO2Observation[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedSounding, setSelectedSounding] = useState<XCO2Observation | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<DataProvenance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScientificDataCategory>('MEASURED');

  // Layer toggles
  const [showStations, setShowStations] = useState(true);
  const [showOco, setShowOco] = useState(true);
  const [showCamsGrid, setShowCamsGrid] = useState(false);
  const [filterQualityOnly, setFilterQualityOnly] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<'ALL' | 'NOAA' | 'ICOS'>('ALL');

  useEffect(() => {
    async function load() {
      const noaa = await NoaaErddapProvider.getStations();
      const icos = await IcosProvider.getStations();
      setStations([...noaa, ...icos]);

      const oco = await OcoProvider.getXCO2();
      setOcoSoundings(oco);
      if (icos.length > 0) setSelectedStation(icos[0]); // Par défaut PUY
    }
    load();
  }, []);

  const filteredStations = stations.filter(s => {
    if (networkFilter === 'NOAA') return s.network === 'NOAA';
    if (networkFilter === 'ICOS') return s.network === 'ICOS';
    return true;
  });

  const filteredSoundings = ocoSoundings.filter(s => {
    if (filterQualityOnly) return s.qualityFlag === '0';
    return true;
  });

  // Conversion coordonnées sphériques (lat, lon) -> coordonnées canvas SVG équirectangulaire
  // Focus centré sur l'Europe / Atlantique pour haute lisibilité
  const mapWidth = 900;
  const mapHeight = 500;

  // Projection Equirectangulaire centrée (-25°W à +45°E, +25°N à +75°N)
  const minLon = -25;
  const maxLon = 45;
  const minLat = 25;
  const maxLat = 75;

  const projectLon = (lon: number) => {
    const clamped = Math.max(minLon, Math.min(maxLon, lon));
    return ((clamped - minLon) / (maxLon - minLon)) * mapWidth;
  };

  const projectLat = (lat: number) => {
    const clamped = Math.max(minLat, Math.min(maxLat, lat));
    return mapHeight - ((clamped - minLat) / (maxLat - minLat)) * mapHeight;
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Control Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Carte Interactive Multi-Réseaux
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="OBSERVED" />
          </div>
          <p className="text-xs text-slate-400">
            Stations de surface NOAA / ICOS et traces orbitales de sondages XCO₂ NASA OCO-2 / OCO-3
          </p>
        </div>

        {/* Export button */}
        <div className="flex items-center gap-3">
          <ExportButton
            data={[...filteredStations, ...filteredSoundings]}
            datasetName="co2_geospatial_observations"
          />
        </div>
      </div>

      {/* Layer Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Couches :
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={showStations}
              onChange={e => setShowStations(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Stations au sol ({filteredStations.length})
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={showOco}
              onChange={e => setShowOco(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Trace Satellitaire OCO-2 ({filteredSoundings.length})
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={showCamsGrid}
              onChange={e => setShowCamsGrid(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              Grille CAMS Modèle
            </span>
          </label>
        </div>

        {/* Sub-filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-500">Réseau :</span>
            {(['ALL', 'NOAA', 'ICOS'] as const).map(n => (
              <button
                key={n}
                onClick={() => setNetworkFilter(n)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  networkFilter === n
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-mono text-[11px] border-l border-slate-800 pl-3">
            <input
              type="checkbox"
              checked={filterQualityOnly}
              onChange={e => setFilterQualityOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span>Seulement flag '0' (Bon)</span>
          </label>
        </div>
      </div>

      {/* Main Map View & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geospatial Canvas (2 cols) */}
        <div className="lg:col-span-2 relative rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl overflow-hidden min-h-[460px] flex flex-col justify-between">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-900">
            <span>Projection Équirectangulaire Europe / Atlantique Nord</span>
            <span>25°N–75°N | 25°W–45°E</span>
          </div>

          {/* Interactive SVG Geographic Visualization */}
          <div className="relative w-full h-[400px] flex items-center justify-center">
            <svg
              className="w-full h-full rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 select-none"
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            >
              <defs>
                {/* Grille gradient */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                </pattern>
                {/* CAMS assimilation heat blob */}
                <radialGradient id="camsHeat" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Background grid */}
              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

              {/* Stylized European coastline & borders */}
              {/* Atlantic ocean area */}
              <path
                d="M 50 100 Q 150 150 200 250 T 260 400 L 50 450 Z"
                fill="#0F172A"
                opacity="0.5"
              />
              {/* Stylized continent outline (Europe) */}
              <path
                d="M 280 430 
                   Q 330 380, 360 320 
                   T 420 280 
                   T 470 230 
                   T 580 180 
                   T 720 150 
                   L 850 160 
                   L 850 480 
                   L 300 480 Z"
                fill="#1E293B"
                opacity="0.3"
              />

              {/* CAMS Model assimilation field simulation if toggled */}
              {showCamsGrid && (
                <circle cx={projectLon(2.35)} cy={projectLat(48.85)} r="140" fill="url(#camsHeat)" />
              )}

              {/* OCO-2 Orbit track line */}
              {showOco && ocoSoundings.length > 1 && (
                <path
                  d={ocoSoundings
                    .filter(s => s.latitude >= minLat && s.latitude <= maxLat && s.longitude >= minLon && s.longitude <= maxLon)
                    .map((s, idx) => `${idx === 0 ? 'M' : 'L'} ${projectLon(s.longitude)} ${projectLat(s.latitude)}`)
                    .join(' ')}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
              )}

              {/* OCO-2 Sounding points */}
              {showOco &&
                filteredSoundings
                  .filter(s => s.latitude >= minLat && s.latitude <= maxLat && s.longitude >= minLon && s.longitude <= maxLon)
                  .map(s => {
                    const cx = projectLon(s.longitude);
                    const cy = projectLat(s.latitude);
                    const isWarn = s.qualityFlag === '1';
                    const isSelected = selectedSounding?.observationId === s.observationId;

                    return (
                      <g
                        key={s.observationId}
                        className="cursor-pointer transition-transform hover:scale-125"
                        onClick={() => {
                          setSelectedSounding(s);
                          setSelectedStation(null);
                        }}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 7 : 4}
                          fill={isWarn ? '#F59E0B' : '#38BDF8'}
                          stroke="#0F172A"
                          strokeWidth="1.5"
                        />
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="11"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  })}

              {/* Ground Stations (NOAA / ICOS) */}
              {showStations &&
                filteredStations
                  .filter(s => s.latitude >= minLat && s.latitude <= maxLat && s.longitude >= minLon && s.longitude <= maxLon)
                  .map(s => {
                    const cx = projectLon(s.longitude);
                    const cy = projectLat(s.latitude);
                    const isSelected = selectedStation?.id === s.id;

                    return (
                      <g
                        key={s.id}
                        className="cursor-pointer transition-transform hover:scale-125"
                        onClick={() => {
                          setSelectedStation(s);
                          setSelectedSounding(null);
                        }}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 9 : 6}
                          fill="#10B981"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {/* Pulse animation for selected station */}
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="14"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="2"
                            className="animate-ping"
                          />
                        )}
                        {/* Station Code label */}
                        <text
                          x={cx + 8}
                          y={cy - 8}
                          fill="#F8FAFC"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                          className="drop-shadow"
                        >
                          {s.code}
                        </text>
                      </g>
                    );
                  })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-900">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
                <span>Station au sol (CRDS/NDIR)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Sondage OCO-2 (Flag 0 - Valide)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Sondage OCO-2 (Flag 1 - Alerte)</span>
              </span>
            </div>
            <span className="text-slate-500">Cliquez sur un point pour inspecter les métadonnées</span>
          </div>
        </div>

        {/* Details Inspector Panel (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          {selectedStation && (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {selectedStation.network}
                    </span>
                    <ProvenanceBadge
                      category="MEASURED"
                      onClick={() => {
                        setSelectedProvenance(selectedStation.provenance);
                        setSelectedCategory('MEASURED');
                      }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedStation.name}</h3>
                  <p className="text-xs text-slate-400">Code : {selectedStation.code} · {selectedStation.country}</p>
                </div>
              </div>

              {/* Primary Value */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Dernière mesure de surface</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{selectedStation.currentCO2}</span>
                  <span className="text-sm font-semibold text-emerald-400 font-mono">ppm</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Horodatage : {new Date(selectedStation.currentCO2Date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Geographic and Metrologic specs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Altitude</span>
                  <strong className="text-slate-200">{selectedStation.altitude} m</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Tendance annuelle</span>
                  <strong className="text-emerald-400">+{selectedStation.trendYearlyPpm} ppm/an</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Cycle saisonnier</span>
                  <strong className="text-slate-200">±{selectedStation.seasonalAmplitudePpm / 2} ppm</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Coordonnées</span>
                  <strong className="text-slate-300">{selectedStation.latitude.toFixed(2)}°N, {selectedStation.longitude.toFixed(2)}°E</strong>
                </div>
              </div>

              {/* Sampling Inlet heights if Tall Tower */}
              {selectedStation.samplingInletHeights && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Niveaux de prélèvement mât :</span>
                  <div className="flex gap-2">
                    {selectedStation.samplingInletHeights.map(h => (
                      <span key={h} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
                        {h} m
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instrument */}
              <div className="text-xs text-slate-300 space-y-1">
                <span className="text-slate-500 font-semibold block">Instrument métrologique :</span>
                <p className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                  {selectedStation.instrument}
                </p>
              </div>

              {/* Provenance and full card */}
              <button
                onClick={() => {
                  setSelectedProvenance(selectedStation.provenance);
                  setSelectedCategory('MEASURED');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Consulter la traçabilité &amp; DOI</span>
              </button>
            </div>
          )}

          {selectedSounding && (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {selectedSounding.satellite}
                    </span>
                    <ProvenanceBadge
                      category="OBSERVED"
                      onClick={() => {
                        setSelectedProvenance(selectedSounding.provenance);
                        setSelectedCategory('OBSERVED');
                      }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white">Sondage Satellitaire XCO₂</h3>
                  <p className="text-xs text-slate-400">ID : {selectedSounding.observationId}</p>
                </div>
              </div>

              {/* Value and Quality Flag */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Fraction molaire moyenne de colonne</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{selectedSounding.xco2}</span>
                  <span className="text-sm font-semibold text-cyan-400 font-mono">ppm</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-xs font-mono">
                  <span className="text-slate-400">Incertitude : ±{selectedSounding.xco2Uncertainty} ppm</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedSounding.qualityFlag === '0'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}>
                    Flag {selectedSounding.qualityFlag === '0' ? '0 (Good)' : '1 (Warn)'}
                  </span>
                </div>
              </div>

              {/* Footprint & Satellite specs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Footprint (Empreinte)</span>
                  <strong className="text-slate-200">#{selectedSounding.footprint} (sur 8)</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Type de surface</span>
                  <strong className="text-cyan-400">{selectedSounding.surfaceType}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Angle zénithal solaire</span>
                  <strong className="text-slate-200">{selectedSounding.solarZenithAngle}°</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Pression surface</span>
                  <strong className="text-slate-200">{selectedSounding.surfacePressureHpa} hPa</strong>
                </div>
              </div>

              {/* Scientific Caveat */}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Rappel Scientifique XCO₂
                </span>
                <p className="text-[11px] leading-relaxed">
                  XCO₂ mesure l'intégrale verticale moyenne d'air sec pondérée par la masse d'air depuis le sol jusqu'au sommet de l'atmosphère. Elle diffère naturellement de la concentration de surface.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProvenance(selectedSounding.provenance);
                  setSelectedCategory('OBSERVED');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Voir métadonnées granule NASA</span>
              </button>
            </div>
          )}

          {!selectedStation && !selectedSounding && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-slate-600 animate-spin" style={{ animationDuration: '10s' }} />
              <p className="text-xs">Cliquez sur un marqueur pour inspecter les observations.</p>
            </div>
          )}
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
