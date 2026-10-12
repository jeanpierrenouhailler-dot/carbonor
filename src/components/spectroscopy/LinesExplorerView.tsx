import React, { useState, useEffect } from 'react';
import { HitranHapiProvider, HitranHapiQueryParams, HitranHapiResultLine, HitranHapiResponse } from '../../providers/hitranHapiProvider';
import { SpectralLine, VibrationalBranch } from '../../types/spectroscopy';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ExportButton } from '../common/ExportButton';
import { ScienceTooltip, PedagogicBanner } from '../common/ScienceTooltip';
import { 
  Atom, 
  Filter, 
  Search, 
  Wind, 
  Info, 
  ExternalLink, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Database, 
  Thermometer, 
  Gauge, 
  Sparkles,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Table as TableIcon,
  BarChart2
} from 'lucide-react';

export const LinesExplorerView: React.FC = () => {
  // Mode de fonctionnement : 'embedded' (embarqué offline) vs 'scientific' (HAPI dynamique)
  const [operationalMode, setOperationalMode] = useState<'embedded' | 'scientific'>('scientific');

  // Paramètres de requête HAPI Scientifique
  const [selectedIsotopologue, setSelectedIsotopologue] = useState<string>('all');
  const [selectedBand, setSelectedBand] = useState<string>('15um');
  const [nuMin, setNuMin] = useState<number>(640);
  const [nuMax, setNuMax] = useState<number>(700);
  const [jLowerMin, setJLowerMin] = useState<number>(0);
  const [jLowerMax, setJLowerMax] = useState<number>(60);
  const [selectedBranch, setSelectedBranch] = useState<'ALL' | VibrationalBranch>('ALL');
  const [minIntensityExp, setMinIntensityExp] = useState<number>(-25); // 10^-25
  const [temperatureK, setTemperatureK] = useState<number>(296.0);
  const [pressureAtm, setPressureAtm] = useState<number>(1.0);

  // Données et état de chargement
  const [loading, setLoading] = useState<boolean>(false);
  const [hapiResponse, setHapiResponse] = useState<HitranHapiResponse | null>(null);
  const [activeLines, setActiveLines] = useState<HitranHapiResultLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<HitranHapiResultLine | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronisation des plages spectrales lors du changement de bande
  const handleBandPreset = (bandKey: string) => {
    setSelectedBand(bandKey);
    if (bandKey === '15um') {
      setNuMin(640);
      setNuMax(700);
    } else if (bandKey === '4.3um') {
      setNuMin(2320);
      setNuMax(2385);
    } else if (bandKey === '2.7um') {
      setNuMin(3650);
      setNuMax(3750);
    } else if (bandKey === '2.06um') {
      setNuMin(4820);
      setNuMax(4890);
    } else if (bandKey === '1.61um') {
      setNuMin(6200);
      setNuMax(6260);
    } else if (bandKey === '1.43um') {
      setNuMin(6940);
      setNuMax(7010);
    } else if (bandKey === 'all') {
      setNuMin(600);
      setNuMax(7100);
    }
  };

  // Exécution de la requête selon le mode
  const executeQuery = async () => {
    setLoading(true);
    try {
      if (operationalMode === 'embedded') {
        const embedded = HitranHapiProvider.getEmbeddedLines();
        const filtered = embedded.filter(line => {
          if (selectedBranch !== 'ALL' && line.branch !== selectedBranch) return false;
          if (selectedIsotopologue !== 'all' && line.isotopologue !== selectedIsotopologue) return false;
          if (selectedBand === '15um' && (line.wavenumber < 640 || line.wavenumber > 700)) return false;
          if (selectedBand === '4.3um' && (line.wavenumber < 2320 || line.wavenumber > 2385)) return false;
          if (selectedBand === '1.61um' && (line.wavenumber < 6200 || line.wavenumber > 6260)) return false;
          if (Math.log10(line.intensity) < minIntensityExp) return false;
          return true;
        });
        setActiveLines(filtered);
        if (filtered.length > 0) setSelectedLine(filtered[0]);
        setHapiResponse({
          source: 'HITRAN_EMBEDDED',
          version: 'HITRAN2020 / Embarqué Local',
          query: { band: selectedBand, isotopologue: selectedIsotopologue, branch: selectedBranch },
          executionTimeMs: 1,
          totalMatchingLines: filtered.length,
          returnedLinesCount: filtered.length,
          thermodynamics: { temperatureK: 296, pressureAtm: 1.0, partitionFunctionQ: 288.5 },
          spectralBounds: {
            minWavenumber: filtered.length > 0 ? Math.min(...filtered.map(l => l.wavenumber)) : 0,
            maxWavenumber: filtered.length > 0 ? Math.max(...filtered.map(l => l.wavenumber)) : 0,
            minWavelengthMicrons: 0,
            maxWavelengthMicrons: 0
          },
          lines: filtered
        });
      } else {
        // Mode Scientifique HAPI
        const queryParams: HitranHapiQueryParams = {
          molecule: 'CO2',
          isotopologue: selectedIsotopologue,
          band: selectedBand,
          numin: nuMin,
          numax: nuMax,
          jLowerMin,
          jLowerMax,
          branch: selectedBranch,
          minIntensity: Math.pow(10, minIntensityExp),
          temperature: temperatureK,
          pressure: pressureAtm,
          limit: 2500
        };

        const res = await HitranHapiProvider.queryHapi(queryParams);
        setHapiResponse(res);
        setActiveLines(res.lines);
        if (res.lines.length > 0) setSelectedLine(res.lines[0]);
      }
    } catch (e) {
      console.error('Erreur exécution requête HITRAN/HAPI:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeQuery();
  }, [operationalMode]);

  // Filtrage local rapide par recherche textuelle
  const displayedLines = activeLines.filter(line => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return line.id.toLowerCase().includes(q) ||
           line.bandDescription.toLowerCase().includes(q) ||
           `j${line.lowerJ}`.includes(q) ||
           `j${line.upperJ}`.includes(q) ||
           line.isotopologueName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Atom className="w-5 h-5 text-rose-400" />
              <span>Explorateur Spectroscopique HITRAN / HAPI (CO₂)</span>
              <ScienceTooltip
                title="Base de Données Spectroscopique HITRAN & HAPI"
                summary="Standard mondial de spectroscopic line-by-line pour les gaz à effet de serre géré par le Harvard-Smithsonian Center for Astrophysics."
                details={[
                  "HITRAN (High-resolution Transmission Molecular Absorption Database) répertorie plus de 10 millions de transitions rotation-vibration quantiques pour 55 molécules.",
                  "HAPI (HITRAN Application Programming Interface) permet d'interroger dynamiquement la base en spécifiant molécule, isotopologue, bande, nombres quantiques J et conditions thermodynamiques (P, T).",
                  "L'application propose deux modes : le Mode Embarqué (quelques dizaines de raies fondamentales intégrées dans le bundle pour un usage offline immédiat) et le Mode Scientifique HAPI qui calcule ou télécharge l'intégralité du peigne spectral avec correction thermique de Boltzmann et élargissements collisionnels de Lorentz."
                ]}
                instrument="Spectromètres FTS sol (TCCON) et transfert radiatif LBL"
                unitMeaning="Intensité S_ij en cm⁻¹ / (molécule · cm⁻²) à 296 K"
                whyItMatters="Cette base est le fondement physique de tous les algorithmes d'inversion satellitaires (NASA OCO-2/3) et des modèles climatiques du GIEC."
                source="HITRAN2020 / HAPI v1.2 / Harvard-Smithsonian CfA"
                badge="SIMULÉ"
                variant="rose"
              />
            </h2>
            <ProvenanceBadge category="SIMULATED" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transitions rotation-vibration raie-par-raie : nombres quantiques J, branches P/Q/R, énergies fondamentales E'' et coefficients d'élargissement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton data={displayedLines} datasetName={`hitran_co2_${operationalMode}_lines`} />
        </div>
      </div>

      {/* Mode Switcher Banner: Mode Embarqué vs Mode Scientifique HAPI */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Mode de Fonctionnement Spectroscopique :</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                operationalMode === 'scientific'
                  ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {operationalMode === 'scientific' ? 'MODE SCIENTIFIQUE DYNAMIQUE' : 'MODE EMBARQUÉ OFFLINE (~2 550 RAIES)'}
              </span>
              <ScienceTooltip
                title="Bimodalité HITRAN : Embarqué vs Scientifique"
                summary="Permet de concilier autonomie complète hors-ligne et rigueur spectroscopique raie-par-raie sur mesure."
                details={[
                  "Mode Embarqué : ~2 550 raies fondamentales et harmoniques intégrées de manière ultra-légère dans le bundle sans bloquer le réseau ni saturer la mémoire.",
                  "Mode Scientifique : Interrogation dynamique HAPI permettant de cibler n'importe quel intervalle spectral spécifique, n'importe quelle bande, combinaison quantique J''/J' et recalcul exact sous Pression P et Température T choisies.",
                  "En environnement Cloudflare Pages ou PWA hors-ligne, le moteur bascule automatiquement sur son générateur quantique local afin de garantir un fonctionnement sans aucune coupure."
                ]}
                badge="ARCHITECTURE"
                variant="rose"
              />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {operationalMode === 'scientific'
                ? "HAPI actif : cascade dynamique HAPI → requête HITRAN → isotopologue → bande → intervalle spectral → J'' → J' → intensité → pression/température."
                : "Mode embarqué : ~2 550 raies essentielles préchargées (offline / démonstration / pédagogique)."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono shrink-0">
          <button
            onClick={() => setOperationalMode('embedded')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              operationalMode === 'embedded'
                ? 'bg-slate-800 text-white font-bold border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode Embarqué (Démo · ~2.5k raies)
          </button>
          <button
            onClick={() => setOperationalMode('scientific')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              operationalMode === 'scientific'
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/50'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mode Scientifique (HAPI)</span>
          </button>
        </div>
      </div>

      {/* Pedagogic Guide Banner */}
      <PedagogicBanner
        title="Guide Spectroscopique : Comment se structure le spectre d'absorption du CO₂ ?"
        badge="Physique Moléculaire Quantique"
        description="Le dioxyde de carbone est une molécule linéaire triatomique (O=C=O). Ses transitions absorption ne sont pas continues mais forment un peigne discret de milliers de raies fines quantifiées."
        bullets={[
          {
            title: "Les modes normaux de vibration (ν₁, ν₂, ν₃)",
            text: "Le CO₂ possède 3 modes fondamentaux : 1) Élongation symétrique ν₁ (~1388 cm⁻¹, inactif en infrarouge direct car sans moment dipolaire), 2) Pliage ν₂ à 15 µm (667.38 cm⁻¹, doublement dégénéré, dipôle perpendiculaire très actif, cœur de l'effet de serre), 3) Élongation asymétrique ν₃ à 4.3 µm (2349 cm⁻¹, dipôle parallèle extrêmement intense)."
          },
          {
            title: "Les branches P, Q, R et sélection quantique",
            text: "Chaque transition vibrationnelle s'accompagne d'un saut quantique rotationnel : Branche P (ΔJ = J' - J'' = -1, saut vers un niveau de rotation inférieur), Branche Q (ΔJ = 0, autorisée seulement si le moment angulaire vibrationnel l change, comme dans le pliage ν₂), Branche R (ΔJ = +1, saut vers un niveau de rotation supérieur)."
          },
          {
            title: "Règle de symétrie nucléaire pour ¹²C¹⁶O₂",
            text: "L'atome d'oxygène ¹⁶O a un spin nucléaire nul (boson). En vertu du principe de symétrie de la fonction d'onde, seuls les niveaux rotationnels pairs (J = 0, 2, 4, 6, ...) existent dans l'état fondamental de ¹²C¹⁶O₂. En revanche, pour l'isotopologue asymétrique ¹²C¹⁶O¹⁸O, tous les J (pairs et impairs) sont permis !"
          },
          {
            title: "Correction de température de Boltzmann S(T)",
            text: "À température ambiante, les molécules sont distribuées selon la statistique de Maxwell-Boltzmann. Lorsque la température augmente, les niveaux de rotation élevés J > 30 se peuplent davantage, faisant croître l'intensité des raies d'ailes et diminuant les raies de centre de bande."
          }
        ]}
      />

      {/* Mode Embarqué Information Banner when active */}
      {operationalMode === 'embedded' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Mode Embarqué : Base Préchargée (~2 550 Raies HITRAN Essentielles)
              </h3>
              <ScienceTooltip
                title="Base Embarquée HITRAN Essentielle"
                summary="Échantillonnage physique complet préchargé permettant une navigation fluide à 100% hors-ligne."
                details={[
                  "Contient l'intégralité des transitions fondamentales et harmoniques pour ¹²C¹⁶O₂, ¹³C¹⁶O₂ et ¹²C¹⁶O¹⁸O jusqu'à J'' = 80.",
                  "Couvre les bandes à 15 µm, 4.3 µm, 2.7 µm, 2.06 µm, 1.61 µm et 1.43 µm.",
                  "Calculé instantanément en mémoire selon les règles quantiques HITRAN 2020 sans requérir de téléchargement externe.",
                  "Pour une personnalisation fine des seuils ou un calcul sous d'autres pressions/températures, basculez sur le Mode Scientifique HAPI."
                ]}
                badge="OFFLINE"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-sky-400">
                {activeLines.length} raies actives en mémoire
              </span>
              <button
                onClick={() => setOperationalMode('scientific')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Ouvrir Mode Scientifique HAPI</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Filtre Rapide Démo :</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleBandPreset('15um')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${selectedBand === '15um' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                15 µm (ν₂)
              </button>
              <button
                onClick={() => handleBandPreset('4.3um')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${selectedBand === '4.3um' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                4.3 µm (ν₃)
              </button>
              <button
                onClick={() => handleBandPreset('1.61um')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${selectedBand === '1.61um' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                1.61 µm (OCO-2)
              </button>
              <button
                onClick={() => handleBandPreset('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${selectedBand === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Toutes les bandes
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedBranch('ALL')}
                className={`px-2 py-1 rounded-lg text-[11px] cursor-pointer ${selectedBranch === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
              >
                Branches P/Q/R
              </button>
              <button
                onClick={() => setSelectedBranch('P')}
                className={`px-2 py-1 rounded-lg text-[11px] cursor-pointer ${selectedBranch === 'P' ? 'bg-sky-950 text-sky-400 font-bold' : 'text-slate-400'}`}
              >
                P
              </button>
              <button
                onClick={() => setSelectedBranch('Q')}
                className={`px-2 py-1 rounded-lg text-[11px] cursor-pointer ${selectedBranch === 'Q' ? 'bg-emerald-950 text-emerald-400 font-bold' : 'text-slate-400'}`}
              >
                Q
              </button>
              <button
                onClick={() => setSelectedBranch('R')}
                className={`px-2 py-1 rounded-lg text-[11px] cursor-pointer ${selectedBranch === 'R' ? 'bg-rose-950 text-rose-400 font-bold' : 'text-slate-400'}`}
              >
                R
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Scientifique : Interactive HAPI Workflow Query Bar with Explicit Step-by-Step Cascade */}
      {operationalMode === 'scientific' && (
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Flux de Requête HAPI / HITRAN 2020 (Cascade Dynamique)
              </h3>
              <ScienceTooltip
                title="Flux de Filtrage HAPI Standardisé (Cascade Scientifique)"
                summary="Pipeline séquentiel permettant d'isoler avec exactitude n'importe quel sous-ensemble de raies HITRAN selon le cahier des charges de transfert radiatif."
                details={[
                  "1. HAPI : Client d'interrogation standardisé (Harvard-Smithsonian CfA).",
                  "2. Requête HITRAN : Appel API serveur (/api/hitran/query) avec mise en cache disque et repli local fluide.",
                  "3. Isotopologue : Sélectionne les variantes ¹²C¹⁶O₂, ¹³C¹⁶O₂, ¹²C¹⁶O¹⁸O selon l'abondance naturelle.",
                  "4. Bande : Fixe la transition vibrationnelle fondamentale ou harmonique.",
                  "5. Intervalle spectral : Délimite [νmin, νmax] en cm⁻¹.",
                  "6. États quantiques J'' : Niveau rotationnel fondamental (règles de symétrie nucléaire).",
                  "7. États quantiques J' : Niveau excité selon la branche (ΔJ = -1, 0, +1).",
                  "8. Seuil minimal d'intensité S_ij : Élimine le bruit numérique des transitions ultra-faibles.",
                  "9. Conditions thermodynamiques (P, T) : Recalcul dynamique de la fonction de partition Q(T), de la loi de Boltzmann pour l'état fondamental et des demi-largeurs de Lorentz et Doppler."
                ]}
                badge="HAPI PROTOCOL"
                variant="rose"
              />
            </div>

            <div className="flex items-center gap-2">
              {hapiResponse && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Source : <strong className="text-rose-400">{hapiResponse.source}</strong> ({hapiResponse.returnedLinesCount} raies en {hapiResponse.executionTimeMs} ms)
                </span>
              )}
              <button
                onClick={executeQuery}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/60 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Interrogation HAPI...' : 'Exécuter Requête HAPI'}</span>
              </button>
            </div>
          </div>

          {/* Explicit Visual Stepper Cascade matching: HAPI ↓ requête HITRAN ↓ isotopologue ↓ bande ↓ intervalle spectral ↓ J'' ↓ J' ↓ intensité ↓ pression/température */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-[10px] font-mono whitespace-nowrap min-w-max text-slate-400">
              <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 font-bold border border-rose-500/30">1. HAPI</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">2. Requête HITRAN</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">3. Isotopologue ({selectedIsotopologue})</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">4. Bande ({selectedBand})</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">5. Intervalle [{nuMin}-{nuMax} cm⁻¹]</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">6. J'' [{jLowerMin}-{jLowerMax}]</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">7. J' ({selectedBranch})</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">8. Intensité (≥ 10^{minIntensityExp})</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 font-bold border border-rose-500/30">9. P &amp; T ({pressureAtm} atm, {temperatureK} K)</span>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* 1. Isotopologue */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">1. Isotopologue</span>
                <ScienceTooltip
                  title="Isotopologues du CO₂"
                  summary="Variantes moléculaires avec isotopes stables ¹²C, ¹³C, ¹⁶O, ¹⁷O, ¹⁸O."
                  details={[
                    "¹²C¹⁶O₂ (626) : 98.42% d'abondance naturelle.",
                    "¹³C¹⁶O₂ (636) : 1.106% d'abondance. Utilisé pour tracer l'origine des émissions fossiles (effet Suess de déplétion en carbone 13).",
                    "¹²C¹⁶O¹⁸O (628) : 0.395% d'abondance. Molécule asymétrique sans centre d'inversion, active sur toutes les parités rotationnelles."
                  ]}
                  badge="ISOTOPES"
                />
              </div>
              <select
                value={selectedIsotopologue}
                onChange={e => setSelectedIsotopologue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="all">Tous les isotopologues</option>
                <option value="626">¹²C¹⁶O₂ (626, 98.42%)</option>
                <option value="636">¹³C¹⁶O₂ (636, 1.106%)</option>
                <option value="628">¹²C¹⁶O¹⁸O (628, 0.395%)</option>
                <option value="627">¹²C¹⁶O¹⁷O (627, 0.073%)</option>
                <option value="638">¹³C¹⁶O¹⁸O (638, 0.004%)</option>
              </select>
            </div>

            {/* 2. Bande Spectrale */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">2. Bande Vibrationnelle</span>
                <ScienceTooltip
                  title="Bandes Vibrationnelles Infrarouges"
                  summary="Modes fondamentaux, harmoniques et combinaisons de vibration du CO₂."
                  details={[
                    "15 µm (667 cm⁻¹) : Mode ν₂ de pliage. Principal filtre de serre terrestre.",
                    "4.3 µm (2349 cm⁻¹) : Mode ν₃ d'étirement asymétrique. Bande ultra-intense.",
                    "2.06 µm (4854 cm⁻¹) : Bande forte OCO-2 (utilisée pour discriminer les aérosols).",
                    "1.61 µm (6228 cm⁻¹) : Bande faible OCO-2 (linéaire, utilisée pour XCO₂)."
                  ]}
                  badge="VIBRATION"
                />
              </div>
              <select
                value={selectedBand}
                onChange={e => handleBandPreset(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="15um">15 µm (ν₂ Pliage - 667 cm⁻¹)</option>
                <option value="4.3um">4.3 µm (ν₃ Élongation - 2349 cm⁻¹)</option>
                <option value="2.7um">2.7 µm (ν₁+ν₃ Combinaison - 3715 cm⁻¹)</option>
                <option value="2.06um">2.06 µm (OCO-2 Forte - 4854 cm⁻¹)</option>
                <option value="1.61um">1.61 µm (OCO-2 Faible - 6228 cm⁻¹)</option>
                <option value="1.43um">1.43 µm (3ν₃ Harmonique - 6972 cm⁻¹)</option>
                <option value="all">Toutes les bandes</option>
              </select>
            </div>

            {/* 3. Intervalle Spectral [nu_min, nu_max] */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">3. Intervalle [νmin, νmax]</span>
                <ScienceTooltip
                  title="Intervalle Spectral en Nombre d'Onde (cm⁻¹)"
                  summary="Le nombre d'onde ν = 1 / λ représente le nombre de cycles d'onde par centimètre."
                  details={[
                    "Relation avec la longueur d'onde : λ (µm) = 10 000 / ν (cm⁻¹).",
                    "Relation avec la fréquence temporelle : f (THz) = c · ν · 100 / 10¹².",
                    "La spectroscopie moléculaire utilise universellement le cm⁻¹ car l'énergie d'un photon est directement proportionnelle au nombre d'onde : E = h · c · ν."
                  ]}
                  formula="ν [cm⁻¹] = 10 000 / λ [µm]"
                  badge="UNITÉ SPECTROSCOPIQUE"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pb-0.5">
                <span>Plage en µm :</span>
                <span>{nuMin > 0 ? (10000 / nuMin).toFixed(2) : ''} → {nuMax > 0 ? (10000 / nuMax).toFixed(2) : ''} µm</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={nuMin}
                  onChange={e => setNuMin(parseFloat(e.target.value) || 0)}
                  className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                  placeholder="ν min"
                />
                <span className="text-slate-600">à</span>
                <input
                  type="number"
                  value={nuMax}
                  onChange={e => setNuMax(parseFloat(e.target.value) || 0)}
                  className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                  placeholder="ν max"
                />
              </div>
            </div>

            {/* 4. Filtre Quantique J'' et Branches P/Q/R */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">4. États J'' &amp; Branche</span>
                <ScienceTooltip
                  title="Nombres Quantiques Rotationnels J'' et J'"
                  summary="J'' est le moment cinétique de rotation dans l'état initial, J' est celui dans l'état excité."
                  details={[
                    "Branche P : ΔJ = J' - J'' = -1 (la molécule perd 1 quantum de rotation lors du photon absorbé).",
                    "Branche Q : ΔJ = 0 (pas de saut de rotation, transition purement vibrationnelle autorisée seulement si le moment angulaire vibrationnel change, ex: pliage ν₂ à 15 µm).",
                    "Branche R : ΔJ = +1 (la molécule gagne 1 quantum de rotation lors du photon absorbé).",
                    "Règle de sélection : Pour ¹²C¹⁶O₂, seuls les J'' pairs existent dans l'état fondamental du fait de la symétrie de spin des noyaux ¹⁶O (bosons de spin 0)."
                  ]}
                  badge="MÉCANIQUE QUANTIQUE"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-cyan-400 pb-0.5">
                <span>Règle sélection :</span>
                <span>ΔJ = {selectedBranch === 'P' ? '-1' : selectedBranch === 'R' ? '+1' : selectedBranch === 'Q' ? '0' : 'Tous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value as any)}
                  className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                >
                  <option value="ALL">P/Q/R</option>
                  <option value="P">Branche P</option>
                  <option value="Q">Branche Q</option>
                  <option value="R">Branche R</option>
                </select>
                <div className="flex items-center gap-1 w-1/2">
                  <input
                    type="number"
                    value={jLowerMin}
                    onChange={e => setJLowerMin(parseInt(e.target.value, 10) || 0)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 px-1 py-1 rounded text-[11px] text-center"
                    title="J'' min"
                  />
                  <span className="text-slate-600">-</span>
                  <input
                    type="number"
                    value={jLowerMax}
                    onChange={e => setJLowerMax(parseInt(e.target.value, 10) || 90)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 px-1 py-1 rounded text-[11px] text-center"
                    title="J'' max"
                  />
                </div>
              </div>
            </div>

            {/* 5. Seuil d'Intensité */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">5. Seuil Intensité S_cut</span>
                <ScienceTooltip
                  title="Intensité Spectrale Intégrée S_ij"
                  summary="Mesure la probabilité quantique intrinsèque de transition dipolaire par molécule."
                  details={[
                    "Unité HITRAN : cm⁻¹ / (molécule · cm⁻²), équivalente à une section efficace intégrée en cm²/molécule.",
                    "Les raies principales du centre de bande à 15 µm et 4.3 µm ont des intensités de l'ordre de 10⁻¹⁹ à 10⁻¹⁸ cm⁻¹/molec.",
                    "Fixer un seuil (ex: 10⁻²⁵) permet d'éliminer les millions de transitions de bandes chaudes ultra-faibles sans perturber le transfert radiatif."
                  ]}
                  badge="INTENSITÉ HITRAN"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-rose-300 pb-0.5">
                <span>Seuil sélectionné :</span>
                <span>10^{minIntensityExp} cm⁻¹/molec</span>
              </div>
              <input
                type="range"
                min="-28"
                max="-18"
                step="1"
                value={minIntensityExp}
                onChange={e => setMinIntensityExp(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* 6. Température T */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  6. Température T (K)
                </span>
                <ScienceTooltip
                  title="Correction Thermique de Boltzmann S(T)"
                  summary="La température redistribue les populations des niveaux quantiques rotationnels selon la statistique de Maxwell-Boltzmann."
                  details={[
                    "Formule : S_ij(T) = S_ij(T_ref) · [Q(T_ref) / Q(T)] · exp(-c₂ · E'' · (1/T - 1/T_ref)) · [1 - exp(-c₂ · ν / T)] / [1 - exp(-c₂ · ν / T_ref)].",
                    "Quand T diminue (ex: tropopause à 210 K), les niveaux J faibles se concentrent et le centre de bande s'amincit.",
                    "Quand T augmente, les niveaux de rotation élevés J > 30 se peuplent, ce qui fait croître l'absorption dans les ailes de bande."
                  ]}
                  formula="S(T) = S(T₀) · (Q₀/Q) · exp(-c₂·E''/T) / exp(-c₂·E''/T₀)"
                  badge="THERMODYNAMIQUE"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-amber-300 pb-0.5">
                <span>Température :</span>
                <span>{temperatureK} K ({(temperatureK - 273.15).toFixed(0)} °C)</span>
              </div>
              <input
                type="range"
                min="180"
                max="360"
                step="2"
                value={temperatureK}
                onChange={e => setTemperatureK(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 7. Pression P */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  7. Pression P (atm)
                </span>
                <ScienceTooltip
                  title="Élargissement Collisionnel par la Pression (Profil de Lorentz)"
                  summary="Les collisions moléculaires raccourcissent la durée de vie radiative de l'état excité, élargissant la raie en fréquence."
                  details={[
                    "Formule de demi-largeur Lorentz : α_L(P, T) = P · (T_ref / T)^n_air · γ_air.",
                    "Au niveau de la mer (P = 1 atm), la demi-largeur collisionnelle est d'environ 0.07 cm⁻¹ (soit ~2 GHz).",
                    "Dans la haute atmosphère (P = 0.01 atm, 30 km d'altitude), l'élargissement par pression devient négligeable devant l'élargissement Doppler thermique."
                  ]}
                  formula="α_L(P, T) = P · (296/T)^n_air · γ_air"
                  badge="TRANSFERT RADIATIF"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-cyan-300 pb-0.5">
                <span>Pression atmosphérique :</span>
                <span>{pressureAtm.toFixed(2)} atm ({(pressureAtm * 1013.25).toFixed(0)} hPa)</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={pressureAtm}
                onChange={e => setPressureAtm(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* 8. Indicateur de Rendement Métrologique */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Résultat &amp; Cohérence</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-white">{activeLines.length}</span>
                <span className="text-[11px] text-slate-400">raies sélectionnées</span>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Prêt pour transfert radiatif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Spectral Visualizer + Lines Table + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table & Spectral Peak Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spectral Stick Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-white uppercase tracking-wider">
                  Spectre de Raies (Peigne Quantique Stick Spectrum)
                </span>
                <ScienceTooltip
                  title="Spectre en Bâtons (Stick Spectrum)"
                  summary="Représentation purement discrète des transitions moléculaires avant élargissement par la pression ou la température."
                  details={[
                    "Chaque bâton vertical correspond à une transition électronique-vibrationnelle-rotationnelle exacte entre deux états quantiques discrets.",
                    "La hauteur représente le logarithme de l'intensité intégrée S(T) en cm⁻¹ / (molécule · cm⁻²).",
                    "Les couleurs distinguent les trois branches quantiques : Bleu pour P (ΔJ = -1), Vert pour Q (ΔJ = 0) et Rose pour R (ΔJ = +1).",
                    "Cliquez sur n'importe quel bâton pour afficher sa fiche métrologique complète à droite."
                  ]}
                  badge="STICK SPECTRUM"
                  variant="rose"
                />
              </div>
              <span className="text-slate-400 text-[11px]">
                {displayedLines.length} raies affichées · Échelle log(S)
              </span>
            </div>

            {/* SVG Stick Spectrum */}
            <div className="relative w-full h-44 bg-slate-950 rounded-xl p-3 border border-slate-800/80">
              {displayedLines.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500">
                  Aucune raie dans cette fenêtre spectrale avec les seuils actuels.
                </div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 700 140" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="20" y1="20" x2="680" y2="20" stroke="#1E293B" strokeDasharray="3 3" />
                  <line x1="20" y1="70" x2="680" y2="70" stroke="#1E293B" strokeDasharray="3 3" />
                  <line x1="20" y1="120" x2="680" y2="120" stroke="#1E293B" />

                  {(() => {
                    const minW = Math.min(...displayedLines.map(l => l.wavenumber));
                    const maxW = Math.max(...displayedLines.map(l => l.wavenumber));
                    const span = Math.max(0.01, maxW - minW);

                    return displayedLines.map(l => {
                      const x = 30 + ((l.wavenumber - minW) / span) * 640;
                      // Échelle log normalisée entre -26 et -17
                      const logI = Math.log10(Math.max(1e-28, l.intensityAtT || l.intensity));
                      const normI = Math.max(0.05, Math.min(1, (logI - (-27)) / 9));
                      const y = 120 - normI * 100;
                      const isSelected = selectedLine?.id === l.id;

                      const strokeColor = l.branch === 'P' ? '#38BDF8' : l.branch === 'Q' ? '#34D399' : '#FB7185';

                      return (
                        <g key={l.id} className="cursor-pointer" onClick={() => setSelectedLine(l)}>
                          <line
                            x1={x}
                            y1="120"
                            x2={x}
                            y2={y}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? '3' : '1.5'}
                            opacity={isSelected ? 1 : 0.8}
                          />
                          {isSelected && (
                            <circle cx={x} cy={y} r="3" fill="#FFF" />
                          )}
                        </g>
                      );
                    });
                  })()}
                </svg>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Branche P (ΔJ = -1)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Branche Q (ΔJ = 0)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span>Branche R (ΔJ = +1)</span>
              </span>
            </div>
          </div>

          {/* Lines Table Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white font-mono">
                  Catalogue Numérique HITRAN ({displayedLines.length} raies)
                </h3>
                <ScienceTooltip
                  title="Paramètres de Transition du Catalogue HITRAN"
                  summary="Chaque ligne du tableau résume les descripteurs physiques et quantiques d'une transition rotation-vibration."
                  details={[
                    "ν₀ (cm⁻¹) : Nombre d'onde central au repos sous vide.",
                    "λ (µm) : Longueur d'onde correspondante (10 000 / ν₀).",
                    "Iso : Isotopologue (ex: ¹²C¹⁶O₂, ¹³C¹⁶O₂).",
                    "Branche : Type de transition P (ΔJ = -1), Q (ΔJ = 0) ou R (ΔJ = +1).",
                    "J'' → J' : Nombres quantiques rotationnels initial (fondamental) et final (excité).",
                    "S(296K) : Intensité absolue de référence HITRAN à 296 Kelvin.",
                    "S(T) : Intensité recalculée à la température sélectionnée via Maxwell-Boltzmann.",
                    "γ_air : Demi-largeur à mi-hauteur d'élargissement collisionnel par l'air (cm⁻¹/atm)."
                  ]}
                  badge="CATALOGUE QUANTIQUE"
                />
              </div>

              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filtrer J, isotopologue..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500 w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="pb-2 pl-2">ν₀ (cm⁻¹)</th>
                    <th className="pb-2">λ (µm)</th>
                    <th className="pb-2">Iso</th>
                    <th className="pb-2">Branche</th>
                    <th className="pb-2">J'' → J'</th>
                    <th className="pb-2">S(296K)</th>
                    <th className="pb-2">S(T)</th>
                    <th className="pb-2">γ_air</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayedLines.map(line => {
                    const isSelected = selectedLine?.id === line.id;
                    return (
                      <tr
                        key={line.id}
                        onClick={() => setSelectedLine(line)}
                        className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-rose-950/40 text-white font-bold' : 'text-slate-300'
                        }`}
                      >
                        <td className="py-2 pl-2 text-rose-300">{line.wavenumber.toFixed(3)}</td>
                        <td className="py-2 text-slate-400">{line.wavelengthMicrons.toFixed(3)}</td>
                        <td className="py-2 text-slate-300">{line.isotopologueName}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            line.branch === 'P' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                            line.branch === 'Q' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {line.branch}
                          </span>
                        </td>
                        <td className="py-2 text-slate-200">
                          {line.branch}({line.lowerJ}) → {line.upperJ}
                        </td>
                        <td className="py-2 text-slate-400">{line.intensity.toExponential(2)}</td>
                        <td className="py-2 text-amber-300 font-semibold">
                          {(line.intensityAtT || line.intensity).toExponential(2)}
                        </td>
                        <td className="py-2 text-slate-400">{line.airWidth.toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Comprehensive Line Inspector */}
        <div className="space-y-6">
          {selectedLine ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl font-mono text-xs">
              <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase text-rose-400 font-bold block">Fiche Métrologique de Raie</span>
                    <ScienceTooltip
                      title="Fiche Métrologique Spectroscopique"
                      summary="Ensemble des constantes physiques certifiées selon le standard international HITRAN 2020."
                      details={[
                        "Énergie inférieure E'' : Énergie quantique du niveau fondamental en cm⁻¹. Détermine la dépendance thermique de Boltzmann.",
                        "Coefficient d'Einstein A_ij : Probabilité de désexcitation spontanée par seconde (s⁻¹).",
                        "Coefficients de demi-largeur γ_air et γ_self : Taux d'élargissement collisionnel par molécules d'air sec et par molécules de CO₂.",
                        "Décalage en pression δ_air : Déplacement de la fréquence centrale provoqué par le champ moléculaire environnant."
                      ]}
                      badge="CERTIFICATION HITRAN"
                      variant="rose"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <span>{selectedLine.id}</span>
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 text-[10px]">
                  {selectedLine.isotopologueName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase text-slate-500 block">Transition Rotation-Vibration</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[11px] block">État Inférieur (''):</span>
                    <strong className="text-white">v={selectedLine.lowerVibrational}, J''={selectedLine.lowerJ}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">État Supérieur ('):</span>
                    <strong className="text-white">v={selectedLine.upperVibrational}, J'={selectedLine.upperJ}</strong>
                  </div>
                </div>
                <div className="pt-1 text-[11px] text-cyan-300">
                  Branche {selectedLine.branch} : ΔJ = {selectedLine.upperJ - selectedLine.lowerJ}
                </div>
              </div>

              {/* Physical Parameters List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Nombre d'onde ν₀ :</span>
                  <strong className="text-white">{selectedLine.wavenumber} cm⁻¹</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Longueur d'onde λ :</span>
                  <strong className="text-white">{selectedLine.wavelengthMicrons} µm</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Intensité S(296K) :</span>
                  <strong className="text-rose-300">{selectedLine.intensity.toExponential(4)}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Intensité S({temperatureK}K) :</span>
                  <strong className="text-amber-300">{(selectedLine.intensityAtT || selectedLine.intensity).toExponential(4)}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Énergie inf. E'' :</span>
                  <strong className="text-white">{selectedLine.lowerEnergy} cm⁻¹</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Demi-largeur Lorentz γ_air :</span>
                  <strong className="text-white">{selectedLine.airWidth} cm⁻¹/atm</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Exposant temp. n_air :</span>
                  <strong className="text-white">{selectedLine.tempDependence}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Coeff. Einstein A_ij :</span>
                  <strong className="text-white">{selectedLine.einsteinA} s⁻¹</strong>
                </div>
                {selectedLine.lorentzWidthHWHM !== undefined && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Demi-larg. Lorentz ({pressureAtm} atm) :</span>
                    <strong className="text-cyan-300">{selectedLine.lorentzWidthHWHM} cm⁻¹</strong>
                  </div>
                )}
                {selectedLine.dopplerWidthHWHM !== undefined && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Demi-larg. Doppler ({temperatureK} K) :</span>
                    <strong className="text-cyan-300">{selectedLine.dopplerWidthHWHM} cm⁻¹</strong>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="text-slate-300 font-bold block uppercase text-[10px]">Description de Bande :</span>
                <p>{selectedLine.bandDescription}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 text-center text-slate-500 font-mono text-xs">
              Sélectionnez une raie dans le tableau pour inspecter ses paramètres quantiques détaillés.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
