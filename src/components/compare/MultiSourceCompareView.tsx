import React, { useState } from 'react';
import { compareSeries, StatisticalComparison } from '../../scientific/statistics';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { Scale, CheckCircle2, AlertTriangle, Info, TrendingUp, Compass, Cpu, Satellite } from 'lucide-react';

export const MultiSourceCompareView: React.FC = () => {
  // Available paired comparison scenarios
  const [comparisonMode, setComparisonMode] = useState<'oco_vs_cams' | 'icos_vs_cams' | 'ground_vs_satellite'>('oco_vs_cams');

  // Ground vs Satellite vs CAMS collocated series (May 2026 track)
  const pairedData = {
    // 1. OCO-2 Satellite vs CAMS Model column (homogenous quantities: XCO2 in ppm)
    oco_vs_cams: {
      title: 'Satellite (NASA OCO-2) vs Modèle (Copernicus CAMS)',
      sourceA: 'NASA OCO-2 XCO₂ (Observations)',
      categoryA: 'OBSERVED' as const,
      sourceB: 'CAMS IFS Réanalyse XCO₂ (Modèle)',
      categoryB: 'MODELED' as const,
      isHomogeneous: true,
      homogeneityNote: 'Grandeurs parfaitement homogènes : moyenne de colonne sèche d\'air sec (XCO₂) en ppm.',
      labels: ['Trace 1 (50.8°N)', 'Trace 2 (49.5°N)', 'Trace 3 Paris (48.8°N)', 'Trace 4 Orléans (47.9°N)', 'Trace 5 Centre (46.8°N)', 'Trace 6 Auvergne (45.7°N)', 'Trace 7 Sud (44.5°N)'],
      seriesA: [423.85, 424.12, 425.40, 422.95, 422.45, 422.30, 422.10],
      seriesB: [423.40, 423.90, 424.80, 422.80, 422.30, 422.15, 421.90]
    },
    // 2. ICOS In situ vs CAMS Surface concentration (homogenous quantities: surface ppm)
    icos_vs_cams: {
      title: 'In Situ Sol (ICOS Puy de Dôme & Stations) vs Surface CAMS',
      sourceA: 'ICOS Mesures Sol In Situ (PUY, OHP, TRN, BIR, CMN)',
      categoryA: 'MEASURED' as const,
      sourceB: 'CAMS Concentration de Surface Analysée',
      categoryB: 'MODELED' as const,
      isHomogeneous: true,
      homogeneityNote: 'Grandeurs homogènes : concentrations de surface (ppm) au niveau de prélèvement.',
      labels: ['PUY (Puy de Dôme)', 'OHP (Haute-Provence)', 'TRN (Traînou 180m)', 'BIR (Birkenes)', 'CMN (Monte Cimone)'],
      seriesA: [426.15, 427.30, 426.50, 424.90, 425.80],
      seriesB: [426.80, 427.70, 427.10, 425.40, 426.20]
    },
    // 3. Ground In Situ vs Satellite XCO2 (Non-homogeneous alert requirement!)
    ground_vs_satellite: {
      title: 'Sol In Situ (ICOS Puy de Dôme) vs Colonne XCO₂ (NASA OCO-2)',
      sourceA: 'ICOS Puy de Dôme (In Situ Sol, 1465 m)',
      categoryA: 'MEASURED' as const,
      sourceB: 'NASA OCO-2 XCO₂ (Colonne Moyenne)',
      categoryB: 'OBSERVED' as const,
      isHomogeneous: false,
      homogeneityNote: 'ATTENTION MÉTHODOLOGIQUE : Ces grandeurs ne sont PAS directement homogènes ! L\'une est une mesure ponctuelle dans la couche limite, l\'autre est une intégrale massique sur 100 km d\'atmosphère. Un écart de 2 à 4 ppm est physiquement normal.',
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      seriesA: [425.8, 426.4, 427.2, 427.8, 426.2, 421.5, 417.8, 416.2, 419.4, 422.8, 424.5, 425.4],
      seriesB: [423.2, 423.8, 424.5, 425.1, 423.8, 420.2, 417.5, 416.8, 418.5, 420.9, 422.1, 422.9]
    }
  };

  const current = pairedData[comparisonMode];
  const stats: StatisticalComparison = compareSeries(current.seriesA, current.seriesB, 'ppm');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              Comparateur Multi-Sources &amp; Validation Observation vs Modèle
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="OBSERVED" />
            <ProvenanceBadge category="MODELED" />
          </div>
          <p className="text-xs text-slate-400">
            Évaluation quantitative rigoureuse : calcul de biais moyen, MAE, RMSE et corrélation de Pearson
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            data={current.labels.map((lbl, idx) => ({
              point: lbl,
              serieA: current.seriesA[idx],
              serieB: current.seriesB[idx],
              difference: Number((current.seriesB[idx] - current.seriesA[idx]).toFixed(2))
            }))}
            datasetName={`multi_compare_${comparisonMode}`}
          />
        </div>
      </div>

      {/* Scenario Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setComparisonMode('oco_vs_cams')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            comparisonMode === 'oco_vs_cams'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          OCO-2 Satellite vs CAMS Modèle (XCO₂)
        </button>
        <button
          onClick={() => setComparisonMode('icos_vs_cams')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            comparisonMode === 'icos_vs_cams'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ICOS In Situ Sol vs CAMS Surface
        </button>
        <button
          onClick={() => setComparisonMode('ground_vs_satellite')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            comparisonMode === 'ground_vs_satellite'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sol vs Satellite (Alerte Homogénéité)
        </button>
      </div>

      {/* Homogeneity Guard Card (Prompt Requirement #18: "Ne jamais comparer automatiquement des grandeurs non homogènes") */}
      <div
        className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
          current.isHomogeneous
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2 font-bold font-mono">
          {current.isHomogeneous ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Grandeurs Scientifiquement Homogènes</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400">Mise en Garde d'Homogénéité Métrologique</span>
            </>
          )}
        </div>
        <p>{current.homogeneityNote}</p>
      </div>

      {/* Statistical KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[10px] block uppercase">Biais Moyen (Mod - Obs)</span>
          <strong className={`text-xl font-black ${stats.bias > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {stats.bias > 0 ? `+${stats.bias}` : stats.bias}
          </strong>
          <span className="text-[10px] text-slate-500 block">ppm</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[10px] block uppercase">Erreur Absolue (MAE)</span>
          <strong className="text-xl font-black text-slate-200">{stats.mae}</strong>
          <span className="text-[10px] text-slate-500 block">ppm</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[10px] block uppercase">Erreur Quadratique (RMSE)</span>
          <strong className="text-xl font-black text-slate-200">{stats.rmse}</strong>
          <span className="text-[10px] text-slate-500 block">ppm</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[10px] block uppercase">Corrélation de Pearson (r)</span>
          <strong className="text-xl font-black text-cyan-400">{stats.pearsonR}</strong>
          <span className="text-[10px] text-slate-500 block">R² = {stats.rSquared}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[10px] block uppercase">Écart Max Positif</span>
          <strong className="text-xl font-black text-amber-400">+{stats.maxPositiveResidual}</strong>
          <span className="text-[10px] text-slate-500 block">ppm</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[10px] block uppercase">Nombre de Points (N)</span>
          <strong className="text-xl font-black text-white">{stats.count}</strong>
          <span className="text-[10px] text-slate-500 block">Couples appariés</span>
        </div>
      </div>

      {/* Paired Comparison Chart & Residual Bar Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              {current.title}
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono pt-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400"></span>
                {current.sourceA}
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded bg-purple-400"></span>
                {current.sourceB}
              </span>
            </div>
          </div>
        </div>

        {/* SVG Paired Series Graph */}
        <div className="h-64 w-full">
          <svg className="w-full h-full" viewBox="0 0 800 220" preserveAspectRatio="none">
            {/* Grid */}
            <line x1="50" y1="20" x2="780" y2="20" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="50" y1="90" x2="780" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="50" y1="160" x2="780" y2="160" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />

            {(() => {
              const allVals = [...current.seriesA, ...current.seriesB];
              const minVal = Math.min(...allVals) - 1.5;
              const maxVal = Math.max(...allVals) + 1.5;

              const ptsA = current.seriesA.map((v, i) => {
                const x = 70 + (i / (current.labels.length - 1)) * 700;
                const y = 180 - ((v - minVal) / (maxVal - minVal)) * 150;
                return { x, y, v };
              });

              const ptsB = current.seriesB.map((v, i) => {
                const x = 70 + (i / (current.labels.length - 1)) * 700;
                const y = 180 - ((v - minVal) / (maxVal - minVal)) * 150;
                return { x, y, v };
              });

              return (
                <>
                  {/* Labels on x */}
                  {current.labels.map((lbl, i) => {
                    const x = 70 + (i / (current.labels.length - 1)) * 700;
                    return (
                      <text
                        key={i}
                        x={x}
                        y="205"
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {lbl.length > 15 ? lbl.slice(0, 13) + '..' : lbl}
                      </text>
                    );
                  })}

                  {/* Line A */}
                  <path
                    d={'M ' + ptsA.map(p => `${p.x},${p.y}`).join(' L ')}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.2"
                  />
                  {ptsA.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
                  ))}

                  {/* Line B */}
                  <path
                    d={'M ' + ptsB.map(p => `${p.x},${p.y}`).join(' L ')}
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth="2.2"
                    strokeDasharray="4 2"
                  />
                  {ptsB.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#C084FC" stroke="#0F172A" strokeWidth="1.5" />
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        {/* Residual differences table */}
        <div className="pt-2 border-t border-slate-800 overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="pb-2">Colocalisation</th>
                <th className="pb-2">{current.sourceA.slice(0, 25)}</th>
                <th className="pb-2">{current.sourceB.slice(0, 25)}</th>
                <th className="pb-2">Résidu (B - A)</th>
                <th className="pb-2">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {current.labels.map((lbl, idx) => {
                const a = current.seriesA[idx];
                const b = current.seriesB[idx];
                const diff = Number((b - a).toFixed(2));
                const isAcceptable = Math.abs(diff) <= (current.isHomogeneous ? 1.0 : 4.0);

                return (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 text-slate-300 font-bold">{lbl}</td>
                    <td className="py-2 text-cyan-400">{a} ppm</td>
                    <td className="py-2 text-purple-400">{b} ppm</td>
                    <td className={`py-2 font-bold ${diff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {diff > 0 ? `+${diff}` : diff} ppm
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        isAcceptable ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {isAcceptable ? 'Cohérent' : 'Écart élevé'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
