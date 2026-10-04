import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
        <Check className="w-3.5 h-3.5" />
        PWA Active
      </span>
    );
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 4000);
    }
  };

  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30 transition-colors cursor-pointer"
          title="Installer l'application sur cet appareil pour un accès hors-ligne complet"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer PWA</span>
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
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  Installer sur iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                  <p>Touchez le bouton <strong>Partager</strong> <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-xs text-cyan-400 font-mono">⎋</span> dans la barre d'outils Safari.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="w-6 h-6 rounded-full bg-cyan-900/60 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => alert("Pour installer cette PWA, utilisez le menu de votre navigateur (Chrome/Edge : bouton Installer dans la barre d'adresse ; Safari : Ajouter à l'écran d'accueil).")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700/60 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
      title="Application compatible PWA"
    >
      <Download className="w-3.5 h-3.5 text-cyan-400" />
      <span>PWA</span>
    </button>
  );
};
