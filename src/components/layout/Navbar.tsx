import React, { useState, useRef, useEffect } from 'react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useDataMode } from '../../context/DataModeContext';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { BrandLogo } from '../common/BrandLogo';
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
  ShieldCheck,
  Settings,
  Sun,
  Moon,
  Compass,
  Scale,
} from 'lucide-react';

interface NavbarProps {
  expertMode: boolean;
  onToggleExpertMode: () => void;
  onOpenReport: () => void;
  onOpenCloudflareModal?: () => void;
  onOpenSettings?: () => void;
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
  onOpenSettings,
  onToggleSidebar,
  currentView = 'landing',
  onSelectView,
}) => {
  const { toggleDataMode, isRealData } = useDataMode();
  const { theme, toggleTheme } = useTheme();
  const { restoreAllGuides, openLegalModal } = useOnboarding();
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
    { id: 'sources', label: 'Sources' },
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
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6 max-w-[1600px] mx-auto">
        {/* Zone 1 : Identité visuelle avec Logo dédié */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              data-demo-id="menu-mobile"
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
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg pr-1"
            title="Revenir à l'accueil Carbonor"
          >
            <BrandLogo size="sm" />
            <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
              Carbonor
            </span>
            <span className="hidden 2xl:inline text-xs text-slate-500 whitespace-nowrap shrink-0">
              · Observatoire CO₂
            </span>
          </button>
        </div>

        {/* Zone 2 : 5 liens directs épurés */}
        {onSelectView && (
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-5 text-sm font-medium"
          >
            {primaryLinks.map((link) => {
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

        {/* Zone 3 : Contrôles compacts sans surcharge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Statut Métrologique : affiché uniquement dans les vues applicatives */}
          {currentView !== 'landing' && (
            <button
              type="button"
              data-demo-id="toggle-data-mode"
              onClick={toggleDataMode}
              className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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

          {/* Bouton rapide Installer l'application (desktop & mobile) */}
          <div className="hidden md:block shrink-0">
            <PWAInstallButton variant="button" compact />
          </div>

          {/* Bascule Thème Clair / Sombre */}
          <button
            type="button"
            data-demo-id="toggle-theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Passer au thème Clair' : 'Passer au thème Sombre'}
            title={theme === 'dark' ? 'Passer au thème Clair' : 'Passer au thème Sombre'}
            className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Bouton Paramètres Système */}
          {onOpenSettings && (
            <button
              type="button"
              data-demo-id="btn-system-settings"
              onClick={onOpenSettings}
              aria-label="Ouvrir les paramètres système"
              title="Paramètres Système, Mises à jour & Thème"
              className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Menu Outils (regroupe Mode Expert, Guides, Légal, Rapport, Cloudflare, PWA) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setToolsOpen((prev) => !prev)}
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                toolsOpen
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Outils</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  toolsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {toolsOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1"
              >
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setToolsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      <span className="block font-medium text-white">Paramètres système</span>
                      <span className="block text-[11px] text-slate-400">
                        Mises à jour automatiques, version &amp; thème
                      </span>
                    </span>
                  </button>
                )}

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
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        expertMode
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {expertMode ? 'EXPERT' : 'PÉDA'}
                    </span>
                  </button>
                )}

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

                <button
                  type="button"
                  onClick={() => {
                    restoreAllGuides();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <span className="block font-medium text-white">Réafficher les guides novices</span>
                    <span className="block text-[11px] text-slate-400">Rétablir l&apos;aide contextuelle partout</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openLegalModal();
                    setToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <span className="block font-medium text-white">Mentions légales</span>
                    <span className="block text-[11px] text-slate-400">Clause de non-responsabilité</span>
                  </span>
                </button>

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

                <PWAInstallButton variant="menu-item" />
              </div>
            )}
          </div>

          {/* Action principale unique */}
          {onSelectView && currentView === 'landing' ? (
            <button
              type="button"
              onClick={() => onSelectView('dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="hidden sm:inline">Ouvrir l&apos;App</span>
              <span className="sm:hidden">App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenReport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
