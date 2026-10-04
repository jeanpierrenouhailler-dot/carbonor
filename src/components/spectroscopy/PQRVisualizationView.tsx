import React, { useState } from 'react';
import { HITRAN_CO2_LINES } from '../../scientific/hitranData';
import { 
  wavenumberToWavelengthMicrons, 
  wavenumberToFrequencyTHz, 
  wavelengthMicronsToWavenumber, 
  frequencyTHzToWavenumber 
} from '../../scientific/unitConversions';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { Wind, Atom, ArrowRightLeft, Info, HelpCircle } from 'lucide-react';

export const PQRVisualizationView: React.FC = () => {
  const [activeBand, setActiveBand] = useState<'15um' | '4um'>('15um');
  const [showIsotopologues, setShowIsotopologues] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [hoveredLine, setHoveredLine] = useState<any | null>(null);

  // Conversion calculator state
  const [calcWavenumber, setCalcWavenumber] = useState<number>(667.38);

  const lines = HITRAN_CO2_LINES.filter(l => {
    if (activeBand === '15um') return l.wavenumber >= 645 && l.wavenumber <= 685;
    return l.wavenumber >= 2330 && l.wavenumber <= 2370;
  });

  // Tri par nombre d'onde
  const sortedLines = [...lines].sort((a, b) => a.wavenumber - b.wavenumber);

  const minWn = activeBand === '15um' ? 650 : 2330;
  const maxWn = activeBand === '15um' ? 685 : 2370;
  const maxIntensity = Math.max(...lines.map(l => l.intensity));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-400" />
              Visualisation Quantique des Branches P / Q / R
            </h2>
            <ProvenanceBadge category="SIMULATED" />
          </div>
          <p className="text-xs text-slate-400">
            Structure fine rotation-vibration du CO₂ et règles de sélection dipolaire quantique
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton data={sortedLines} datasetName={`pqr_band_${activeBand}`} />
        </div>
      </div>

      {/* Band selector & Options toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Bande Vibrationnelle :</span>
          <button
            onClick={() => setActiveBand('15um')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeBand === '15um'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                : 'bg-slate-950 text-slate-300 hover:text-white'
            }`}
          >
            Bande 15 µm (ν₂ Pliage Bending · P, Q, R)
          </button>
          <button
            onClick={() => setActiveBand('4um')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeBand === '4um'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'bg-slate-950 text-slate-300 hover:text-white'
            }`}
          >
            Bande 4.3 µm (ν₃ Étirement Asymétrique · P &amp; R)
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showEnvelope}
              onChange={e => setShowEnvelope(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-0"
            />
            <span>Enveloppe Spectrale</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showIsotopologues}
              onChange={e => setShowIsotopologues(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-0"
            />
            <span>Isotopologue ¹³C¹⁶O₂</span>
          </label>
        </div>
      </div>

      {/* Main Interactive Spectrum Canvas with Triple Synchronized Axes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-3 text-xs">
          <div>
            <span className="font-bold text-white">
              {activeBand === '15um' ? 'Bande de vibration de pliage ν₂ (01¹0 ← 00⁰0)' : 'Bande d\'étirement asymétrique ν₃ (00⁰1 ← 00⁰0)'}
            </span>
            <p className="text-slate-400 font-mono text-[11px]">
              {activeBand === '15um'
                ? 'Présence de la branche Q intense au centre car le mode de pliage engendre un moment angulaire vibrationnel (Δl = ±1).'
                : 'Absence totale de branche Q (interdite par les règles de sélection dipolaire pour une transition parallèle Σ_u⁺ ← Σ_g⁺, ΔJ = ±1 uniquement).'}
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
              Branche P (ΔJ = -1)
            </span>
            {activeBand === '15um' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                Branche Q (ΔJ = 0)
              </span>
            )}
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
              Branche R (ΔJ = +1)
            </span>
          </div>
        </div>

        {/* Triple Axis SVG Plot */}
        <div className="relative w-full h-80">
          <svg className="w-full h-full" viewBox="0 0 900 320" preserveAspectRatio="none">
            {/* Axis 1 (Top): Wavelength in µm */}
            <line x1="60" y1="35" x2="860" y2="35" stroke="#334155" strokeWidth="1" />
            <text x="60" y="22" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
              λ (µm) :
            </text>

            {/* Axis 2 (Bottom): Wavenumber in cm⁻¹ */}
            <line x1="60" y1="260" x2="860" y2="260" stroke="#334155" strokeWidth="1" />
            <text x="60" y="280" fill="#F43F5E" fontSize="11" fontFamily="monospace" fontWeight="bold">
              ν (cm⁻¹) :
            </text>

            {/* Axis 3 (Very Bottom): Frequency in THz */}
            <line x1="60" y1="300" x2="860" y2="300" stroke="#1E293B" strokeWidth="0.8" />
            <text x="60" y="315" fill="#34D399" fontSize="10" fontFamily="monospace">
              f (THz) :
            </text>

            {/* Axis ticks along the range */}
            {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
              const x = 60 + fraction * 800;
              const wn = minWn + fraction * (maxWn - minWn);
              const wl = wavenumberToWavelengthMicrons(wn);
              const thz = wavenumberToFrequencyTHz(wn);

              return (
                <g key={fraction}>
                  {/* Top tick */}
                  <line x1={x} y1="30" x2={x} y2="40" stroke="#38BDF8" strokeWidth="1" />
                  <text x={x} y="22" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    {wl.toFixed(3)}
                  </text>

                  {/* Vertical grid line */}
                  <line x1={x} y1="40" x2={x} y2="260" stroke="#1E293B" strokeDasharray="2 4" strokeWidth="0.5" />

                  {/* Bottom tick (Wavenumber) */}
                  <line x1={x} y1="255" x2={x} y2="265" stroke="#F43F5E" strokeWidth="1" />
                  <text x={x} y="280" fill="#F43F5E" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    {wn.toFixed(1)}
                  </text>

                  {/* Frequency tick */}
                  <text x={x} y="315" fill="#34D399" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {thz.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Draw Spectral Envelope */}
            {showEnvelope && (
              <path
                d={(() => {
                  const pts = sortedLines.map(l => {
                    const x = 60 + ((l.wavenumber - minWn) / (maxWn - minWn)) * 800;
                    const y = 260 - (l.intensity / maxIntensity) * 190;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  });
                  return 'M ' + pts.join(' L ');
                })()}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.4"
              />
            )}

            {/* Draw Spectral Lines */}
            {sortedLines.map(l => {
              const x = 60 + ((l.wavenumber - minWn) / (maxWn - minWn)) * 800;
              const height = (l.intensity / maxIntensity) * 190;
              const y = 260 - height;
              const isHovered = hoveredLine?.id === l.id;

              const strokeColor =
                l.branch === 'P' ? '#3B82F6' : l.branch === 'Q' ? '#10B981' : '#F43F5E';

              return (
                <g
                  key={l.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLine(l)}
                  onMouseLeave={() => setHoveredLine(null)}
                >
                  <line
                    x1={x}
                    y1="260"
                    x2={x}
                    y2={y}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 4 : l.branch === 'Q' ? 3 : 2}
                    strokeLinecap="round"
                    className="transition-all"
                  />
                  {/* Top dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : 2.5}
                    fill={strokeColor}
                  />

                  {/* J Quantum Label on top of line */}
                  <text
                    x={x}
                    y={y - 8}
                    fill={strokeColor}
                    fontSize={isHovered ? 11 : 9}
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {l.branch}({l.lowerJ})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hovered Line Details Toast */}
        {hoveredLine && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <span className="font-bold text-white">
              Raie {hoveredLine.branch}({hoveredLine.lowerJ}) : J''={hoveredLine.lowerJ} → J'={hoveredLine.upperJ}
            </span>
            <span>ν₀ = <strong className="text-rose-400">{hoveredLine.wavenumber.toFixed(3)} cm⁻¹</strong></span>
            <span>λ = <strong className="text-cyan-400">{hoveredLine.wavelengthMicrons.toFixed(3)} µm</strong></span>
            <span>f = <strong className="text-emerald-400">{hoveredLine.frequencyTHz.toFixed(2)} THz</strong></span>
            <span>S_ij = <strong className="text-amber-400">{hoveredLine.intensity.toExponential(2)}</strong> cm⁻¹/(mol·cm⁻²)</span>
            <span className="text-slate-400">({hoveredLine.isotopologueName})</span>
          </div>
        )}
      </div>

      {/* Simultaneous Exact Unit Converter Tool */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Convertisseur Exact CODATA : Nombre d'Onde ↔ Longueur d'Onde ↔ Fréquence
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[11px] font-mono text-slate-400 block">Nombre d'onde ν (cm⁻¹)</label>
            <input
              type="number"
              step="0.01"
              value={calcWavenumber}
              onChange={e => setCalcWavenumber(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-500 font-mono block">1 / λ en centimètres</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[11px] font-mono text-slate-400 block">Longueur d'onde λ (µm)</label>
            <input
              type="number"
              step="0.001"
              value={wavenumberToWavelengthMicrons(calcWavenumber).toFixed(4)}
              onChange={e => setCalcWavenumber(wavelengthMicronsToWavenumber(parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 font-mono block">λ = 10000 / ν</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[11px] font-mono text-slate-400 block">Fréquence f (THz)</label>
            <input
              type="number"
              step="0.01"
              value={wavenumberToFrequencyTHz(calcWavenumber).toFixed(3)}
              onChange={e => setCalcWavenumber(frequencyTHzToWavenumber(parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 font-mono block">f = c · ν (c = 299 792 458 m/s)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
