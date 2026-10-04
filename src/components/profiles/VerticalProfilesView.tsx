import React, { useState, useEffect } from 'react';
import { VerticalProfile, DataProvenance, ScientificDataCategory } from '../../types/observation';
import { NoaaErddapProvider } from '../../providers/noaaProvider';
import { CamsProvider } from '../../providers/camsProvider';
import { IcosProvider } from '../../providers/icosProvider';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { DataProvenanceModal } from '../common/DataProvenanceModal';
import { ExportButton } from '../common/ExportButton';
import { 
  Layers, 
  ArrowDownUp, 
  Wind, 
  Info, 
  ShieldCheck, 
  Plane, 
  Compass, 
  Activity 
} from 'lucide-react';

export const VerticalProfilesView: React.FC = () => {
  const [profiles, setProfiles] = useState<VerticalProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [activeProfile, setActiveProfile] = useState<VerticalProfile | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<DataProvenance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScientificDataCategory>('MEASURED');
  const [yAxisMode, setYAxisMode] = useState<'altitude' | 'pressure'>('altitude');

  useEffect(() => {
    async function load() {
      const aircore = await NoaaErddapProvider.getAirCoreProfiles();
      const aircraft = await NoaaErddapProvider.getAircraftProfiles();
      const cams = await CamsProvider.getVerticalConcentration(48.85, 2.35);
      const icosTower = await IcosProvider.getVerticalProfiles('TRN');

      const all = [...aircore, ...aircraft, cams, ...icosTower];
      setProfiles(all);
      if (all.length > 0) {
        setSelectedProfileId(all[0].id);
        setActiveProfile(all[0]);
      }
    }
    load();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedProfileId(id);
    const p = profiles.find(item => item.id === id);
    if (p) setActiveProfile(p);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Profils Verticaux de CO₂ (De la Surface à la Stratosphère)
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="MODELED" />
          </div>
          <p className="text-xs text-slate-400">
            Sondages AirCore sous ballon stratosphérique, spirales d'aéronefs NOAA et niveaux de pression CAMS
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeProfile && (
            <ExportButton
              data={activeProfile.levels}
              datasetName={`vertical_profile_${activeProfile.id}`}
            />
          )}
        </div>
      </div>

      {/* Profile Selector & Axis Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider mr-2">
            Profil :
          </span>
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedProfileId === p.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50 border border-cyan-400/40'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{p.stationOrLocation}</span>
              <span className="opacity-60 text-[10px] ml-1.5 font-normal">[{p.type}]</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 p-1">
          <span className="text-slate-500 text-[11px] px-2">Axe vertical :</span>
          <button
            onClick={() => setYAxisMode('altitude')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              yAxisMode === 'altitude' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Altitude (km)
          </button>
          <button
            onClick={() => setYAxisMode('pressure')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              yAxisMode === 'pressure' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pression (hPa)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vertical Profile Chart (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  {activeProfile.stationOrLocation}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(activeProfile.date).toLocaleDateString('fr-FR')} · Plafond : {activeProfile.maxAltitudeKm} km
                </span>
              </div>
              <ProvenanceBadge
                category={activeProfile.category}
                provenance={activeProfile.provenance}
                onClick={() => {
                  setSelectedProvenance(activeProfile.provenance);
                  setSelectedCategory(activeProfile.category);
                }}
              />
            </div>

            {/* SVG Vertical Profile Plot (y = Altitude km or Pressure hPa, x = CO2 ppm) */}
            <div className="h-80 w-full pt-2">
              <svg className="w-full h-full" viewBox="0 0 650 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="profileGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* X axis (CO2 mixing ratio) : 400 to 435 ppm */}
                <line x1="80" y1="30" x2="80" y2="260" stroke="#334155" strokeWidth="1" />
                <line x1="80" y1="260" x2="620" y2="260" stroke="#334155" strokeWidth="1" />

                {/* X Grid lines */}
                {[405, 410, 415, 420, 425, 430, 435, 440].map(val => {
                  const x = 80 + ((val - 400) / 45) * 540;
                  return (
                    <g key={val}>
                      <line x1={x} y1="30" x2={x} y2="260" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.6" />
                      <text x={x} y="278" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Y Axis Grid lines */}
                {yAxisMode === 'altitude' ? (
                  // Altitude in km (0 to 30 km)
                  [0, 5, 10, 15, 20, 25, 30].map(alt => {
                    const y = 260 - (alt / 30) * 230;
                    return (
                      <g key={alt}>
                        <line x1="80" y1={y} x2="620" y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.6" />
                        <text x="70" y={y + 3} fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="end">
                          {alt} km
                        </text>
                      </g>
                    );
                  })
                ) : (
                  // Pressure in hPa (1000 hPa surface at bottom, 10 hPa at top)
                  [1000, 850, 700, 500, 300, 100, 10].map(p => {
                    // Log-p scale for atmosphere
                    const logP = Math.log10(p);
                    const logPMax = Math.log10(1000);
                    const logPMin = Math.log10(10);
                    const y = 260 - ((logPMax - logP) / (logPMax - logPMin)) * 230;
                    return (
                      <g key={p}>
                        <line x1="80" y1={y} x2="620" y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.6" />
                        <text x="70" y={y + 3} fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="end">
                          {p} hPa
                        </text>
                      </g>
                    );
                  })
                )}

                {/* Plot Profile Line */}
                {(() => {
                  const points = activeProfile.levels.map(lvl => {
                    const x = 80 + ((lvl.co2Ppm - 400) / 45) * 540;
                    let y = 260;
                    if (yAxisMode === 'altitude') {
                      y = 260 - (lvl.altitudeKm / 30) * 230;
                    } else {
                      const logP = Math.log10(Math.max(10, lvl.pressureHpa));
                      y = 260 - ((Math.log10(1000) - logP) / (Math.log10(1000) - Math.log10(10))) * 230;
                    }
                    return { x, y, lvl };
                  });

                  const d = 'M ' + points.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ');

                  return (
                    <>
                      <path d={d} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
                          {/* Uncertainty error bar */}
                          {pt.lvl.uncertaintyPpm && (
                            <line
                              x1={pt.x - (pt.lvl.uncertaintyPpm / 45) * 540}
                              y1={pt.y}
                              x2={pt.x + (pt.lvl.uncertaintyPpm / 45) * 540}
                              y2={pt.y}
                              stroke="#38BDF8"
                              strokeWidth="1.2"
                              opacity="0.7"
                            />
                          )}
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Interprétation Physique du Profil :
              </span>
              <p className="text-[11px] text-slate-400">
                Dans la troposphère libre (2 à 10 km), le CO₂ est bien mélangé par convection et advection zonale. Au passage de la tropopause (~11 km aux moyennes latitudes), la pénétration dans la basse stratosphère s'accompagne d'une décroissance du CO₂ liée à l'âge moyen de l'air stratosphérique (l'air y a séjourné plusieurs années sans injection directe d'émissions récentes).
              </p>
            </div>
          </div>

          {/* Level by Level Table Inspector (1 col) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <h3 className="font-bold text-white font-mono uppercase tracking-wider">
                Niveaux du Profil ({activeProfile.levels.length})
              </h3>
              <span className="text-slate-400 font-mono text-[11px]">CO₂ (ppm)</span>
            </div>

            <div className="overflow-y-auto max-h-[360px] space-y-2 pr-1">
              {activeProfile.levels.map((lvl, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-white font-bold">{lvl.altitudeKm} km · {lvl.pressureHpa} hPa</div>
                    {lvl.temperatureK && (
                      <div className="text-[10px] text-slate-500">T : {lvl.temperatureK} K ({(lvl.temperatureK - 273.15).toFixed(1)} °C)</div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-cyan-400">{lvl.co2Ppm}</span>
                    <span className="text-[10px] text-slate-500 block">±{lvl.uncertaintyPpm || 0.2} ppm</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedProvenance(activeProfile.provenance);
                setSelectedCategory(activeProfile.category);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Consulter la traçabilité métrologique</span>
            </button>
          </div>
        </div>
      )}

      {/* Provenance Modal */}
      <DataProvenanceModal
        provenance={selectedProvenance}
        category={selectedCategory}
        onClose={() => setSelectedProvenance(null)}
      />
    </div>
  );
};
