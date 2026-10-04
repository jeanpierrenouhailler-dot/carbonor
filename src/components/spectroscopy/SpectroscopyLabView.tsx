import React, { useState, useMemo } from 'react';
import { SpectroscopyEngine } from '../../scientific/spectroscopyEngine';
import { BeerLambertParams, LineProfileType, SimulationResult } from '../../types/spectroscopy';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { 
  SlidersHorizontal, 
  Atom, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Flame,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const SpectroscopyLabView: React.FC = () => {
  // Preset concentration buttons from prompt #38: 280, 350, 400, 450, 500, 600, 800, 1000 ppm
  const PRESET_CONCENTRATIONS = [280, 350, 400, 420, 450, 500, 600, 800, 1000];

  const [concentration, setConcentration] = useState<number>(420);
  const [temperature, setTemperature] = useState<number>(296);
  const [pressure, setPressure] = useState<number>(1.0);
  const [pathLength, setPathLength] = useState<number>(100); // 100 m
  const [profileType, setProfileType] = useState<LineProfileType>('Voigt');
  const [metricView, setMetricView] = useState<'transmittance' | 'opticalDepth' | 'absorbance' | 'radiance'>('transmittance');

  // Comparison baseline mode (e.g., comparing current concentration with 280 ppm pre-industrial)
  const [compareBaseline, setCompareBaseline] = useState<boolean>(true);

  const currentParams: BeerLambertParams = useMemo(() => ({
    molecule: 'CO2',
    isotopologue: 'all',
    concentrationPpm: concentration,
    temperatureK: temperature,
    pressureAtm: pressure,
    pathLengthMeters: pathLength,
    spectralResolutionCm1: 0.08,
    centerWavenumberCm1: 667.38,
    windowHalfWidthCm1: 22, // 645 to 690 cm⁻¹
    profileType
  }), [concentration, temperature, pressure, pathLength, profileType]);

  const baselineParams: BeerLambertParams = useMemo(() => ({
    ...currentParams,
    concentrationPpm: 280
  }), [currentParams]);

  // Run line-by-line calculations
  const simResult: SimulationResult = useMemo(() => {
    return SpectroscopyEngine.simulateSpectrum(currentParams);
  }, [currentParams]);

  const baselineResult: SimulationResult = useMemo(() => {
    return SpectroscopyEngine.simulateSpectrum(baselineParams);
  }, [baselineParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-rose-400" />
              Laboratoire Virtuel de Spectroscopie &amp; Simulation Beer-Lambert
            </h2>
            <ProvenanceBadge category="SIMULATED" />
          </div>
          <p className="text-xs text-slate-400">
            Calcul raie-par-raie de la transmittance T(ν), de la profondeur optique τ(ν) et de la saturation du centre de bande
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton data={simResult.points} datasetName={`spectrum_sim_${concentration}ppm`} />
        </div>
      </div>

      {/* Crucial Scientific Warning on Saturation & Wings (Prompt #38 Requirement) */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 leading-relaxed space-y-1.5">
        <div className="flex items-center gap-2 font-bold font-mono text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Loi de Beer-Lambert &amp; Saturation du Centre de Bande (Physique du Forçage Radiatif)</span>
        </div>
        <p>
          Au cœur de la bande 15 µm (autour de 667.4 cm⁻¹), la profondeur optique τ est déjà très supérieure à 1 (τ &gt; 50, transmittance T ≈ 0) même avec <strong>280 ppm</strong> préindustriels. L'augmentation du CO₂ n'augmente donc pas l'absorption au centre saturé, mais <strong>élargit les ailes des raies (branches P et R)</strong> où l'atmosphère est encore semi-transparente, expliquant la relation logarithmique universelle du GIEC : ΔF = 5.35 · ln(C / C₀) W/m².
        </p>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        {/* Concentration Selector & Slider */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 font-bold uppercase tracking-wider">
              Concentration en CO₂ : <strong className="text-white text-sm">{concentration} ppm</strong>
            </label>
            <span className="text-[11px] text-slate-500">
              {concentration === 280 && '(Préindustriel ~1750)'}
              {concentration === 420 && '(Niveau planétaire actuel)'}
              {concentration >= 560 && '(Doublement du CO₂)'}
            </span>
          </div>

          {/* Quick presets buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CONCENTRATIONS.map(ppm => (
              <button
                key={ppm}
                onClick={() => setConcentration(ppm)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  concentration === ppm
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {ppm}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="200"
            max="1200"
            step="10"
            value={concentration}
            onChange={e => setConcentration(parseInt(e.target.value, 10))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Temperature & Pressure */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase">Température :</span>
            <strong className="text-white">{temperature} K ({(temperature - 273.15).toFixed(0)} °C)</strong>
          </div>
          <input
            type="range"
            min="200"
            max="340"
            step="5"
            value={temperature}
            onChange={e => setTemperature(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 cursor-pointer"
          />

          <div className="flex justify-between pt-1">
            <span className="text-slate-400 font-bold uppercase">Pression :</span>
            <strong className="text-white">{pressure.toFixed(2)} atm ({Math.round(pressure * 1013)} hPa)</strong>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.05"
            value={pressure}
            onChange={e => setPressure(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Path length and Profile Type */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase">Trajet Optique L :</span>
            <strong className="text-white">{pathLength} m</strong>
          </div>
          <input
            type="range"
            min="1"
            max="1000"
            step="5"
            value={pathLength}
            onChange={e => setPathLength(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between pt-1">
            <span className="text-slate-400 font-bold uppercase">Profil de raie :</span>
            <select
              value={profileType}
              onChange={e => setProfileType(e.target.value as LineProfileType)}
              className="bg-slate-950 border border-slate-800 text-white rounded px-2 py-0.5 text-[11px] focus:outline-none"
            >
              <option value="Voigt">Voigt (Collision + Doppler)</option>
              <option value="Lorentz">Lorentz pur (Collisions)</option>
              <option value="Doppler">Doppler pur (Thermique)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visualization Canvas: Spectrum Graph */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        {/* Metric Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Grandeur affichée :</span>
            <button
              onClick={() => setMetricView('transmittance')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                metricView === 'transmittance' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Transmittance T(ν) = exp(-τ)
            </button>
            <button
              onClick={() => setMetricView('opticalDepth')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                metricView === 'opticalDepth' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Profondeur optique τ(ν)
            </button>
            <button
              onClick={() => setMetricView('radiance')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                metricView === 'radiance' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Radiance B_ν(T)·(1 - T)
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
            <input
              type="checkbox"
              checked={compareBaseline}
              onChange={e => setCompareBaseline(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span>Superposer référence préindustrielle (280 ppm)</span>
          </label>
        </div>

        {/* Dynamic SVG Spectrum Graph */}
        <div className="h-80 w-full pt-2">
          <svg className="w-full h-full" viewBox="0 0 850 300" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="60" y1="30" x2="800" y2="30" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="60" y1="90" x2="800" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="60" y1="150" x2="800" y2="150" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="60" y1="210" x2="800" y2="210" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="60" y1="260" x2="800" y2="260" stroke="#334155" strokeWidth="1" />

            {/* Y Axis Labels depending on metric */}
            {metricView === 'transmittance' ? (
              <>
                <text x="15" y="34" fill="#94A3B8" fontSize="10" fontFamily="monospace">1.0 (100%)</text>
                <text x="15" y="94" fill="#94A3B8" fontSize="10" fontFamily="monospace">0.75</text>
                <text x="15" y="154" fill="#94A3B8" fontSize="10" fontFamily="monospace">0.50</text>
                <text x="15" y="214" fill="#94A3B8" fontSize="10" fontFamily="monospace">0.25</text>
                <text x="15" y="264" fill="#94A3B8" fontSize="10" fontFamily="monospace">0.0 (Opaque)</text>
              </>
            ) : (
              <>
                <text x="15" y="34" fill="#94A3B8" fontSize="10" fontFamily="monospace">Max</text>
                <text x="15" y="154" fill="#94A3B8" fontSize="10" fontFamily="monospace">Moyen</text>
                <text x="15" y="264" fill="#94A3B8" fontSize="10" fontFamily="monospace">0.0</text>
              </>
            )}

            {/* X Axis Wavenumber Labels (645 to 690 cm⁻¹) */}
            {[645, 650, 655, 660, 667.4, 675, 680, 685, 690].map(wn => {
              const x = 60 + ((wn - 645) / 45) * 740;
              return (
                <g key={wn}>
                  <line x1={x} y1="260" x2={x} y2="266" stroke="#94A3B8" strokeWidth="1" />
                  <text
                    x={x}
                    y="282"
                    fill={wn === 667.4 ? '#F43F5E' : '#94A3B8'}
                    fontSize="10"
                    fontWeight={wn === 667.4 ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {wn}
                  </text>
                </g>
              );
            })}

            {/* Baseline 280 ppm curve (cyan dashed) if toggled */}
            {compareBaseline && (
              <path
                d={(() => {
                  const pts = baselineResult.points.map((p, idx) => {
                    const x = 60 + (idx / (baselineResult.points.length - 1)) * 740;
                    let val = p.transmittance;
                    if (metricView === 'opticalDepth') val = Math.min(10, p.opticalDepth) / 10;
                    const y = 260 - val * 230;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  });
                  return 'M ' + pts.join(' L ');
                })()}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />
            )}

            {/* Current simulated curve (solid rose) */}
            <path
              d={(() => {
                const pts = simResult.points.map((p, idx) => {
                  const x = 60 + (idx / (simResult.points.length - 1)) * 740;
                  let val = p.transmittance;
                  if (metricView === 'opticalDepth') val = Math.min(10, p.opticalDepth) / 10;
                  const y = 260 - val * 230;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });
                return 'M ' + pts.join(' L ');
              })()}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Theoretical Equations and Stats Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-3 border-t border-slate-900">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Transmittance Moyenne :</span>
            <strong className="text-white text-base">{(simResult.meanTransmittance * 100).toFixed(1)}%</strong>
            {compareBaseline && (
              <span className="text-[10px] text-cyan-400 block mt-0.5">
                Réf 280 ppm : {(baselineResult.meanTransmittance * 100).toFixed(1)}% (Δ = {((simResult.meanTransmittance - baselineResult.meanTransmittance) * 100).toFixed(2)}%)
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Raies Saturées (T &lt; 5%) :</span>
            <strong className="text-rose-400 text-base">{simResult.saturatedLinesCount} points spectraux</strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Cœur opaque de la bande ν₂</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Formule Beer-Lambert :</span>
            <span className="text-emerald-400 text-xs font-bold block">{simResult.theoreticalFormulas.beerLambert}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">τ(ν) = ∑ S_i(T) · f_Voigt · n_CO2 · L</span>
          </div>
        </div>
      </div>
    </div>
  );
};
