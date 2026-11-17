import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Monitor } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'menu-item';
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showBrowserGuide, setShowBrowserGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 4000);
    }
  };

  if (variant === 'menu-item') {
    if (isInstalled) {
      return (
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/20">
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Application installée</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Hors-ligne prêt</span>
        </div>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={isInstallable ? handleInstall : isIOS ? () => setShowIOSGuide(true) : () => setShowBrowserGuide(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            {isIOS ? (
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Download className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>
              <span className="block font-medium text-white">
                {isIOS ? "Installer l'application (iOS)" : "Installer l'application"}
              </span>
              <span className="block text-[11px] text-slate-400">
                Ajouter sur l&apos;écran d&apos;accueil ou le bureau
              </span>
            </span>
          </span>
        </button>

        {showIOSGuide && renderIOSModal(() => setShowIOSGuide(false))}
        {showBrowserGuide && renderBrowserModal(() => setShowBrowserGuide(false))}
        {installedNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-sm shadow-2xl flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Application installée avec succès !</span>
          </div>
        )}
      </>
    );
  }

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 whitespace-nowrap shrink-0">
        <Check className="w-3.5 h-3.5" />
        <span>Application installée</span>
      </span>
    );
  }

  if (isInstallable) {
    return (
      <>
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          title="Installer l'application sur votre mobile ou ordinateur"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className={compact ? 'hidden xl:inline' : ''}>Installer l&apos;application</span>
          {compact && <span className="xl:hidden">Installer</span>}
        </button>
        {installedNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-sm shadow-2xl flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Application installée avec succès !</span>
          </div>
        )}
      </>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Ajouter Carbonor à votre écran d'accueil iOS"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className={compact ? 'hidden xl:inline' : ''}>Installer l&apos;application</span>
          {compact && <span className="xl:hidden">Installer</span>}
        </button>
        {showIOSGuide && renderIOSModal(() => setShowIOSGuide(false))}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowBrowserGuide(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title="Installer Carbonor sur mobile ou ordinateur (PWA)"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className={compact ? 'hidden xl:inline' : ''}>Installer l&apos;application</span>
        {compact && <span className="xl:hidden">Installer</span>}
      </button>
      {showBrowserGuide && renderBrowserModal(() => setShowBrowserGuide(false))}
    </>
  );
};

function renderIOSModal(onClose: () => void) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Installer sur iPhone / iPad
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="w-6 h-6 rounded-full bg-cyan-900/60 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <p>Ouvrez cette page dans le navigateur <strong>Safari</strong>.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="w-6 h-6 rounded-full bg-cyan-900/60 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p>Touchez le bouton <strong>Partager</strong> dans la barre d&apos;outils Safari.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="w-6 h-6 rounded-full bg-cyan-900/60 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <p>Sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong>.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
        >
          Compris
        </button>
      </div>
    </div>
  );
}

function renderBrowserModal(onClose: () => void) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            Installer Carbonor (PWA)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <p>
            Carbonor est une Progressive Web App capable de mettre en cache les données scientifiques pour fonctionner hors connexion.
          </p>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 space-y-1.5">
            <p><strong>Chrome / Edge :</strong> cliquez sur l&apos;icône d&apos;installation dans la barre d&apos;adresse (à droite de l&apos;URL).</p>
            <p><strong>Safari (macOS / iOS) :</strong> menu Partager puis « Ajouter au Dock » ou « Sur l&apos;écran d&apos;accueil ».</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
