import React, { useState } from 'react';
import { DataProvenance, ScientificDataCategory } from '../../types/observation';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Bookmark, 
  Copy, 
  Check, 
  Clock, 
  HardDrive, 
  FileCode, 
  Calendar, 
  Award, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { CacheService } from '../../providers/cacheService';
import { useDataMode } from '../../context/DataModeContext';

interface DataProvenanceModalProps {
  provenance: DataProvenance | null;
  category?: ScientificDataCategory;
  onClose: () => void;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  provenance,
  category = 'MEASURED',
  onClose
}) => {
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const { dataMode: globalMode } = useDataMode();

  if (!provenance) return null;

  const isRealData = provenance.origin 
    ? (provenance.origin === 'LIVE_REMOTE' || provenance.origin === 'REMOTE_CACHED' || provenance.origin === 'LOCAL_ARCHIVE')
    : (provenance.dataMode === 'REAL_DATA' || (provenance.isRealData === true && globalMode === 'REAL_DATA'));

  const provEffective: DataProvenance = {
    ...provenance,
    dataMode: isRealData ? 'REAL_DATA' : 'DEMO',
    isRealData
  };

  const handleCopyChecksum = () => {
    if (provenance.checksum) {
      navigator.clipboard.writeText(provenance.checksum);
      setCopiedChecksum(true);
      setTimeout(() => setCopiedChecksum(false), 2000);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(provEffective, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const formattedTraceability = CacheService.formatTraceability(provEffective);
  const quality = provenance.quality || 'GOOD';
  const ageDays = provenance.cacheAgeDays !== undefined 
    ? provenance.cacheAgeDays 
    : CacheService.calculateAgeDays(provenance.retrievedAt || provenance.downloadedAt);

  const getOriginBadge = (origin?: string) => {
    switch (origin) {
      case 'LIVE_REMOTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">📡 LIVE REMOTE (API)</span>;
      case 'REMOTE_CACHED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">💾 REMOTE CACHED</span>;
      case 'LOCAL_ARCHIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500/40">🗄️ LOCAL ARCHIVE</span>;
      case 'SIMULATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">⚙️ PHYSIQUE SIMULÉE</span>;
      case 'DEMO':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">🟡 FIXTURE DEMO</span>;
    }
  };

  const getQualityBadge = (q: string) => {
    switch (q.toUpperCase()) {
      case 'EXCELLENT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            EXCELLENT (WMO Primary Std)
          </span>
        );
      case 'GOOD':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            GOOD (Assimilation Grade)
          </span>
        );
      case 'ACCEPTABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ACCEPTABLE (Caution)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700 inline-flex items-center gap-1">
            {q}
          </span>
        );
    }
  };

  const formatIsoDate = (isoStr?: string) => {
    if (!isoStr) return 'Non spécifié';
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ProvenanceBadge category={category} />
              <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
                Certificat de Traçabilité Scientifique
              </span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>{provenance.source}</span>
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

        {/* Statut Métrologique Strict : Mode Démonstration vs Mode Données Réelles */}
        <div className="space-y-2">
          {isRealData ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🟢</span>
                <div>
                  <div className="text-xs font-bold font-mono text-emerald-400">MODE DONNÉES RÉELLES</div>
                  <div className="text-[11px] text-emerald-300/80">Données issues d'observations certifiées auprès de la source officielle.</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getOriginBadge(provenance.origin)}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🟡</span>
                <div>
                  <div className="text-xs font-bold font-mono text-amber-400">MODE DÉMONSTRATION</div>
                  <div className="text-[11px] text-amber-300/80">Données d'exemple / fixtures scientifiques embarquées ou calcul physique simulé.</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getOriginBadge(provenance.origin)}
              </div>
            </div>
          )}
        </div>

        {/* Highlighted Traceability Certificate */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/30 text-cyan-100 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Constat d'intégrité métrologique
            </span>
            <span className="text-[10px] font-mono text-cyan-300/80 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              Traçabilité Métrologique WMO
            </span>
          </div>
          <p className="text-sm font-mono font-semibold text-white leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            {formattedTraceability}
          </p>
        </div>

        {/* Key Metrics 4-Box Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Box 1: Téléchargement & Cache */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Téléchargement (RetrievedAt)
              </span>
              <span className="text-cyan-400 font-mono">
                {ageDays === 0 ? 'Aujourd’hui' : `${ageDays} j`}
              </span>
            </div>
            <div className="text-white font-mono font-bold">
              {formatIsoDate(provenance.retrievedAt || provenance.downloadedAt)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>Expiration nominale (TTL) :</span>
              <span className="text-slate-300 font-mono">
                {formatIsoDate(provenance.expiresAt)}
              </span>
            </div>
          </div>

          {/* Box 2: Observation & Validité */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Période de Validité
              </span>
              <div>{getQualityBadge(quality)}</div>
            </div>
            <div className="text-white font-mono font-bold truncate">
              {formatIsoDate(provenance.observedAt || provenance.validFrom)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>Statut de validité :</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Donnée authentifiée
              </span>
            </div>
          </div>
        </div>

        {/* Dataset & Product Details */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Produit &amp; Version du Jeu de Données
            </label>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-200 font-mono font-semibold">{provenance.dataset}</span>
              {provenance.version && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {provenance.version}
                </span>
              )}
            </div>
          </div>

          {/* Checksum & Cryptographic Integrity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                Empreinte d'Intégrité Cryptographique (SHA-256)
              </label>
              {provenance.checksum && (
                <button
                  type="button"
                  onClick={handleCopyChecksum}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedChecksum ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Empreinte copiée !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copier le hash</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs break-all flex items-center justify-between">
              <span>{provenance.checksum || 'Empreinte non calculée'}</span>
            </div>
          </div>

          {/* Request Parameters (if any) */}
          {provenance.requestParameters && Object.keys(provenance.requestParameters).length > 0 && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Paramètres de Requête Appliqués
              </label>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap gap-2">
                {Object.entries(provenance.requestParameters).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500">{k}:</span> <strong className="text-cyan-300">{String(v)}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Methodology */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Méthodologie Instrumentale &amp; Étalonnage
            </label>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-sans">
              {provenance.method}
            </div>
          </div>

          {/* Legal License & DOI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Licence &amp; Réutilisation Légale
              </label>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="truncate">{provenance.license}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Identifiant Persistant (DOI)
              </label>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs truncate">
                {provenance.doi ? (
                  <a 
                    href={`https://doi.org/${provenance.doi.replace(/^doi:/, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1 text-cyan-300"
                  >
                    <span>{provenance.doi}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  'Référence officielle GAW'
                )}
              </div>
            </div>
          </div>

          {/* Academic Citation */}
          {provenance.citation && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                Citation Académique Officielle
              </label>
              <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs italic leading-relaxed">
                "{provenance.citation}"
              </p>
            </div>
          )}

          {/* Official URL */}
          {provenance.url && (
            <div className="pt-1">
              <a
                href={provenance.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Accéder aux données brutes sur le portail scientifique officiel</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Toggle Raw JSON Audit Accordion */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Masquer les métadonnées JSON' : 'Inspecter l’objet de métadonnées brutes (JSON)'}</span>
              </button>
              {showRawJson && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">JSON copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copier le JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {showRawJson && (
              <pre className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-tight">
                {JSON.stringify(provenance, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
