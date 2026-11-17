import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { APP_META } from '../config/appMeta';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'update-available'
  | 'installing'
  | 'reloading'
  | 'error';

interface SystemSettingsContextValue {
  version: string;
  releaseDate: string;
  releaseDateLabel: string;
  lastCheckDate: string | null;
  lastAutoUpdateDate: string | null;
  autoUpdateEnabled: boolean;
  updateStatus: UpdateStatus;
  statusMessage: string;
  remoteVersion: string | null;
  swActive: boolean;
  backgroundToast: string | null;
  setAutoUpdateEnabled: (enabled: boolean) => void;
  checkForUpdates: (options?: { silent?: boolean }) => Promise<void>;
  forceUpdate: () => Promise<void>;
  dismissBackgroundToast: () => void;
}

const LAST_CHECK_KEY = 'carbonor_last_update_check';
const LAST_AUTO_UPDATE_KEY = 'carbonor_last_auto_update';
const AUTO_UPDATE_KEY = 'carbonor_auto_update_enabled';

const SystemSettingsContext = createContext<SystemSettingsContextValue | undefined>(undefined);

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(() =>
    readStorage(LAST_CHECK_KEY)
  );
  const [lastAutoUpdateDate, setLastAutoUpdateDate] = useState<string | null>(() =>
    readStorage(LAST_AUTO_UPDATE_KEY)
  );
  const [autoUpdateEnabled, setAutoUpdateState] = useState<boolean>(() => {
    const raw = readStorage(AUTO_UPDATE_KEY);
    return raw !== 'false';
  });
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Système prêt — vérification automatique active.'
  );
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [swActive, setSwActive] = useState<boolean>(false);
  const [backgroundToast, setBackgroundToast] = useState<string | null>(null);

  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const autoUpdateRef = useRef<boolean>(autoUpdateEnabled);
  autoUpdateRef.current = autoUpdateEnabled;

  const setAutoUpdateEnabled = useCallback((enabled: boolean) => {
    setAutoUpdateState(enabled);
    writeStorage(AUTO_UPDATE_KEY, String(enabled));
    setStatusMessage(
      enabled
        ? 'Mises à jour automatiques activées en arrière-plan.'
        : 'Mises à jour automatiques en pause (vérification manuelle requise).'
    );
  }, []);

  const performBackgroundInstall = useCallback(async (reason: string) => {
    const now = new Date().toISOString();
    setUpdateStatus('installing');
    setStatusMessage(`Installation automatique en arrière-plan (${reason})...`);
    setLastAutoUpdateDate(now);
    writeStorage(LAST_AUTO_UPDATE_KEY, now);
    setBackgroundToast(
      'Nouvelle version de Carbonor détectée et installée automatiquement en arrière-plan.'
    );

    try {
      if (updateSWRef.current) {
        await updateSWRef.current(true);
      } else if (swRegistrationRef.current?.waiting) {
        swRegistrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch {
      // Si aucun SW en attente, rester fonctionnel sans erreur bloquante
    }
  }, []);

  const checkForUpdates = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      const now = new Date().toISOString();
      if (!silent) {
        setUpdateStatus('checking');
        setStatusMessage('Vérification des mises à jour en cours...');
      }

      try {
        let foundUpdate = false;
        let detectedRemoteVersion: string = APP_META.version;

        // 1. Vérifier le manifeste de version serveur (/api/system/version puis /version.json)
        for (const endpoint of ['/api/system/version', '/version.json']) {
          try {
            const res = await fetch(`${endpoint}?_t=${Date.now()}`, { cache: 'no-store' });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
              const payload = await res.json();
              if (payload?.version) {
                detectedRemoteVersion = String(payload.version);
                setRemoteVersion(detectedRemoteVersion);
                if (detectedRemoteVersion !== APP_META.version) {
                  foundUpdate = true;
                }
                break;
              }
            }
          } catch {
            // Essayer le fallback statique
          }
        }

        // 2. Vérifier le Service Worker s'il est enregistré
        const reg =
          swRegistrationRef.current ||
          (typeof navigator !== 'undefined' && 'serviceWorker' in navigator
            ? await navigator.serviceWorker.getRegistration().catch(() => undefined)
            : undefined);

        if (reg) {
          swRegistrationRef.current = reg;
          setSwActive(true);
          try {
            await reg.update();
            if (reg.waiting || reg.installing) {
              foundUpdate = true;
            }
          } catch {
            // Hors-ligne ou dev sans SW bloquant
          }
        }

        setLastCheckDate(now);
        writeStorage(LAST_CHECK_KEY, now);

        if (foundUpdate) {
          if (autoUpdateRef.current) {
            await performBackgroundInstall(`v${detectedRemoteVersion}`);
          } else {
            setUpdateStatus('update-available');
            setStatusMessage(
              `Nouvelle version (v${detectedRemoteVersion}) disponible. Cliquez sur « Forcer la mise à jour » pour l'appliquer.`
            );
          }
        } else {
          setUpdateStatus('up-to-date');
          setStatusMessage(
            `Votre application Carbonor (v${APP_META.version}) est à jour.`
          );
        }
      } catch {
        setLastCheckDate(now);
        writeStorage(LAST_CHECK_KEY, now);
        setUpdateStatus('error');
        setStatusMessage(
          'Impossible de joindre le serveur de version pour le moment (mode local conservé).'
        );
      }
    },
    [performBackgroundInstall]
  );

  const forceUpdate = useCallback(async () => {
    const now = new Date().toISOString();
    setLastCheckDate(now);
    writeStorage(LAST_CHECK_KEY, now);
    setUpdateStatus('installing');
    setStatusMessage('Nettoyage du cache et téléchargement forcé de la dernière version...');

    try {
      // Purger les caches navigateur/Workbox si disponibles
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      }

      if (updateSWRef.current) {
        await updateSWRef.current(true);
      }

      if (swRegistrationRef.current) {
        await swRegistrationRef.current.update();
        if (swRegistrationRef.current.waiting) {
          swRegistrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      setLastAutoUpdateDate(now);
      writeStorage(LAST_AUTO_UPDATE_KEY, now);
      setUpdateStatus('reloading');
      setStatusMessage('Mise à jour appliquée — rechargement de Carbonor...');

      setTimeout(() => {
        window.location.reload();
      }, 650);
    } catch {
      setUpdateStatus('reloading');
      setTimeout(() => {
        window.location.reload();
      }, 450);
    }
  }, []);

  // Enregistrement PWA + vérification automatique en arrière-plan
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          if (autoUpdateRef.current) {
            void performBackgroundInstall('Service Worker');
          } else {
            setUpdateStatus('update-available');
            setStatusMessage(
              'Une nouvelle version est prête. Cliquez sur « Forcer la mise à jour ».'
            );
          }
        },
        onOfflineReady() {
          setSwActive(true);
        },
        onRegisteredSW(_swUrl, registration) {
          if (registration) {
            swRegistrationRef.current = registration;
            setSwActive(true);
          }
        },
      });
      updateSWRef.current = updateSW;
    } catch {
      // En environnement de test ou navigateur sans SW
    }

    // Première vérification silencieuse peu après le démarrage
    const initialTimer = window.setTimeout(() => {
      if (autoUpdateRef.current) {
        void checkForUpdates({ silent: true });
      }
    }, 6000);

    // Vérification périodique régulière en arrière-plan
    const intervalId = window.setInterval(() => {
      if (autoUpdateRef.current) {
        void checkForUpdates({ silent: true });
      }
    }, APP_META.autoCheckIntervalMs);

    // Vérification quand l'utilisateur revient sur l'application
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && autoUpdateRef.current) {
        const last = readStorage(LAST_CHECK_KEY);
        const elapsed = last ? Date.now() - new Date(last).getTime() : Infinity;
        if (elapsed >= APP_META.minFocusRecheckMs) {
          void checkForUpdates({ silent: true });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [checkForUpdates, performBackgroundInstall]);

  return (
    <SystemSettingsContext.Provider
      value={{
        version: APP_META.version,
        releaseDate: APP_META.releaseDate,
        releaseDateLabel: APP_META.releaseDateLabel,
        lastCheckDate,
        lastAutoUpdateDate,
        autoUpdateEnabled,
        updateStatus,
        statusMessage,
        remoteVersion,
        swActive,
        backgroundToast,
        setAutoUpdateEnabled,
        checkForUpdates,
        forceUpdate,
        dismissBackgroundToast: () => setBackgroundToast(null),
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export function useSystemSettings(): SystemSettingsContextValue {
  const ctx = useContext(SystemSettingsContext);
  if (!ctx) {
    throw new Error(
      'useSystemSettings doit être utilisé à l’intérieur de SystemSettingsProvider.'
    );
  }
  return ctx;
}
