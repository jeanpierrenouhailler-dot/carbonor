import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  Info, 
  BookOpen, 
  ExternalLink, 
  X, 
  Atom, 
  Satellite, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Scale,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export interface ScienceTooltipProps {
  /** Titre clair du concept scientifique ou de la zone */
  title: string;
  /** Résumé pédagogique rapide (1 à 2 phrases) */
  summary: string;
  /** Explication approfondie par paragraphes ou points clés */
  details?: string | string[];
  /** Formule mathématique ou relation physique fondamentale (optionnel) */
  formula?: string;
  /** Instrument ou capteur associé (ex: "Picarro G2401 CRDS", "OCO-2 SWIR") */
  instrument?: string;
  /** Unité métrologique et signification (ex: "ppm = µmol de CO₂ / mol d'air sec") */
  unitMeaning?: string;
  /** Pourquoi c'est important pour le climat ou l'observation */
  whyItMatters?: string;
  /** Source scientifique de référence ou DOI */
  source?: string;
  /** Lien de documentation ou référence externe */
  link?: { label: string; url: string };
  /** Catégorie / badge scientifique */
  badge?: string;
  /** Position du popover au survol */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Variante de couleur du déclencheur */
  variant?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
  /** Taille de l'icône */
  size?: 'xs' | 'sm' | 'md';
  /** Élément enfant optionnel (si fourni, sert de déclencheur interactif) */
  children?: React.ReactNode;
  /** Classe CSS additionnelle pour le wrapper */
  className?: string;
}

