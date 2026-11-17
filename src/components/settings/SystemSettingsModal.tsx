import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DownloadCloud,
  HelpCircle,
  Loader2,
  Moon,
  RefreshCw,
  Scale,
  Settings,
  ShieldAlert,
  Sun,
  X,
} from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { BrandLogo } from '../common/BrandLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatFrenchDateTime(iso: string | null): string {
  if (!iso) return 'Jamais vérifiée';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Inconnue';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(d);
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    version,
    releaseDate,
    releaseDateLabel,
    lastCheckDate,
    lastAutoUpdateDate,
    autoUpdateEnabled,
    updateStatus,
    statusMessage,
    swActive,
    setAutoUpdateEnabled,
    checkForUpdates,
    forceUpdate,
  } = useSystemSettings();

  const { theme, setTheme } = useTheme();
  const {
    noviceTipsEnabled,
    setNoviceTipsEnabled,
    restoreAllGuides,
    openLegalModal,
    legalAcceptedAt,
  } = useOnboarding();

  if (!isOpen) return null;

  const isChecking = updateStatus === 'checking';
  const isInstalling = updateStatus === 'installing' || updateStatus === 'reloading';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-settings-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <h2
                id="system-settings-title"
                className="text-lg font-bold text-white flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Paramètres Système &amp; Mises à jour</span>
              </h2>
              <p className="text-xs text-slate-400">
                Gestion des versions, mises à jour automatiques PWA, thème et aide utilisateur
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les paramètres système"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bloc 1 : Version, Date de sortie & Dernière vérification */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Informations de version &amp; cycle de vie
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              Carbonor v{version}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Date de sortie
              </span>
              <strong className="block text-sm text-white font-mono">
                {releaseDateLabel} ({releaseDate})
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Dernière vérification
              </span>
              <strong className="block text-sm text-white font-mono">
                {formatFrenchDateTime(lastCheckDate)}
              </strong>
            </div>
          </div>

          {/* Mises à jour automatiques en arrière-plan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <DownloadCloud className="w-4 h-4 text-emerald-400" />
                <span>Mises à jour automatiques en arrière-plan</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vérifie régulièrement la disponibilité de nouvelles versions (toutes les 15 min) et les installe automatiquement via Service Worker{swActive ? ' (actif)' : ''}.
              </p>
              {lastAutoUpdateDate && (
                <p className="text-[11px] font-mono text-emerald-400">
                  Dernière installation automatique : {formatFrenchDateTime(lastAutoUpdateDate)}
                </p>
              )}
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={autoUpdateEnabled}
              onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                autoUpdateEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              aria-label="Activer ou désactiver les mises à jour automatiques en arrière-plan"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  autoUpdateEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Statut actuel + Boutons d'action */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200">
            {isChecking || isInstalling ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isChecking || isInstalling}
              onClick={() => void checkForUpdates({ silent: false })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Vérifier les mises à jour</span>
            </button>

            <button
              type="button"
              disabled={isInstalling}
              onClick={() => void forceUpdate()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Purge le cache local et télécharge la dernière version immédiatement"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
              <span>Forcer la mise à jour</span>
            </button>
          </div>
        </div>

        {/* Bloc 2 : Thème Clair / Sombre */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
            Apparence de l&apos;interface
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Thème Sombre</span>
                <span className="block text-xs text-slate-400">Observatoire de nuit (par défaut)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Thème Clair</span>
                <span className="block text-xs text-slate-400">Revue scientifique de jour</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bloc 3 : Installation PWA, Onboarding Novice & Mentions Légales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Installation Desktop &amp; Mobile
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ajoutez Carbonor sur votre écran d&apos;accueil ou votre bureau pour y accéder en un clic et hors connexion.
            </p>
            <PWAInstallButton variant="button" />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Aide Novice &amp; Mentions Légales
            </span>

            <label className="flex items-center justify-between gap-2 text-xs text-slate-200 cursor-pointer">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Afficher l&apos;onboarding contextuel</span>
              </span>
              <input
                type="checkbox"
                checked={noviceTipsEnabled}
                onChange={(e) => setNoviceTipsEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={restoreAllGuides}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                Réafficher tous les guides
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openLegalModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-xs text-amber-300 transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Mentions légales</span>
              </button>
            </div>

            {legalAcceptedAt && (
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-400" />
                Acceptées le {formatFrenchDateTime(legalAcceptedAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
