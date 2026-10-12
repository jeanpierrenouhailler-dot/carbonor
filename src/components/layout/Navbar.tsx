import React from 'react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useDataMode } from '../../context/DataModeContext';
import { 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Menu,
  Activity,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  expertMode: boolean;
  onToggleExpertMode: () => void;
  onOpenReport: () => void;
  onOpenCloudflareModal?: () => void;
  onToggleSidebar?: () => void;
  activeViewTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  expertMode,
  onToggleExpertMode,
  onOpenReport,
  onOpenCloudflareModal,
  onToggleSidebar,
  activeViewTitle = 'Tableau de bord'
}) => {
  const { dataMode, toggleDataMode, isRealData, modeLabel, modeDescription } = useDataMode();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg shadow-cyan-950/50">
              <span className="font-mono font-black text-sm text-cyan-400 tracking-tighter">CO₂</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                  CO₂ Atmosphère &amp; Cycle du Carbone
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  PWA v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Physique Moléculaire · Mesures au Sol · Satellites OCO · Profils · CAMS
              </p>
            </div>
          </div>
        </div>

        {/* Center: Scientific Distinction Principle Banner */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-emerald-400">MESURÉ</span>
          <span className="text-slate-600">≠</span>
          <span className="font-semibold text-cyan-400">OBSERVÉ</span>
          <span className="text-slate-600">≠</span>
          <span className="font-semibold text-amber-400">ESTIMÉ</span>
          <span className="text-slate-600">≠</span>
          <span className="font-semibold text-purple-400">MODÉLISÉ</span>
          <span className="text-slate-600">≠</span>
          <span className="font-semibold text-rose-400">SIMULÉ</span>
        </div>

        {/* Right: Actions, Data Mode, Expert Mode, Report & PWA */}
        <div className="flex items-center gap-2.5">
          {/* Statut Métrologique : Mode Démonstration vs Mode Données Réelles */}
          <button
            onClick={toggleDataMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
              isRealData
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-900/30 hover:bg-emerald-900'
                : 'bg-amber-950/90 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-900/30 hover:bg-amber-900'
            }`}
            title={
              isRealData
                ? "🟢 MODE DONNÉES RÉELLES ACTIF — Données officielles téléchargées et vérifiées. Cliquez pour passer en Mode Démonstration."
                : "🟡 MODE DÉMONSTRATION ACTIF — Données d'exemple et fixtures scientifiques embarquées. Cliquez pour basculer en Mode Données Réelles."
            }
          >
            <span className="text-xs">{isRealData ? '🟢' : '🟡'}</span>
            <span className="hidden sm:inline">{isRealData ? 'DONNÉES RÉELLES' : 'DÉMONSTRATION'}</span>
            <span className="sm:hidden">{isRealData ? 'RÉEL' : 'DÉMO'}</span>
          </button>

          {/* Expert / Pedagogic Mode Switch */}
          <button
            onClick={onToggleExpertMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              expertMode
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-900/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={expertMode ? "Mode Expert actif : équations de transfert radiatif complètes, états quantiques J, paramètres spectroscopiques détaillés" : "Mode Pédagogique : visualisations vulgarisées et concepts fondamentaux"}
          >
            {expertMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Mode</span> Expert
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Mode</span> Pédagogique
              </>
            )}
          </button>

          {/* Cloudflare Deploy Guide Button */}
          {onOpenCloudflareModal && (
            <button
              onClick={onOpenCloudflareModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 text-xs font-medium transition-colors cursor-pointer"
              title="Guide & Paramètres pour déployer sur Cloudflare Pages"
            >
              <Cloud className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden lg:inline">Déploiement</span> Cloudflare
            </button>
          )}

          {/* Scientific Report Generator */}
          <button
            onClick={onOpenReport}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            title="Générer un rapport scientifique certifié avec DOI et formules"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rapport</span>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