export const ScienceTooltip: React.FC<ScienceTooltipProps> = ({
  title,
  summary,
  details,
  formula,
  instrument,
  unitMeaning,
  whyItMatters,
  source,
  link,
  badge,
  position = 'top',
  variant = 'cyan',
  size = 'sm',
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          icon: 'text-emerald-400 hover:text-emerald-300',
          badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
          border: 'border-emerald-500/30',
          glow: 'group-hover:ring-emerald-500/30'
        };
      case 'amber':
        return {
          icon: 'text-amber-400 hover:text-amber-300',
          badgeBg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          border: 'border-amber-500/30',
          glow: 'group-hover:ring-amber-500/30'
        };
      case 'purple':
        return {
          icon: 'text-purple-400 hover:text-purple-300',
          badgeBg: 'bg-purple-950/80 border-purple-500/40 text-purple-300',
          border: 'border-purple-500/30',
          glow: 'group-hover:ring-purple-500/30'
        };
      case 'rose':
        return {
          icon: 'text-rose-400 hover:text-rose-300',
          badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
          border: 'border-rose-500/30',
          glow: 'group-hover:ring-rose-500/30'
        };
      case 'slate':
        return {
          icon: 'text-slate-400 hover:text-slate-300',
          badgeBg: 'bg-slate-800 border-slate-700 text-slate-300',
          border: 'border-slate-700',
          glow: 'group-hover:ring-slate-500/30'
        };
      case 'cyan':
      default:
        return {
          icon: 'text-cyan-400 hover:text-cyan-300',
          badgeBg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
          border: 'border-cyan-500/30',
          glow: 'group-hover:ring-cyan-500/30'
        };
    }
  };

  const styles = getVariantStyles();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Sur clic direct ou mobile, ouvrir la modale détaillée pour lecture confortable
    setIsModalOpen(true);
    setIsOpen(false);
  };

  // Fermer la modale sur Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  };

  const detailsList = Array.isArray(details) ? details : details ? [details] : [];

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative inline-flex items-center group cursor-pointer select-none ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTriggerClick}
        aria-label={`Infobulle scientifique : ${title}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        {children ? (
          <div className="inline-flex items-center gap-1.5">
            {children}
            <span className={`inline-flex items-center justify-center rounded-full p-0.5 transition-all ${styles.icon} hover:scale-110`}>
              <HelpCircle className={iconSizes[size]} />
            </span>
          </div>
        ) : (
          <span 
            className={`inline-flex items-center justify-center p-1 rounded-md transition-all ${styles.icon} hover:bg-slate-800/80 hover:scale-110 focus:outline-none focus:ring-1 focus:ring-cyan-400`}
            title={`Cliquez pour l'explication scientifique approfondie : ${title}`}
          >
            <HelpCircle className={iconSizes[size]} />
          </span>
        )}

        {/* Hover Popover (Desktop preview) */}
        {isOpen && !isModalOpen && (
          <div
            ref={popoverRef}
            className={`absolute z-50 w-80 sm:w-96 p-4 rounded-xl bg-slate-900/98 backdrop-blur-md border ${styles.border} shadow-2xl shadow-black/80 text-left pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150 ${
              position === 'bottom'
                ? 'top-full mt-2 left-1/2 -translate-x-1/2'
                : position === 'left'
                ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                : position === 'right'
                ? 'left-full ml-2 top-1/2 -translate-y-1/2'
                : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
            }`}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setIsOpen(true);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-white tracking-wide">{title}</span>
                </div>
                {badge && (
                  <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${styles.badgeBg}`}>
                    {badge}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3">
              {summary}
            </p>

            {/* Formula / Physic Callout */}
            {formula && (
              <div className="mb-2 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Relation clé :</span>
                {formula}
              </div>
            )}

            {/* Instrument / Unit badge */}
            {(instrument || unitMeaning) && (
              <div className="mb-3 space-y-1 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                {instrument && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span className="text-slate-400">Capteur :</span> {instrument}
                  </div>
                )}
                {unitMeaning && (
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Scale className="w-3 h-3 shrink-0" />
                    <span className="text-slate-400">Unité :</span> {unitMeaning}
                  </div>
                )}
              </div>
            )}

            {/* Call to action for full reading */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Cliquez pour l'explication complète
              </span>
              <span className="text-cyan-400 font-semibold inline-flex items-center gap-0.5 hover:text-cyan-300">
                Détails <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Full Pedagogic Modal (sur clic ou mobile) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/40 text-slate-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                    {badge && (
                      <span className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded border mt-0.5 ${styles.badgeBg}`}>
                        {badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Fermer l'infobulle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Summary Callout */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-sm leading-relaxed text-cyan-100">
              <strong className="text-cyan-300 font-semibold block mb-1">💡 En bref :</strong>
              {summary}
            </div>

            {/* Formula / Physics Section */}
            {formula && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-cyan-400" />
                  Formule &amp; Équation Physique
                </span>
                <div className="font-mono text-sm text-cyan-300 p-2.5 rounded bg-slate-900 border border-slate-800 overflow-x-auto">
                  {formula}
                </div>
              </div>
            )}

            {/* Detailed Explanation Paragraphs */}
            {detailsList.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-300" />
                  Explication Approfondie du Phénomène
                </h4>
                <div className="space-y-2.5 text-sm text-slate-300 leading-relaxed font-sans">
                  {detailsList.map((paragraph, pIdx) => (
                    <p key={pIdx} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Instrument, Unit & Importance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {instrument && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 block mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Technologie &amp; Instrument
                  </span>
                  <p className="text-xs text-slate-200">{instrument}</p>
                </div>
              )}

              {unitMeaning && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono uppercase text-amber-400 block mb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    Unité Métrologique
                  </span>
                  <p className="text-xs text-slate-200">{unitMeaning}</p>
                </div>
              )}

              {whyItMatters && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2">
                  <span className="text-[11px] font-mono uppercase text-purple-400 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pourquoi c'est crucial pour le climat
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{whyItMatters}</p>
                </div>
              )}
            </div>

            {/* Footer with Source & Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
              {source ? (
                <div>
                  <span className="text-slate-500">Source : </span>
                  <span className="font-mono text-slate-300">{source}</span>
                </div>
              ) : <div />}

              <div className="flex items-center gap-3">
                {link && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Composant de panneau pédagogique dépliable pour les sections majeures
 */
export interface PedagogicBannerProps {
  title: string;
  badge?: string;
  description: string;
  bullets?: Array<{ title: string; text: string }>;
  formula?: string;
  defaultExpanded?: boolean;
}

export const PedagogicBanner: React.FC<PedagogicBannerProps> = ({
  title,
  badge = 'Guide Scientifique',
  description,
  bullets = [],
  formula,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{title}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{description}</p>
          </div>
        </div>
        <button
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60"
        >
          {expanded ? 'Masquer' : 'Comprendre en détail'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{description}</p>

          {formula && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
              <span className="text-[10px] text-slate-500 block uppercase font-sans mb-0.5">Formulation :</span>
              {formula}
            </div>
          )}

          {bullets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {bullets.map((b, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/70 text-xs space-y-1">
                  <strong className="text-cyan-400 font-semibold block">{b.title}</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
