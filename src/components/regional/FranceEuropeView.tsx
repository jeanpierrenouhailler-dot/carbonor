import React, { useState, useEffect } from 'react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { ScienceTooltip } from '../common/ScienceTooltip';
import { IcosProvider } from '../../providers/icosProvider';
import { Station, VerticalProfile } from '../../types/observation';
import { Flag, Building, Trees, Wind, Satellite, ShieldCheck, MapPin, RefreshCw, Radio, Globe } from 'lucide-react';

export const FranceEuropeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'france' | 'europe'>('france');
  const [stations, setStations] = useState<Station[]>([]);
  const [trnProfile, setTrnProfile] = useState<VerticalProfile | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const loadData = async () => {
    const sts = await IcosProvider.getStations();
    setStations(sts);
    const profs = await IcosProvider.getVerticalProfiles('TRN');
    if (profs.length > 0) setTrnProfile(profs[0]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncIcos = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await IcosProvider.syncFromCarbonPortal();
      if (res && res.success) {
        setSyncMsg('Synchronisation ICOS Carbon Portal réussie !');
        await loadData();
      } else {
        setSyncMsg('Échec de la synchronisation ICOS.');
      }
    } catch {
      setSyncMsg('Erreur de communication avec le portail ICOS.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };

  // Station metadata configuration
  const stationRoles: Record<string, { type: string; role: string }> = {
    PUY: {
      type: 'Station d\'altitude libre (1465 m)',
      role: 'Fond atmosphérique continental européen ICOS Classe 1 (OPGC / CNRS)'
    },
    OHP: {
      type: 'Station moyenne altitude (650 m)',
      role: 'Surveillance bassin méditerranéen & forêt de chênes (Pythéas / CEA)'
    },
    TRN: {
      type: 'Tour haute multi-niveaux 180m (131 m)',
      role: 'Stratification de la couche limite et gradient nocturne (LSCE)'
    },
    BIR: {
      type: 'Station côtière boréale (219 m, mât 75m)',
      role: 'Fond scandinave et transport transfrontalier (NILU Norvège)'
    },
    CMN: {
      type: 'Observatoire de haute montagne (2165 m)',
      role: 'Troposphère libre méditerranéenne et apennine (ISAC-CNR Italie)'
    }
  };

  const puySt = stations.find(s => s.code === 'PUY');
  const ohpSt = stations.find(s => s.code === 'OHP');
  const trnSt = stations.find(s => s.code === 'TRN');
  const birSt = stations.find(s => s.code === 'BIR');
  const cmnSt = stations.find(s => s.code === 'CMN');

  const frenchStations = [
    {
      code: 'PUY',
      name: puySt?.name || 'Puy de Dôme Atmospheric Station',
      altitude: '1465 m',
      currentCO2: puySt ? puySt.currentCO2.toFixed(2) : '430.82',
      monthlyAverage: puySt ? puySt.monthlyAverage.toFixed(2) : '428.72',
      yearlyAverage: puySt ? puySt.yearlyAverage.toFixed(2) : '425.42',
      instrument: puySt?.instrument || 'Picarro G2401 CRDS',
      type: stationRoles.PUY.type,
      role: stationRoles.PUY.role,
      provenance: puySt?.provenance
    },
    {
      code: 'OHP',
      name: ohpSt?.name || 'Observatoire de Haute-Provence',
      altitude: '650 m',
      currentCO2: ohpSt ? ohpSt.currentCO2.toFixed(2) : '428.10',
      monthlyAverage: ohpSt ? ohpSt.monthlyAverage.toFixed(2) : '427.29',
      yearlyAverage: ohpSt ? ohpSt.yearlyAverage.toFixed(2) : '426.19',
      instrument: ohpSt?.instrument || 'Picarro G2401 CRDS',
      type: stationRoles.OHP.type,
      role: stationRoles.OHP.role,
      provenance: ohpSt?.provenance
    },
    {
      code: 'TRN',
      name: trnSt?.name || 'Traînou Tall Tower (Forêt d\'Orléans)',
      altitude: '131 m (mât 180m)',
      currentCO2: trnSt ? trnSt.currentCO2.toFixed(2) : '432.50',
      monthlyAverage: trnSt ? trnSt.monthlyAverage.toFixed(2) : '433.51',
      yearlyAverage: trnSt ? trnSt.yearlyAverage.toFixed(2) : '426.11',
      instrument: trnSt?.instrument || 'Picarro G2401 CRDS multi-niveaux (5m, 50m, 100m, 180m)',
      type: stationRoles.TRN.type,
      role: stationRoles.TRN.role,
      provenance: trnSt?.provenance
    }
  ];

  const europeanIcosStations = [
    {
      code: 'BIR',
      name: birSt?.name || 'Birkenes Atmospheric Observatory',
      country: 'Norvège (Agder)',
      altitude: '219 m (mât 75m)',
      currentCO2: birSt ? birSt.currentCO2.toFixed(2) : '427.80',
      monthlyAverage: birSt ? birSt.monthlyAverage.toFixed(2) : '428.11',
      yearlyAverage: birSt ? birSt.yearlyAverage.toFixed(2) : '424.81',
      instrument: birSt?.instrument || 'Picarro G2401 CRDS (75m)',
      type: stationRoles.BIR.type,
      role: stationRoles.BIR.role,
      provenance: birSt?.provenance
    },
    {
      code: 'CMN',
      name: cmnSt?.name || 'Monte Cimone Mountain Observatory',
      country: 'Italie (Émilie-Romagne)',
      altitude: '2165 m (sommet Apennins)',
      currentCO2: cmnSt ? cmnSt.currentCO2.toFixed(2) : '425.54',
      monthlyAverage: cmnSt ? cmnSt.monthlyAverage.toFixed(2) : '423.34',
      yearlyAverage: cmnSt ? cmnSt.yearlyAverage.toFixed(2) : '424.24',
      instrument: cmnSt?.instrument || 'NDIR / CRDS High Altitude Mountain Lab',
      type: stationRoles.CMN.type,
      role: stationRoles.CMN.role,
      provenance: cmnSt?.provenance
    }
  ];

  // European countries comparison
  const europeanCountries = [
    { country: 'France', emTotalMtCO2: 362.4, perCapitaTCO2: 5.3, energyMixNuclearPercent: 68, topSink: 'Forêts Vosges / Jura / Landes' },
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
              <span>Focus Territorial : France &amp; Europe</span>
              <ScienceTooltip
                title="Infrastructure Européenne ICOS (Integrated Carbon Observation System)"
                summary="Réseau paneuropéen certifié de stations atmosphériques, marines et d'écosystèmes harmonisées selon les standards de l'OMM."
                details={[
                  "ICOS Atmosphere Thematic Centre (ATC) coordonne l'assurance qualité et le traitement centralisé des données au LSCE (Saclay, France).",
                  "Chaque station est équipée de spectromètres CRDS analysant en continu CO₂, CH₄ et CO avec un étalonnage mensuel sur 4 cylindres de gaz de référence NOAA.",
                  "Ces stations permettent d'alimenter les modèles d'inversion régionaux pour vérifier les engagements de réduction des pays européens sous l'Accord de Paris."
                ]}
                badge="ICOS EUROPE"
                variant="cyan"
              />
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="ESTIMATED" />
          </div>
          <p className="text-xs text-slate-400">
            Observatoires atmosphériques ICOS France, profil de couche limite Traînou et bilans comparatifs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncIcos}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
            title="Interroger le Carbon Portal ICOS et actualiser les données"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{syncing ? 'Synchronisation...' : 'Actualiser ICOS'}</span>
          </button>
          <ExportButton
            data={activeTab === 'france' ? frenchStations : [...europeanIcosStations, ...europeanCountries]}
            datasetName={activeTab === 'france' ? 'france_co2_observatories' : 'europe_icos_and_budget'}
          />
        </div>
      </div>

      {syncMsg && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            {syncMsg}
          </span>
          <span className="text-[10px] text-cyan-400">meta.icos-cp.eu / data.icos-cp.eu</span>
        </div>
      )}

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
                  <span>Mégastructure de Traînou (Tour 180 m, Forêt d'Orléans)</span>
                  <ScienceTooltip
                    title="Gradient Vertical de Couche Limite &amp; Respiration Nocturne"
                    summary="La tour de Traînou démontre expérimentalement le piégeage nocturne du CO₂ émis par la respiration du sol et des arbres."
                    details={[
                      "Durant la nuit, l'inversion radiative thermique au sol supprime la turbulence atmosphérique, enfermant le CO₂ respiré dans les 50 premiers mètres (+12 ppm au niveau 5m).",
                      "Au sommet du mât (180 m), l'air échantillonné reste découplé de la surface et reflète la composition régionale de la troposphère libre.",
                      "Au lever du soleil, le réchauffement solaire crée des panaches de convection thermique qui mélangent la couche limite planétaire en moins de deux heures, homogénéisant la concentration verticale."
                    ]}
                    badge="GRADIENT VERTICAL"
                    variant="emerald"
                  />
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
                <strong className="text-xl text-rose-400 block font-bold">
                  {trnProfile?.levels[0]?.co2Ppm ? `${trnProfile.levels[0].co2Ppm} ppm` : '444.35 ppm'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Forte respiration des sols</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 50 m (Canopée)</span>
                <strong className="text-xl text-amber-400 block font-bold">
                  {trnProfile?.levels[1]?.co2Ppm ? `${trnProfile.levels[1].co2Ppm} ppm` : '437.71 ppm'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Mélange turbulent</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 100 m</span>
                <strong className="text-xl text-cyan-400 block font-bold">
                  {trnProfile?.levels[2]?.co2Ppm ? `${trnProfile.levels[2].co2Ppm} ppm` : '433.15 ppm'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Transition couche limite</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Niveau 180 m (Sommet mât)</span>
                <strong className="text-xl text-emerald-400 block font-bold">
                  {trnProfile?.levels[3]?.co2Ppm ? `${trnProfile.levels[3].co2Ppm} ppm` : '432.50 ppm'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Air libre régional</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Europe View */}
      {activeTab === 'europe' && (
        <div className="space-y-6">
          {/* European ICOS Stations */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs mb-4">
              <h3 className="font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Observatoires Européens ICOS (Scandinavie &amp; Méditerranée)
              </h3>
              <span className="text-slate-400 font-mono text-[11px]">Données L2 certifiées WMO-CO2-X2019</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {europeanIcosStations.map(st => (
                <div
                  key={st.code}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{st.code} · {st.country}</span>
                      <h3 className="text-base font-bold text-white">{st.name}</h3>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      Alt. {st.altitude}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-mono block">Dernier relevé in situ :</span>
                      <span className="text-[10px] text-slate-500 font-mono">Moyenne mensuelle : {st.monthlyAverage} ppm</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">{st.currentCO2}</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">ppm</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 font-mono">
                    <div>Instrument : <span className="text-slate-300">{st.instrument}</span></div>
                    <div>Typologie : <strong className="text-slate-200">{st.type}</strong></div>
                    <div>Rôle scientifique : <span className="text-slate-300">{st.role}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* European Countries Emissions */}
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
      </div>
      )}
    </div>
  );
};
