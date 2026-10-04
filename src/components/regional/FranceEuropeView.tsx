import React, { useState } from 'react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { Flag, Building, Trees, Wind, Satellite, ShieldCheck, MapPin } from 'lucide-react';

export const FranceEuropeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'france' | 'europe'>('france');

  // French stations data
  const frenchStations = [
    {
      code: 'PUY',
      name: 'Puy de Dôme (OPGC / CNRS)',
      altitude: '1465 m',
      currentCO2: 426.15,
      type: 'Station d\'altitude libre',
      role: 'Fond atmosphérique continental européen ICOS Classe 1'
    },
    {
      code: 'OHP',
      name: 'Observatoire de Haute-Provence (Pythéas / CEA)',
      altitude: '650 m',
      currentCO2: 427.30,
      type: 'Station moyenne altitude',
      role: 'Surveillance bassin méditerranéen & forêt de chênes'
    },
    {
      code: 'TRN',
      name: 'Traînou Tour 180 m (LSCE / Forêt d\'Orléans)',
      altitude: '131 m',
      currentCO2: 430.45,
      type: 'Tour haute multi-niveaux (5, 50, 100, 180m)',
      role: 'Stratification de la couche limite et gradient nocturne'
    },
    {
      code: 'PDM',
      name: 'Pic du Midi de Bigorre (OMP / ORA)',
      altitude: '2877 m',
      currentCO2: 424.95,
      type: 'Haute montagne pyrénéenne',
      role: 'Troposphère libre sans influence locale directe'
    }
  ];

  // European countries comparison
  const europeanCountries = [
    { country: 'France', emTotalMtCO2: 385.4, perCapitaTCO2: 5.6, energyMixNuclearPercent: 68, topSink: 'Forêts Vosges / Jura / Landes' },
    { country: 'Allemagne', emTotalMtCO2: 673.8, perCapitaTCO2: 8.0, energyMixNuclearPercent: 0, topSink: 'Forêt Noire / Tourbières' },
    { country: 'Italie', emTotalMtCO2: 395.2, perCapitaTCO2: 6.7, energyMixNuclearPercent: 0, topSink: 'Apennins / Alpes' },
    { country: 'Espagne', emTotalMtCO2: 272.5, perCapitaTCO2: 5.7, energyMixNuclearPercent: 20, topSink: 'Zone Cantabrique' },
    { country: 'Norvège', emTotalMtCO2: 48.9, perCapitaTCO2: 8.9, energyMixNuclearPercent: 0, topSink: 'Taïga scandinave & Fjords' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-cyan-400" />
              Focus Territorial : France &amp; Europe
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="ESTIMATED" />
          </div>
          <p className="text-xs text-slate-400">
            Observatoires atmosphériques ICOS France, profil de couche limite Traînou et bilans comparatifs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            data={activeTab === 'france' ? frenchStations : europeanCountries}
            datasetName={activeTab === 'france' ? 'france_co2_observatories' : 'europe_countries_budget'}
          />
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-mono w-fit">
        <button
          onClick={() => setActiveTab('france')}
          className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'france' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Observatoires de France (ICOS)
        </button>
        <button
          onClick={() => setActiveTab('europe')}
          className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'europe' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Comparatif Européen (UE-27)
        </button>
      </div>

      {/* France View */}
      {activeTab === 'france' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frenchStations.map(st => (
              <div
                key={st.code}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{st.code}</span>
                    <h3 className="text-base font-bold text-white">{st.name}</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Alt. {st.altitude}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-mono">Dernière concentration sol :</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white font-mono">{st.currentCO2}</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">ppm</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div>Typologie : <strong className="text-slate-200">{st.type}</strong></div>
                  <div>Rôle scientifique : <span className="text-slate-300">{st.role}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Deep dive: Traînou Tall Tower Gradient */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trees className="w-4 h-4 text-emerald-400" />
                  Mégastructure de Traînou (Tour 180 m, Forêt d'Orléans)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Démonstration expérimentale de l'accumulation nocturne de CO₂ au sol
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                Picarro CRDS multi-niveaux
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 5 m (Sous-bois)</span>
                <strong className="text-xl text-rose-400 block font-bold">442.2 ppm</strong>
                <span className="text-[10px] text-slate-500 block">Forte respiration des sols</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 50 m (Canopée)</span>
                <strong className="text-xl text-amber-400 block font-bold">434.6 ppm</strong>
                <span className="text-[10px] text-slate-500 block">Mélange turbulent</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 100 m</span>
                <strong className="text-xl text-cyan-400 block font-bold">430.1 ppm</strong>
                <span className="text-[10px] text-slate-500 block">Transition couche limite</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 180 m (Sommet mât)</span>
                <strong className="text-xl text-emerald-400 block font-bold">426.5 ppm</strong>
                <span className="text-[10px] text-slate-500 block">Air libre régional</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Europe View */}
      {activeTab === 'europe' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <h3 className="font-bold text-white font-mono uppercase tracking-wider">
              Comparatif des Émissions &amp; Puits de Carbone en Europe (2024)
            </h3>
            <span className="text-slate-400 font-mono text-[11px]">Sources : AEE / Eurostat / ICOS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Pays</th>
                  <th className="pb-2">Émissions Totales (Mt CO₂)</th>
                  <th className="pb-2">Par Habitant (t/hab)</th>
                  <th className="pb-2">Part Nucléaire (%)</th>
                  <th className="pb-2">Principal Puits Forestier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {europeanCountries.map(c => (
                  <tr key={c.country} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-white">{c.country}</td>
                    <td className="py-3 text-cyan-400">{c.emTotalMtCO2} Mt</td>
                    <td className="py-3 text-slate-200">{c.perCapitaTCO2} t</td>
                    <td className="py-3 text-emerald-400">{c.energyMixNuclearPercent}%</td>
                    <td className="py-3 text-slate-400 text-[11px]">{c.topSink}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
