import React from 'react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { BookOpen, ShieldCheck, Database, CheckCircle2, ExternalLink, Atom, Wind, Satellite } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const sources = [
    {
      name: 'NOAA Global Monitoring Laboratory (GML)',
      url: 'https://gml.noaa.gov/',
      erddap: 'https://erddap.gml.noaa.gov/',
      category: 'MEASURED' as const,
      license: 'NOAA Public Domain Data Policy (Open Government Data)',
      doi: '10.15138/9N0H-ZH07',
      variables: 'CO₂ continu in situ, flacons d\'air (flasks), profils avion et AirCore',
      citation: 'Thoning, K.W., Kitzis, D.R., and Crotwell, A. (2025). Atmospheric Carbon Dioxide Dry Air Mole Fractions from the NOAA GML Network.'
    },
    {
      name: 'ICOS Carbon Portal (Integrated Carbon Observation System)',
      url: 'https://data.icos-cp.eu/',
      category: 'MEASURED' as const,
      license: 'Creative Commons Attribution 4.0 International (CC-BY-4.0)',
      doi: '10.18160/icos-atmos-release-2026',
      variables: 'Réseau européen de stations atmosphériques Classe 1 & 2, profils de mâts, flux d\'écosystèmes',
      citation: 'ICOS Atmosphere Release 2026 Level 2, ICOS Carbon Portal.'
    },
    {
      name: 'NASA Earthdata / OCO-2 & OCO-3',
      url: 'https://disc.gsfc.nasa.gov/datasets?keywords=OCO-2',
      category: 'OBSERVED' as const,
      license: 'NASA Open Access Software and Data Policy',
      doi: '10.5067/EWSGQD2MI070',
      variables: 'XCO₂ moyenne de colonne sèche, incertitude rétrospective, empreintes (footprints), quality flags',
      citation: 'Crisp, D., et al. (2025). The Orbiting Carbon Observatory (OCO-2) and OCO-3 XCO2 retrieval algorithm and validation.'
    },
    {
      name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
      url: 'https://atmosphere.copernicus.eu/',
      category: 'MODELED' as const,
      license: 'Copernicus Free and Open Access License',
      doi: '10.24380/cams-co2-forecast',
      variables: 'Réanalyses 3D, concentrations de surface, flux nets de surface et inversions atmosphériques globales',
      citation: 'ECMWF / CAMS (2025). Global atmospheric greenhouse gas concentrations reanalysis and forecasts.'
    },
    {
      name: 'HITRAN Molecular Spectroscopy Database',
      url: 'https://hitran.org/',
      category: 'SIMULATED' as const,
      license: 'Academic and Open Scientific Research Use (HITRAN License Agreement)',
      doi: '10.1016/j.jqsrt.2021.107949',
      variables: 'Transitions raie-par-raie, coefficients Einstein A, demi-largeurs γ_air, γ_self, exposant n_air, profils Doppler/Lorentz/Voigt',
      citation: 'Gordon, I.E., et al. (2022). The HITRAN2020 molecular spectroscopic database. JQSRT 277, 107949.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Documentation Scientifique, Sources &amp; Licences Ouvertes
            </h2>
            <ProvenanceBadge category="MEASURED" />
            <ProvenanceBadge category="OBSERVED" />
            <ProvenanceBadge category="SIMULATED" />
          </div>
          <p className="text-xs text-slate-400">
            Cadre métrologique officiel, formules physiques fondamentales et conformité des réutilisations
          </p>
        </div>
      </div>

      {/* Fundamental Physical Equations Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Atom className="w-4 h-4 text-rose-400" />
          Équations Fondamentales du Transfert Radiatif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <strong className="text-rose-400 block font-bold">1. Loi de Beer-Lambert &amp; Profondeur Optique</strong>
            <p className="text-slate-300">
              {'τ(ν) = ∫ k_ν(s) ds = ∑_i S_i(T) · f(ν - ν₀,i) · n · L'}
              <br />
              {'T(ν) = exp(-τ(ν))'}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              S_i(T) est l'intensité de la raie à la température T, f(ν) le profil de raie normalisé, n la densité moléculaire et L le trajet optique.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <strong className="text-cyan-400 block font-bold">2. Équation de Schwarzschild sous LTE</strong>
            <p className="text-slate-300">
              {'dI_ν / ds = - α_ν · I_ν + j_ν'}
              <br />
              {'Sous équilibre thermodynamique local (LTE) : j_ν = α_ν · B_ν(T)'}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              $B_\nu(T)$ est la fonction de Planck pour le rayonnement du corps noir. L'émission thermique est égale à l'absorption locale.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Sources Directory */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Répertoire des Sources Officielles et Licences
          </h3>
          <span className="text-xs text-slate-400 font-mono">CC-BY / Open Data uniquement</span>
        </div>

        <div className="space-y-4">
          {sources.map(src => (
            <div
              key={src.name}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{src.name}</h4>
                  <ProvenanceBadge category={src.category} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {src.license}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block">Variables couvertes :</span>
                  <span className="text-slate-300">{src.variables}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">DOI persistant :</span>
                  <span className="text-cyan-400">{src.doi}</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 italic pt-1 border-t border-slate-900">
                "{src.citation}"
              </div>

              <div className="pt-1 flex gap-3 text-xs font-semibold">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                >
                  <span>Accéder au portail officiel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
