import React from 'react';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  HardDrive, 
  Radio, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers
} from 'lucide-react';
import { DetailedProviderStatus, ProviderConnectionStatus } from '../../types/observation';

interface ProviderStatusModalProps {
  provider: DetailedProviderStatus | null;
  onClose: () => void;
  onProbeLive?: (providerId: string) => void;
  isProbing?: boolean;
}

export const ProviderStatusModal: React.FC<ProviderStatusModalProps> = ({
  provider,
  onClose,
  onProbeLive,
  isProbing = false
}) => {
  if (!provider) return null;

  const getStatusBadge = (status: ProviderConnectionStatus) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            CONNECTED — Serveur distant joignable
          </span>
        );
      case 'FETCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            FETCHED — Données fraîches téléchargées
          </span>
        );
      case 'CACHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            CACHED — Cache disque certifié local
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            STALE — Cache à actualiser (&gt; 30 jours)
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            OFFLINE — Mode secours hors-ligne
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            NOT_CONFIGURED — Clé d'API requise non définie
          </span>
        );
      case 'ERROR':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            ERROR — Échec d'interrogation
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 overflow-hidden space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Audit de Connectivité &amp; Origine des Données
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                {provider.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{provider.name}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Badge & Explanation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>{getStatusBadge(provider.status)}</div>
            {onProbeLive && (
              <button
                onClick={() => onProbeLive(provider.id)}
                disabled={isProbing}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Radio className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                <span>{isProbing ? 'Test en cours...' : 'Tester le serveur distant (Ping)'}</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            {provider.statusExplanation}
          </p>
        </div>

        {/* Volume de données & Décomposition réelle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-slate-400 text-[11px] mb-1">Enregistrements Totaux</div>
            <div className="text-xl font-bold text-white">
              {provider.recordsCount.toLocaleString('fr-FR')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Points disponibles</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-slate-400 text-[11px] mb-1">Cache Disque Vérifié</div>
            <div className="text-xl font-bold text-cyan-400">
              {provider.breakdown.cachedRecords.toLocaleString('fr-FR')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stockés en local</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-slate-400 text-[11px] mb-1">Téléchargés en direct</div>
            <div className="text-xl font-bold text-emerald-400">
              {provider.breakdown.liveRecords.toLocaleString('fr-FR')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cette session active</div>
          </div>
        </div>

        {/* Technical Details: Cache Disque & Upstream */}
        <div className="space-y-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Détails du Cache Disque Local</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>Répertoire : <strong className="text-slate-200">{provider.cacheInfo.directory}</strong></div>
              <div>Fichiers bruts : <strong className="text-slate-200">{provider.cacheInfo.filesCount} fichier(s)</strong></div>
              <div>Taille sur disque : <strong className="text-slate-200">{(provider.cacheInfo.totalSizeBytes / 1024).toFixed(1)} Ko</strong></div>
              <div>Âge du cache : <strong className="text-slate-200">{provider.cacheInfo.ageDays !== null ? `${provider.cacheInfo.ageDays} jour(s)` : 'N/A'}</strong></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Point de Terminaison Amont &amp; Authentification</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
              <div className="truncate">URL : <span className="text-cyan-400">{provider.upstreamInfo.endpoint}</span></div>
              <div>Protocole : <strong className="text-slate-200">{provider.upstreamInfo.protocol}</strong></div>
              <div className="flex items-center gap-2">
                <span>Authentification requise :</span>
                {provider.upstreamInfo.requiresAuth ? (
                  provider.upstreamInfo.authConfigured ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Clé active ({provider.upstreamInfo.authEnvVar})
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Clé absente ({provider.upstreamInfo.authEnvVar})
                    </span>
                  )
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Données ouvertes publiques (Aucune clé requise)
                  </span>
                )}
              </div>
              {provider.upstreamInfo.latencyMs !== undefined && (
                <div>Dernière latence mesurée : <strong className="text-white">{provider.upstreamInfo.latencyMs} ms</strong></div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="truncate text-[11px]">
            Licence : <span className="text-slate-300 font-mono">{provider.license}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Portail officiel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
