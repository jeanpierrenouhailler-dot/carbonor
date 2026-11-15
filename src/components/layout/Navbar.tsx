import React, { useState, useRef, useEffect } from 'react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useDataMode } from '../../context/DataModeContext';
import { ViewKey } from './Sidebar';
import {
  Sparkles,
  GraduationCap,
  FileText,
  Menu,
  Cloud,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  expertMode: boolean;
  onToggleExpertMode: () => void;
  onOpenReport: () => void;
  onOpenCloudflareModal?: () => void;
  onToggleSidebar?: () => void;
  activeViewTitle?: string;
  currentView?: ViewKey;
  onSelectView?: (view: ViewKey) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  expertMode,
  onToggleExpertMode,
  onOpenReport,
  onOpenCloudflareModal,
  onToggleSidebar,
  currentView = 'landing',
  onSelectView
}) => {
  const { toggleDataMode, isRealData } = useDataMode();
  const [toolsOpen, setToolsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const primaryLinks: { id: ViewKey; label: string }[] = [
    { id: 'landing', label: 'Présentation' },
    { id: 'dashboard', label: 'Synthèse' },
    { id: 'map', label: 'Carte' },
    { id: 'spectroscopy-lab', label: 'Spectroscopie' },
    { id: 'sources', label: 'Sources' }
  ];

  const isLinkActive = (id: ViewKey) => {
    if (id === 'spectroscopy-lab') {
      return currentView.startsWith('spectroscopy');
    }
    if (id === 'sources') {
      return currentView === 'sources' || currentView === 'docs' || currentView === 'pipeline-audit';
    }
    return currentView === id;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-6 px-4 lg:px-6 max-w-[1600px] mx-auto">
        {/* Zone 1 : Identité sobre sur une seule ligne */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer transition-colors"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectView && onSelectView('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
            title="Revenir à l'accueil Carbonor"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/35 group-hover:border-cyan-400/60 transition-colors shrink-0">
              <span className="font-mono font-bold text-xs text-cyan-400 tracking-tighter">CO₂</span>
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
              Carbonor
            </span>
            <span className="hidden xl:inline text-xs text-slate-500 whitespace-nowrap shrink-0">
              · Observatoire CO₂
            </span>
          </button>
        </div>

        {/* Zone 2 : 5 liens directs épurés (typographie nette sans capsules) */}
        {onSelectView && (
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-6 text-sm font-medium"
          >
            {primaryLinks.map(link => {
              const active = isLinkActive(link.id);
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onSelectView(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-white ${
                    active
                      ? 'text-cyan-300'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3 : Contrôles compacts (Statut données uniquement dans l'app + Menu Outils + Action principale) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Statut Métrologique : affiché uniquement dans les vues applicatives */}
          {currentView !== 'landing' && (
            <button
              type="button"
              onClick={toggleDataMode}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isRealData
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/50 border-amber-500/35 text-amber-200 hover:bg-amber-900/50'
              }`}
              title={
                isRealData
                  ? 'Mode Données Réelles actif — Données officielles vérifiées. Cliquer pour basculer en Mode Démonstration.'
                  : 'Mode Démonstration actif — Fixtures scientifiques embarquées. Cliquer pour basculer en Mode Données Réelles.'
              }
            >
              <span
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRealData ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
              <span className="hidden sm:inline">{isRealData ? 'Données réelles' : 'Mode Démo'}</span>
              <span className="sm:hidden">{isRealData ? 'Réel' : 'Démo'}</span>
            </button>
          )}

          {/* Menu Outils (regroupe Mode Expert, Rapport, Cloudflare, PWA) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setToolsOpen(prev => !prev)}
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                toolsOpen
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Outils</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1"
              >
                {/* Niveau d'analyse (pertinent dans l'espace applicatif) */}
                {currentView !== 'landing' && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleExpertMode();
                      setToolsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {expertMode ? (
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <span>
                        <span className="block font-medium text-white">
                          {expertMode ? 'Mode Expert actif' : 'Mode Pédagogique actif'}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {expertMode ? 'Basculer vers la vue vulgarisée' : 'Afficher les équations détaillées'}
                        </span>
                      </span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${expertMode ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'}`}>
                      {expertMode ? 'EXPERT' : 'PÉDA'}
                    </span>
                  </button>
                )}

                {/* Rapport scientifique */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenReport();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <span className="block font-medium text-white">Rapport scientifique</span>
                    <span className="block text-[11px] text-slate-400">Export PDF, DOI &amp; traçabilité</span>
                  </span>
                </button>

                {/* Audit de provenance */}
                {onSelectView && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('pipeline-audit');
                      setToolsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <span className="block font-medium text-white">Audit des données réelles</span>
                      <span className="block text-[11px] text-slate-400">Mesuré ≠ Observé ≠ Estimé ≠ Modélisé</span>
                    </span>
                  </button>
                )}

                {/* Déploiement Cloudflare */}
                {onOpenCloudflareModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCloudflareModal();
                      setToolsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <Cloud className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>
                      <span className="block font-medium text-white">Déploiement Cloudflare</span>
                      <span className="block text-[11px] text-slate-400">Guide d&apos;hébergement Pages</span>
                    </span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-800" />

                {/* PWA Install */}
                <PWAInstallButton variant="menu-item" />
              </div>
            )}
          </div>

          {/* Action principale unique */}
          {onSelectView && currentView === 'landing' ? (
            <button
              type="button"
              onClick={() => onSelectView('dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="hidden sm:inline">Ouvrir l&apos;App</span>
              <span className="sm:hidden">App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Générer un rapport scientifique certifié"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rapport</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
