import React, { useState, useEffect } from 'react';
import { FluxRecord, EmissionInventoryItem } from '../../types/flux';
import { CamsProvider } from '../../providers/camsProvider';
import { EmissionsProvider } from '../../providers/emissionsProvider';
import { 
  fluxUmolPerM2sToGCPerM2day, 
  fluxGCPerM2dayToUmolPerM2s, 
  mtCO2PerYearToGtCPerYear, 
  CO2_TO_C_RATIO 
} from '../../scientific/unitConversions';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { 
  Wind, 
  Flame, 
  ArrowRightLeft, 
  ShieldAlert, 
  Globe2, 
  Trees, 
  Building2, 
  Car, 
  Factory, 
  Wheat, 
  Trash2 
} from 'lucide-react';

export const FluxEmissionsView: React.FC = () => {
  const [fluxes, setFluxes] = useState<FluxRecord[]>([]);
  const [emissions, setEmissions] = useState<EmissionInventoryItem[]>([]);
  const [globalBudget, setGlobalBudget] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fluxes' | 'emissions' | 'converter'>('fluxes');

  // Interactive unit converter
  const [fluxInputVal, setFluxInputVal] = useState<number>(1.0);

  useEffect(() => {
    async function load() {
      const f = await CamsProvider.getSurfaceFlux();
      setFluxes(f);
      const em = await EmissionsProvider.getFranceEmissions();
      setEmissions(em);
      const gb = await EmissionsProvider.getGlobalEmissionsSummary();
      setGlobalBudget(gb);
    }
    load();
  }, []);

  const getSectorIcon = (sector: string) => {
    if (sector.includes('Transport')) return Car;
    if (sector.includes('Industrie')) return Factory;
    if (sector.includes('Bâtiments')) return Building2;
    if (sector.includes('Agriculture')) return Wheat;
    if (sector.includes('Déchets')) return Trash2;
    return Flame;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wind className="w-5 h-5 text-amber-400" />
              Flux de Surface, Inversions CAMS &amp; Inventaires d'Émissions
            </h2>
            <ProvenanceBadge category="ESTIMATED" />
          </div>
          <p className="text-xs text-slate-400">
            Distinguer rigoureusement les émissions anthropiques déclarées, les puits naturels et les flux déduits par inversion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            data={activeTab === 'fluxes' ? fluxes : emissions}
            datasetName={activeTab === 'fluxes' ? 'cams_surface_fluxes' : 'citepa_emissions_inventory'}
          />
        </div>
      </div>

      {/* Distinction Principle Box (Prompt Section 16 & 17) */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 leading-relaxed space-y-1.5">
        <div className="flex items-center gap-2 font-bold font-mono text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Principe Métrologique Fondamental sur les Flux &amp; Émissions</span>
        </div>
        <p>
          <strong>Une émission n'est JAMAIS mesurée directement à l'échelle d'un territoire.</strong> Les inventaires sectoriels (CITEPA, GIEC) sont des <em>estimations comptables bottom-up</em> basées sur des statistiques de consommation d'énergie et des facteurs d'émission. À l'inverse, l'<em>inversion atmosphérique top-down</em> (Copernicus CAMS) calcule les flux de surface optimisés en injectant les gradients observés de CO₂ dans un modèle météorologique inverse.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-mono w-fit">
        <button
          onClick={() => setActiveTab('fluxes')}
          className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'fluxes' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Flux de Surface &amp; Inversion CAMS
        </button>
        <button
          onClick={() => setActiveTab('emissions')}
          className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'emissions' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Inventaires Sectoriels (CITEPA France)
        </button>
        <button
          onClick={() => setActiveTab('converter')}
          className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'converter' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Convertisseur d'Unités de Flux
        </button>
      </div>

      {/* Tab 1: Fluxes and Inversions */}
      {activeTab === 'fluxes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fluxes.map(f => (
              <div
                key={f.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 block">{f.region}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Inversion atmosphérique CAMS</span>
                  </div>
                  <ProvenanceBadge category="ESTIMATED" provenance={f.provenance} />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-mono block">Flux Net de Surface</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">{f.netFlux}</span>
                    <span className="text-xs text-amber-400 font-mono">{f.unit}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {f.netFlux < 0 ? 'Puits net (absorption de carbone dominante)' : 'Source nette vers l\'atmosphère'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-400">Puits Naturel (NEE) :</span>
                    <strong className="text-emerald-400">{f.naturalFluxNEE} {f.unit}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-400">Fossiles &amp; Industrie :</span>
                    <strong className="text-rose-400">+{f.anthropogenicFossil} {f.unit}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-400">Incertitude résiduelle :</span>
                    <span className="text-slate-400">±{f.uncertaintyPercentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Global Carbon Budget Box */}
          {globalBudget && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  Bilan Planétaire Annuel du Carbone (Global Carbon Project 2025)
                </h3>
                <span className="text-slate-400 font-mono text-[11px]">Unité : Gt CO₂ / an</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Émissions Totales</span>
                  <span className="text-xl font-black text-rose-400">{globalBudget.totalEmissionsGtCO2}</span>
                  <span className="text-[10px] text-slate-500 block">Gt CO₂/an (37.4 fossiles + 3.9 terres)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Puits Terrestre (Forêts/Sols)</span>
                  <span className="text-xl font-black text-emerald-400">-{globalBudget.landSinkGtCO2}</span>
                  <span className="text-[10px] text-slate-500 block">Gt CO₂/an (~29% absorbé)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Puits Océanique</span>
                  <span className="text-xl font-black text-cyan-400">-{globalBudget.oceanSinkGtCO2}</span>
                  <span className="text-[10px] text-slate-500 block">Gt CO₂/an (~25% absorbé)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Accroissement Atmosphérique</span>
                  <span className="text-xl font-black text-amber-400">+{globalBudget.atmosphericGrowthGtCO2}</span>
                  <span className="text-[10px] text-slate-500 block">Gt CO₂/an (~47% s'accumule)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sectoral Emissions (CITEPA France) */}
      {activeTab === 'emissions' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Inventaire National des Émissions de CO₂ par Secteur (France 2024 - CITEPA)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Total national estimé : ~385 Mt CO₂e (Rapport SECTEN officiel consolidé)
              </p>
            </div>
            <ProvenanceBadge category="ESTIMATED" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emissions.map(item => {
              const Icon = getSectorIcon(item.sector);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      {item.sector}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{item.sharePercent}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${item.sharePercent * 2.5}%` }}
                    />
                  </div>

                  <div className="flex items-baseline justify-between text-xs font-mono text-slate-400 pt-1">
                    <span>Volume annuel :</span>
                    <strong className="text-white text-sm">{item.valueMtCO2} Mt CO₂/an</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Rigorous Flux Unit Converter */}
      {activeTab === 'converter' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              Convertisseur Rigoureux d'Unités de Flux de Carbone
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Basé sur la constante molaire du CO₂ (44.0095 g/mol) et du Carbone pur (12.011 g/mol)
            </p>
          </div>

          <div className="max-w-md space-y-2">
            <label className="text-xs font-mono text-slate-400 block">
              Valeur de flux en µmol CO₂ / (m² · s) :
            </label>
            <input
              type="number"
              step="0.1"
              value={fluxInputVal}
              onChange={e => setFluxInputVal(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">gC / (m² · jour)</span>
              <strong className="text-xl font-bold text-emerald-400 block">
                {fluxUmolPerM2sToGCPerM2day(fluxInputVal).toFixed(3)}
              </strong>
              <span className="text-[10px] text-slate-500 block">Facteur 1.03775</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">kg CO₂ / (m² · an)</span>
              <strong className="text-xl font-bold text-cyan-400 block">
                {(fluxInputVal * 1e-6 * 44.0095 * 86400 * 365.25 / 1000).toFixed(3)}
              </strong>
              <span className="text-[10px] text-slate-500 block">Intégration annuelle</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Rapport CO₂ / C pur</span>
              <strong className="text-xl font-bold text-slate-200 block">
                {CO2_TO_C_RATIO.toFixed(4)}
              </strong>
              <span className="text-[10px] text-slate-500 block">44.0095 / 12.011</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
