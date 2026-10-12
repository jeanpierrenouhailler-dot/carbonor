import React, { useState, useEffect } from 'react';
import { FluxRecord, EmissionInventoryItem, CitepaVersionSummary, CitepaInventoryResponse, CitepaHistoryPoint } from '../../types/flux';
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
import { ScienceTooltip } from '../common/ScienceTooltip';
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
  Trash2,
  RefreshCw,
  Upload,
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Layers
} from 'lucide-react';

export const FluxEmissionsView: React.FC = () => {
  const [fluxes, setFluxes] = useState<FluxRecord[]>([]);
  const [emissions, setEmissions] = useState<EmissionInventoryItem[]>([]);
  const [globalBudget, setGlobalBudget] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fluxes' | 'emissions' | 'converter'>('fluxes');

  // CITEPA Versioning & Management state
  const [versions, setVersions] = useState<CitepaVersionSummary[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('secten_2026');
  const [fullInventory, setFullInventory] = useState<CitepaInventoryResponse | null>(null);
  const [historyData, setHistoryData] = useState<CitepaHistoryPoint[]>([]);
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);
  const [showHistoryTable, setShowHistoryTable] = useState<boolean>(false);
  const [syncingCitepa, setSyncingCitepa] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Interactive unit converter
  const [fluxInputVal, setFluxInputVal] = useState<number>(1.0);

  const loadData = async (versionId?: string) => {
    try {
      const [f, vers, inv, hist, gb] = await Promise.all([
        CamsProvider.getSurfaceFlux(),
        EmissionsProvider.getAvailableVersions(),
        EmissionsProvider.getFullInventory(versionId),
        EmissionsProvider.getHistoricalEmissions(),
        EmissionsProvider.getGlobalEmissionsSummary()
      ]);

      setFluxes(f);
      setVersions(vers);
      if (inv) {
        setFullInventory(inv);
        setEmissions(inv.sectors);
      }
      setHistoryData(hist);
      setGlobalBudget(gb);
    } catch (err) {
      console.warn('Erreur chargement flux / émissions:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVersionChange = async (newVersionId: string) => {
    setSelectedVersionId(newVersionId);
    await EmissionsProvider.setActiveVersion(newVersionId);
    await loadData(newVersionId);
  };

  const handleSyncCitepa = async () => {
    setSyncingCitepa(true);
    setSyncStatusMsg(null);
    try {
      const res = await EmissionsProvider.syncFromCitepa();
      if (res && res.success) {
        setSyncStatusMsg(`Actualisation CITEPA réussie (${res.edition}) : ${res.sectorsCount} secteurs synchronisés.`);
        await loadData(selectedVersionId);
      } else {
        setSyncStatusMsg(res.message || 'Échec de la synchronisation CITEPA.');
      }
    } catch {
      setSyncStatusMsg('Erreur de connexion avec le serveur CITEPA.');
    } finally {
      setSyncingCitepa(false);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
  };

  const handleImportSubmit = async () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await EmissionsProvider.importInventory(parsed);
      if (res.success) {
        setIsImportModalOpen(false);
        setImportJsonText('');
        setSelectedVersionId(res.versionId);
        setSyncStatusMsg(`Inventaire importé avec succès : ${res.message}`);
        await loadData(res.versionId);
      } else {
        setImportError(res.message);
      }
    } catch (e: any) {
      setImportError('JSON invalide : ' + e.message);
    }
  };

  const getSectorIcon = (sector: string) => {
    if (sector.includes('Transport')) return Car;
    if (sector.includes('Industrie')) return Factory;
    if (sector.includes('Bâtiment')) return Building2;
    if (sector.includes('Agriculture')) return Wheat;
    if (sector.includes('Déchet')) return Trash2;
    if (sector.includes('Puits') || sector.includes('UTCATF') || sector.includes('LULUCF')) return Trees;
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
              <span>Flux de Surface, Inversions CAMS &amp; Inventaires d'Émissions CITEPA</span>
              <ScienceTooltip
                title="Bilan Carbone Global &amp; Échange Terre-Océan-Atmosphère"
                summary="Distingue les flux biogéochimiques naturels nets (puits et sources) des émissions anthropiques fossiles."
                details={[
                  "Émissions anthropiques mondiales : ~37 GtCO₂/an (combustibles fossiles et ciment) + ~4 GtCO₂/an (changement d'usage des sols).",
                  "Puits océanique : ~10.5 GtCO₂/an dissous dans l'océan (entraînant son acidification par baisse du pH).",
                  "Puits terrestre biosphérique : ~11.5 GtCO₂/an absorbé par la photosynthèse et la croissance forestière.",
                  "Fraction atmosphérique résiduelle : ~19 GtCO₂/an (~2.5 ppm/an d'accumulation permanente dans l'air)."
                ]}
                badge="BILAN DE FLUX"
                variant="amber"
              />
            </h2>
            <ProvenanceBadge category="ESTIMATED" />
          </div>
          <p className="text-xs text-slate-400">
            Distinguer rigoureusement les émissions anthropiques déclarées (inventaires versionnés CITEPA) et les flux optimisés (inversion CAMS)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            data={activeTab === 'fluxes' ? fluxes : emissions}
            datasetName={activeTab === 'fluxes' ? 'cams_surface_fluxes' : `citepa_inventory_${selectedVersionId}`}
          />
        </div>
      </div>

      {/* Distinction Principle Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 leading-relaxed space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold font-mono text-amber-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Principe Métrologique Fondamental sur les Flux &amp; Émissions</span>
          </div>
          <ScienceTooltip
            title="Approche Top-Down (Inversion) vs Bottom-Up (Inventaires)"
            summary="Deux méthodes complémentaires et indépendantes indispensables pour la validation des traités climatiques."
            details={[
              "Bottom-Up (Comptable) : Somme statistique des consommations de carburant multipliée par des facteurs d'émission standardisés (GIEC Tier 1, 2, 3). Précis pour les grandes centrales, mais incertain pour les fuites diffuses et les sols agricoles.",
              "Top-Down (Atmosphérique) : Mesure des gradients spatio-temporels de CO₂ dans l'air (stations ICOS, satellites OCO-2) couplée à un modèle météorologique inverse pour déduire où et quand le CO₂ a été émis ou absorbé.",
              "La comparaison des deux approches permet de détecter d'éventuels écarts ou sous-déclarations de gaz à effet de serre."
            ]}
            badge="MÉTHODOLOGIE"
            variant="amber"
          />
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
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs font-mono text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <strong>Copernicus ADS : Inversion 4D-Var CAMS Optimisée</strong> (cams-global-greenhouse-gas-inversion)
            </span>
            <span className="text-[10px] text-purple-300">
              Résolution 0.5° × 0.5° · Modèle de transport inverse LMDz / IFS
            </span>
          </div>

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

      {/* Tab 2: Sectoral Emissions (CITEPA France - Versioned & Managed) */}
      {activeTab === 'emissions' && (
        <div className="space-y-6">
          {/* Versioning & Tooling Control Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    Gestionnaire d'Inventaires CITEPA (Format SECTEN)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    Versionnement Actif
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Basculez entre éditions historiques ou importez un rapport d'inventaire actualisé
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Version Selector */}
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono">
                  <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <label htmlFor="citepa-ver" className="text-slate-400 sr-only">Édition</label>
                  <select
                    id="citepa-ver"
                    value={selectedVersionId}
                    onChange={e => handleVersionChange(e.target.value)}
                    className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
                  >
                    {versions.map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                        {v.edition} (Année {v.consolidatedYear} - {v.totalCO2eGrossMt} Mt)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actualiser CITEPA */}
                <button
                  onClick={handleSyncCitepa}
                  disabled={syncingCitepa}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-rose-500 text-xs font-mono text-rose-300 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Interroger le serveur CITEPA et recharger les données"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingCitepa ? 'animate-spin text-rose-400' : ''}`} />
                  <span>{syncingCitepa ? 'Actualisation...' : 'Actualiser CITEPA'}</span>
                </button>

                {/* Importer Inventaire */}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer Inventaire</span>
                </button>

                {/* Toggle Trajectoire */}
                <button
                  onClick={() => setShowHistoryTable(!showHistoryTable)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                    showHistoryTable 
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200' 
                      : 'bg-slate-950 border-slate-700 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{showHistoryTable ? 'Masquer Trajectoire' : 'Trajectoire 1990-2024'}</span>
                </button>
              </div>
            </div>

            {/* Sync Notification Banner */}
            {syncStatusMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                  {syncStatusMsg}
                </span>
                <span className="text-[10px] text-rose-400">citepa.org / secten</span>
              </div>
            )}

            {/* National Totals Dashboard */}
            {fullInventory && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Total Brut National</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-rose-400">
                      {fullInventory.totals2024?.totalCO2eGrossMt || 362.4}
                    </span>
                    <span className="text-[10px] text-slate-400">Mt CO₂e</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Périmètre Kyoto</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Puits LULUCF / UTCATF</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-400">
                      {fullInventory.totals2024?.totalSinkLULUCFMt || -32.4}
                    </span>
                    <span className="text-[10px] text-slate-400">Mt CO₂</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Forêts &amp; Sols (IGN)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Solde Net Atmosphérique</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-cyan-400">
                      {fullInventory.totals2024?.totalCO2eNetMt || 330.0}
                    </span>
                    <span className="text-[10px] text-slate-400">Mt CO₂e</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Brut + Puits LULUCF</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Trajectoire 1990 → Consolidé</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-400">
                      {fullInventory.totals2024?.evolutionSince1990Percent || -33.5}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Baisse sur 35 ans (545.2 → {fullInventory.totals2024?.totalCO2eGrossMt} Mt)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Historical Trajectory Section (if toggled) */}
          {showHistoryTable && historyData.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <History className="w-4 h-4 text-rose-400" />
                  Série Longue Nationale 1990-2024 (Émissions par Secteur en Mt CO₂e)
                </h4>
                <span className="text-slate-400 font-mono text-[11px]">Format BDD_Secten officiel</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2">Année</th>
                      <th className="pb-2">Total Brut</th>
                      <th className="pb-2">Transports</th>
                      <th className="pb-2">Bâtiments</th>
                      <th className="pb-2">Industrie</th>
                      <th className="pb-2">Agriculture</th>
                      <th className="pb-2">Énergie</th>
                      <th className="pb-2">Déchets</th>
                      <th className="pb-2 text-emerald-400">Puits LULUCF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {historyData.map(h => (
                      <tr key={h.year} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-white">{h.year}</td>
                        <td className="py-2.5 text-rose-400 font-bold">{h.totalMtCO2e} Mt</td>
                        <td className="py-2.5 text-slate-300">{h.transportMt}</td>
                        <td className="py-2.5 text-slate-300">{h.batimentsMt}</td>
                        <td className="py-2.5 text-slate-300">{h.industrieMt}</td>
                        <td className="py-2.5 text-slate-300">{h.agricultureMt}</td>
                        <td className="py-2.5 text-slate-300">{h.energieMt}</td>
                        <td className="py-2.5 text-slate-300">{h.dechetsMt}</td>
                        <td className="py-2.5 text-emerald-400">{h.sinkMt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sectors Grid with Expandable Sub-Sectors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>Ventilation sectorielle ({emissions.length} secteurs - Cliquez pour déplier les sous-secteurs)</span>
              <span>Métrique : GIEC PRG AR5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emissions.map(item => {
                const Icon = getSectorIcon(item.sector);
                const isExpanded = expandedSectorId === item.id;
                const hasSubSectors = item.subSectors && item.subSectors.length > 0;
                const isSink = item.valueMtCO2 < 0;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all p-4 space-y-3 cursor-pointer ${
                      isExpanded 
                        ? 'bg-slate-900 border-rose-500 shadow-xl shadow-rose-950/20' 
                        : 'bg-slate-950/80 hover:bg-slate-900/60 border-slate-800'
                    }`}
                    onClick={() => setExpandedSectorId(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${isSink ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.sector}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {hasSubSectors ? `${item.subSectors?.length} sous-secteurs analysés` : 'Agrégat sectoriel'}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold ${isSink ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {item.sharePercent > 0 ? `+${item.sharePercent}%` : `${item.sharePercent}%`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${isSink ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(100, Math.abs(item.sharePercent) * 2.8)}%` }}
                      />
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-slate-400">Volume annuel :</span>
                      <div className="text-right">
                        <strong className="text-white text-sm block">
                          {item.valueMtCO2e ?? item.valueMtCO2} Mt CO₂e
                        </strong>
                        {item.valueMtCO2e !== item.valueMtCO2 && (
                          <span className="text-[10px] text-slate-500 block">
                            (CO₂ pur : {item.valueMtCO2} Mt)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sub-Sectors Drawer */}
                    {hasSubSectors && isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                          <span>Sous-Secteurs Détaillés</span>
                          <span>Volume (Mt) / Part</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {item.subSectors?.map((sub, idx) => (
                            <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-900 text-[11px]">
                              <span className="text-slate-300 truncate max-w-[180px]">{sub.name}</span>
                              <div className="text-right">
                                <span className="text-white font-bold">{sub.valueMtCO2 ?? sub.valueMtCO2e} Mt</span>
                                <span className="text-[10px] text-slate-500 ml-1">({sub.sharePercent}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasSubSectors && (
                      <div className="flex items-center justify-center pt-1 text-[11px] text-slate-500 font-mono gap-1">
                        <span>{isExpanded ? 'Réduire' : 'Voir sous-secteurs'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

      {/* Modal Import CITEPA */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Importer un Inventaire d'Émissions CITEPA</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Collez un inventaire au format JSON conforme à la norme SECTEN / GIEC PRG AR5. Le pipeline validera automatiquement la structure des secteurs et calculera les totaux.
            </p>

            <textarea
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder={`{\n  "manifest": { "edition": "Édition Personnalisée 2026", "latestConsolidatedYear": 2024 },\n  "sectors": [\n    { "id": "custom-transports", "sector": "Transports", "valueMtCO2": 118.5, "sharePercent": 32.7 }\n  ]\n}`}
              className="w-full h-56 p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 focus:outline-none focus:border-rose-500"
            />

            {importError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs text-rose-300 font-mono">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  // Insérer modèle exemple
                  const sample = {
                    manifest: {
                      edition: "SECTEN Édition Actualisée 2026",
                      source: "CITEPA / Inventaire SECTEN",
                      latestConsolidatedYear: 2024
                    },
                    totals2024: {
                      totalCO2eGrossMt: 362.4,
                      totalSinkLULUCFMt: -32.4,
                      totalCO2eNetMt: 330.0
                    },
                    sectors: fullInventory?.sectors || []
                  };
                  setImportJsonText(JSON.stringify(sample, null, 2));
                }}
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                Insérer le modèle actuel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-mono font-bold text-white disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-900/40"
                >
                  Valider &amp; Activer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
