import React, { useState, useEffect } from 'react';
import { XCO2Observation, DataProvenance, ScientificDataCategory } from '../../types/observation';
import { OcoProvider } from '../../providers/ocoProvider';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { DataProvenanceModal } from '../common/DataProvenanceModal';
import { ExportButton } from '../common/ExportButton';
import { 
  Satellite, 
  ShieldAlert, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Orbit, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';

export const XCO2View: React.FC = () => {
  const [observations, setObservations] = useState<XCO2Observation[]>([]);
  const [selectedObs, setSelectedObs] = useState<XCO2Observation | null>(null);
  const [qualityFilter, setQualityFilter] = useState<'ALL' | '0' | '1'>('ALL');
  const [satelliteFilter, setSatelliteFilter] = useState<'ALL' | 'OCO-2' | 'OCO-3'>('ALL');
  const [selectedProvenance, setSelectedProvenance] = useState<DataProvenance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScientificDataCategory>('OBSERVED');

  useEffect(() => {
    async function load() {
      const data = await OcoProvider.getXCO2();
      setObservations(data);
      if (data.length > 0) setSelectedObs(data[0]);
    }
    load();
  }, []);

  const filtered = observations.filter(o => {
    if (qualityFilter !== 'ALL' && o.qualityFlag !== qualityFilter) return false;
    if (satelliteFilter !== 'ALL' && o.satellite !== satelliteFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Satellite className="w-5 h-5 text-cyan-400" />
              Observations Satellitaires XCO₂ (NASA OCO-2 &amp; OCO-3)
            </h2>
            <ProvenanceBadge category="OBSERVED" />
          </div>
          <p className="text-xs text-slate-400">
            Fraction molaire moyenne de colonne d'air sec par spectrométrie à réseau de diffraction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton data={filtered} datasetName="nasa_oco_xco2_observations" />
        </div>
      </div>

      {/* Critical Scientific Definition Card (Prompt Requirement #5 & #13) */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950 p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Distinction Fondamentale : XCO₂ vs Concentration de Surface
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Le satellite ne mesure pas le CO₂ au niveau du sol. Il observe le rayonnement solaire réfléchi par l'atmosphère et la surface terrestre dans trois bandes spectrales : le doublet de l'Oxygène moléculaire <strong className="text-cyan-400">O₂-A (0.76 µm)</strong> pour mesurer la colonne d'air sec et la pression de surface, la bande <strong className="text-cyan-400">faible WCO₂ (1.61 µm)</strong> et la bande <strong className="text-cyan-400">forte SCO₂ (2.06 µm)</strong>.
        </p>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <span>Formule : X_CO2 = ( ∫_0^Ps q_CO2(p) dp ) / ( ∫_0^Ps (1 - q_H2O) dp )</span>
          <span className="text-[11px] text-slate-400">Unité : ppm (molécules de CO₂ par million de molécules d'air sec)</span>
        </div>
      </div>

      {/* Filter and Quality Flag Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Quality Flag :
          </span>
          <button
            onClick={() => setQualityFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              qualityFilter === 'ALL' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Tous ({observations.length})
          </button>
          <button
            onClick={() => setQualityFilter('0')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              qualityFilter === '0'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Flag '0' : Assimilation Grade ({observations.filter(o => o.qualityFlag === '0').length})</span>
          </button>
          <button
            onClick={() => setQualityFilter('1')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              qualityFilter === '1'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'bg-slate-950 text-amber-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flag '1' : Avertissement / Filtré ({observations.filter(o => o.qualityFlag === '1').length})</span>
          </button>
        </div>

        {/* Satellite Platform Switch */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Plateforme :</span>
          {(['ALL', 'OCO-2', 'OCO-3'] as const).map(p => (
            <button
              key={p}
              onClick={() => setSatelliteFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                satelliteFilter === p ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Soundings Table (Left) + Detailed Sounding Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Soundings Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Orbit className="w-4 h-4 text-cyan-400" />
              Sondages Satellitaires (Trace OCO-2 Orbite 57821 &amp; OCO-3 SAM)
            </h3>
            <span className="text-slate-400 font-mono text-[11px]">{filtered.length} points affichés</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="pb-2 pl-2">Horodatage</th>
                  <th className="pb-2">Position (Lat, Lon)</th>
                  <th className="pb-2">Satellite</th>
                  <th className="pb-2">XCO₂ (ppm)</th>
                  <th className="pb-2">Incertitude</th>
                  <th className="pb-2">Mode / Type</th>
                  <th className="pb-2 pr-2">Qualité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(obs => {
                  const isSelected = selectedObs?.observationId === obs.observationId;
                  const isWarn = obs.qualityFlag === '1';

                  return (
                    <tr
                      key={obs.observationId}
                      onClick={() => setSelectedObs(obs)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/15 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-2.5 pl-2 text-slate-400 text-[11px]">
                        {new Date(obs.timestamp).toLocaleTimeString('fr-FR')}
                      </td>
                      <td className="py-2.5">
                        {obs.latitude.toFixed(2)}°N, {obs.longitude.toFixed(2)}°E
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300">
                          {obs.satellite}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="font-bold text-white text-sm">{obs.xco2}</span>
                      </td>
                      <td className="py-2.5 text-slate-400">±{obs.xco2Uncertainty} ppm</td>
                      <td className="py-2.5 text-slate-300 text-[11px]">
                        {obs.surfaceType} <span className="opacity-50">#{obs.footprint}</span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isWarn
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          Flag {obs.qualityFlag}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sounding Detail Card (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
          {selectedObs ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {selectedObs.satellite} {selectedObs.productVersion}
                    </span>
                    <ProvenanceBadge
                      category="OBSERVED"
                      onClick={() => {
                        setSelectedProvenance(selectedObs.provenance);
                        setSelectedCategory('OBSERVED');
                      }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white">Sondage #{selectedObs.observationId}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(selectedObs.timestamp).toISOString()}
                  </span>
                </div>
              </div>

              {/* Big XCO2 Reading */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-mono block">Concentration de Colonne Sèche (XCO₂)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white font-mono">{selectedObs.xco2}</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">ppm</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-900">
                  <span className="text-slate-400">Incertitude estimée :</span>
                  <strong className="text-slate-200">±{selectedObs.xco2Uncertainty} ppm</strong>
                </div>
              </div>

              {/* Physical Sounding Properties */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block">Footprint (Empreinte)</span>
                  <strong className="text-slate-200">#{selectedObs.footprint} / 8</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block">Mode de visée</span>
                  <strong className="text-cyan-400">{selectedObs.surfaceType}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block">Angle zénithal (SZA)</span>
                  <strong className="text-slate-200">{selectedObs.solarZenithAngle}°</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block">Pression de surface</span>
                  <strong className="text-slate-200">{selectedObs.surfacePressureHpa} hPa</strong>
                </div>
              </div>

              {/* Quality Flag Explanation */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                  selectedObs.qualityFlag === '0'
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  {selectedObs.qualityFlag === '0' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Quality Flag 0 : Donnée Validée pour Assimilation</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Quality Flag 1 : Donnée Problématique / Filtrée</span>
                    </>
                  )}
                </div>
                <p className="text-[11px]">
                  {selectedObs.qualityFlag === '0'
                    ? "Le sondage satisfait tous les critères de convergence de l'algorithme ACOS : épaisseur optique d'aérosols faible, pas de couverture nuageuse, réflectance cohérente."
                    : "Observation écartée des modèles d'assimilation en raison d'une incertitude accrue (aérosols résiduels ou gradient topographique fort). Préservée pour traçabilité scientifique."}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProvenance(selectedObs.provenance);
                  setSelectedCategory('OBSERVED');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Voir métadonnées NASA OCO-2 &amp; DOI</span>
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Sélectionnez un sondage dans la liste pour inspecter ses caractéristiques radiatives.
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
