import React from 'react';
import { DataProvenance, ScientificDataCategory } from '../../types/observation';
import { X, ExternalLink, ShieldCheck, FileText, CheckCircle2, Bookmark } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

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
  if (!provenance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ProvenanceBadge category={category} />
              <span className="text-xs text-slate-400 font-mono">Traçabilité Scientifique</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              {provenance.source}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Jeu de Données (Dataset)
            </label>
            <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium">
              {provenance.dataset} {provenance.version && <span className="text-cyan-400 text-xs">({provenance.version})</span>}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Méthodologie &amp; Métrologie
            </label>
            <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed text-xs">
              {provenance.method}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Licence &amp; Réutilisation
              </label>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{provenance.license}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Identifiant Persistant (DOI)
              </label>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs truncate">
                {provenance.doi ? `doi:${provenance.doi}` : 'Non assigné'}
              </div>
            </div>
          </div>

          {provenance.citation && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                Citation Académique Officielle
              </label>
              <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs italic leading-relaxed">
                "{provenance.citation}"
              </p>
            </div>
          )}

          {provenance.url && (
            <div className="pt-2">
              <a
                href={provenance.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors"
              >
                <span>Consulter la source officielle sur le portail scientifique</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
