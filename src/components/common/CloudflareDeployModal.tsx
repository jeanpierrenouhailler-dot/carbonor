import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal, 
  FileCode, 
  ShieldCheck, 
  Layers, 
  Zap,
  Globe2
} from 'lucide-react';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-orange-500/40 p-6 shadow-2xl shadow-orange-950/40 text-slate-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Déploiement Cloudflare Pages</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-500/30">
                  Prêt pour production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guide pas-à-pas pour héberger Carbonor sur le réseau mondial haute performance de Cloudflare.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Configuration Cloudflare intégrée avec succès
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li><strong className="text-white">Règles de redirection SPA</strong> générées dans <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">public/_redirects</code> (<code className="text-amber-300">/* /index.html 200</code>).</li>
            <li><strong className="text-white">En-têtes de sécurité &amp; Service Worker</strong> configurés dans <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">public/_headers</code>.</li>
            <li><strong className="text-white">PWA &amp; Cache offline</strong> prévus avec Workbox pour fonctionner même sans connexion.</li>
          </ul>
        </div>

        {/* Step by Step Guide */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-orange-400" />
            Méthode 1 : Déploiement Direct via le Dashboard Cloudflare (Recommandé)
          </h4>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-950 text-orange-400 flex items-center justify-center text-[11px] font-mono border border-orange-500/30">1</span>
                  Connecter le dépôt Git sur Cloudflare
                </span>
                <a 
                  href="https://dash.cloudflare.com/?to=/:account/pages" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-orange-400 hover:underline"
                >
                  Dashboard Cloudflare Pages <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Allez dans <strong>Workers &amp; Pages</strong> &gt; <strong>Create application</strong> &gt; <strong>Pages</strong> &gt; <strong>Connect to Git</strong> et sélectionnez votre dépôt.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-orange-950 text-orange-400 flex items-center justify-center text-[11px] font-mono border border-orange-500/30">2</span>
                Paramètres de Build (Build Configuration)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Framework preset :</span>
                  <span className="text-cyan-300">Vite</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Build command :</span>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300">npm run build</span>
                    <button 
                      onClick={() => copyToClipboard('npm run build', 'cmd')}
                      className="text-slate-400 hover:text-white"
                      title="Copier"
                    >
                      {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Build output directory :</span>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300">dist</span>
                    <button 
                      onClick={() => copyToClipboard('dist', 'dist')}
                      className="text-slate-400 hover:text-white"
                      title="Copier"
                    >
                      {copiedKey === 'dist' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Variable d'environnement :</span>
                  <span className="text-purple-300">NODE_VERSION = 20</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-orange-950 text-orange-400 flex items-center justify-center text-[11px] font-mono border border-orange-500/30">3</span>
                Déploiement CLI avec Wrangler (Option alternative)
              </span>
              <p className="text-xs text-slate-400">
                Si vous préférez déployer depuis votre terminal local :
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
                <code>npx wrangler pages deploy dist --project-name carbonor</code>
                <button 
                  onClick={() => copyToClipboard('npx wrangler pages deploy dist --project-name carbonor', 'wrangler')}
                  className="text-slate-400 hover:text-white ml-2"
                >
                  {copiedKey === 'wrangler' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">CDN 300+ Villes</strong>
              <span className="text-slate-400 text-[11px]">Temps de réponse &lt; 20 ms partout dans le monde.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">HTTPS &amp; DDoS Gratuit</strong>
              <span className="text-slate-400 text-[11px]">Certificat SSL/TLS automatique et protection native.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Domaine Personnalisé</strong>
              <span className="text-slate-400 text-[11px]">Raccordement CNAME en 1 clic sur votre domaine.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Compris, fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
