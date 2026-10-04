import React, { useState } from 'react';
import { HITRAN_CO2_LINES } from '../../scientific/hitranData';
import { SpectralLine, VibrationalBranch } from '../../types/spectroscopy';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { Atom, Filter, Search, Wind, Info, ExternalLink } from 'lucide-react';

export const LinesExplorerView: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<'ALL' | VibrationalBranch>('ALL');
  const [selectedBand, setSelectedBand] = useState<'ALL' | '15um' | '4um' | '16um'>('ALL');
  const [selectedIsotopologue, setSelectedIsotopologue] = useState<string>('ALL');
  const [minIntensityExp, setMinIntensityExp] = useState<number>(-24);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<SpectralLine | null>(HITRAN_CO2_LINES[0]);

  const filteredLines = HITRAN_CO2_LINES.filter(line => {
    if (selectedBranch !== 'ALL' && line.branch !== selectedBranch) return false;
    if (selectedIsotopologue !== 'ALL' && line.isotopologue !== selectedIsotopologue) return false;
    if (selectedBand === '15um' && (line.wavenumber < 640 || line.wavenumber > 690)) return false;
    if (selectedBand === '4um' && (line.wavenumber < 2320 || line.wavenumber > 2380)) return false;
    if (selectedBand === '16um' && (line.wavenumber < 6200 || line.wavenumber > 6250)) return false;

    if (Math.log10(line.intensity) < minIntensityExp) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = line.id.toLowerCase().includes(q);
      const matchBand = line.bandDescription.toLowerCase().includes(q);
      const matchJ = `j${line.lowerJ}`.includes(q) || `j${line.upperJ}`.includes(q);
      if (!matchId && !matchBand && !matchJ) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Atom className="w-5 h-5 text-rose-400" />
              Explorateur de Raies Spectroscopiques (HITRAN 2020)
            </h2>
            <ProvenanceBadge category="SIMULATED" />
          </div>
          <p className="text-xs text-slate-400">
            Transitions rotation-vibration du CO₂ quantifié : nombres quantiques J, branches P/Q/R et coefficients d'élargissement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton data={filteredLines} datasetName="hitran_co2_spectral_lines" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          {/* Band filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Bande :</span>
            {(['ALL', '15um', '4um', '16um'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBand(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedBand === b ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {b === 'ALL' ? 'Toutes' : b === '15um' ? '15 µm (ν₂)' : b === '4um' ? '4.3 µm (ν₃)' : '1.61 µm (OCO)'}
              </button>
            ))}
          </div>

          {/* Branch filter */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="text-slate-500">Branche :</span>
            {(['ALL', 'P', 'Q', 'R'] as const).map(br => (
              <button
                key={br}
                onClick={() => setSelectedBranch(br)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedBranch === br ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {br === 'ALL' ? 'P/Q/R' : `Branche ${br}`}
              </button>
            ))}
          </div>

          {/* Isotopologue */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="text-slate-500">Isotopologue :</span>
            <select
              value={selectedIsotopologue}
              onChange={e => setSelectedIsotopologue(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg text-[11px] focus:outline-none"
            >
              <option value="ALL">Tous les isotopologues</option>
              <option value="626">¹²C¹⁶O₂ (98.42%)</option>
              <option value="636">¹³C¹⁶O₂ (1.106%)</option>
            </select>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher J', J'' ou ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500 w-44"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Grid: Lines Table + Line Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Atom className="w-4 h-4 text-rose-400" />
              Catalogue de Raies HITRAN ({filteredLines.length} sélectionnées)
            </h3>
            <span className="text-slate-400 font-mono text-[11px]">Unité S_ij : cm⁻¹/(mol·cm⁻²)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="pb-2 pl-2">ν₀ (cm⁻¹)</th>
                  <th className="pb-2">λ (µm)</th>
                  <th className="pb-2">Branche</th>
                  <th className="pb-2">Transition J'' → J'</th>
                  <th className="pb-2">Intensité S_ij</th>
                  <th className="pb-2">γ_air</th>
                  <th className="pb-2 pr-2">Isotopologue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLines.map(line => {
                  const isSelected = selectedLine?.id === line.id;
                  const branchColor =
                    line.branch === 'P' ? 'text-blue-400' : line.branch === 'Q' ? 'text-emerald-400' : 'text-rose-400';

                  return (
                    <tr
                      key={line.id}
                      onClick={() => setSelectedLine(line)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-rose-500/15 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-2.5 pl-2 font-bold text-white">{line.wavenumber.toFixed(3)}</td>
                      <td className="py-2.5 text-slate-400">{line.wavelengthMicrons.toFixed(3)}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold bg-slate-950 border border-slate-800 ${branchColor}`}>
                          {line.branch}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-200">
                        {line.branch}({line.lowerJ}) : {line.lowerJ} → {line.upperJ}
                      </td>
                      <td className="py-2.5 text-cyan-300">{line.intensity.toExponential(2)}</td>
                      <td className="py-2.5 text-slate-400">{line.airWidth}</td>
                      <td className="py-2.5 pr-2 text-slate-400 text-[11px]">{line.isotopologueName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Line Deep Inspector (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
          {selectedLine ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block mb-1">
                    {selectedLine.bandDescription}
                  </span>
                  <h3 className="text-lg font-bold text-white font-mono">
                    {selectedLine.branch}({selectedLine.lowerJ}) · ν = {selectedLine.wavenumber.toFixed(3)} cm⁻¹
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Isotopologue {selectedLine.isotopologueName} (Abondance : {(selectedLine.abundanceFraction * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Spectral coordinates card */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Nombre d'onde</span>
                  <strong className="text-white text-sm">{selectedLine.wavenumber.toFixed(3)}</strong>
                  <span className="text-[9px] text-slate-500 block">cm⁻¹</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Longueur d'onde</span>
                  <strong className="text-cyan-400 text-sm">{selectedLine.wavelengthMicrons.toFixed(3)}</strong>
                  <span className="text-[9px] text-slate-500 block">µm</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Fréquence</span>
                  <strong className="text-emerald-400 text-sm">{selectedLine.frequencyTHz.toFixed(2)}</strong>
                  <span className="text-[9px] text-slate-500 block">THz</span>
                </div>
              </div>

              {/* Quantum Mechanics Parameters */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[11px]">
                  Paramètres Quantiques &amp; Vibratoires
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Niveau Vibrationnel :</span>
                    <strong className="text-white">{selectedLine.lowerVibrational} → {selectedLine.upperVibrational}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Moment Angulaire J :</span>
                    <strong className="text-white">J''={selectedLine.lowerJ} → J'={selectedLine.upperJ} (ΔJ = {selectedLine.branch === 'P' ? -1 : selectedLine.branch === 'Q' ? 0 : 1})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Énergie fondamentale E'' :</span>
                    <strong className="text-slate-300">{selectedLine.lowerEnergy} cm⁻¹</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Einstein A_ij :</span>
                    <strong className="text-slate-300">{selectedLine.einsteinA} s⁻¹</strong>
                  </div>
                </div>
              </div>

              {/* Broadening parameters */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[11px]">
                  Élargissement par Collision (Lorentz)
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">γ_air (élargissement air) :</span>
                    <strong className="text-cyan-300">{selectedLine.airWidth} cm⁻¹/atm</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">γ_self (auto-élargissement) :</span>
                    <strong className="text-cyan-300">{selectedLine.selfWidth} cm⁻¹/atm</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Exposant temporel n_air :</span>
                    <strong className="text-slate-300">{selectedLine.tempDependence}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Décalage pression δ_air :</span>
                    <strong className="text-slate-300">{selectedLine.pressureShift} cm⁻¹/atm</strong>
                  </div>
                </div>
              </div>

              <a
                href="https://hitran.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 border border-slate-700 transition-colors"
              >
                <span>Vérifier sur le portail officiel HITRANonline</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Sélectionnez une raie dans le tableau.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
