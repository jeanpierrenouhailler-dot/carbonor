import React, { useState } from 'react';
import { CheckCircle2, Compass, HelpCircle, Scale, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../common/BrandLogo';
import { APP_META } from '../../config/appMeta';

export const LegalOnboardingModal: React.FC = () => {
  const { showLegalModal, legalAccepted, acceptLegalNotice, closeLegalModal } = useOnboarding();
  const { theme, setTheme } = useTheme();
  const [checkedDisclaimer, setCheckedDisclaimer] = useState<boolean>(legalAccepted);

  if (!showLegalModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-onboarding-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* En-tête identité */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="lg" />
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Premier accueil · v{APP_META.version}
              </span>
              <h2 id="legal-onboarding-title" className="text-xl font-bold text-white">
                Bienvenue sur Carbonor
              </h2>
            </div>
          </div>

          {/* Choix rapide Thème Clair / Sombre dès l'accueil */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                theme === 'dark' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Sombre</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                theme === 'light' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Clair</span>
            </button>
          </div>
        </div>

        {/* 3 repères pour utilisateur novice */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <strong className="block text-sm text-white">Navigation guidée</strong>
            <p className="text-slate-400 leading-relaxed">
              Chaque écran dispose d&apos;un encadré explicatif adapté aux novices et d&apos;infobulles sur chaque champ.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <strong className="block text-sm text-white">Infobulles « ? »</strong>
            <p className="text-slate-400 leading-relaxed">
              Survolez ou cliquez sur les icônes d&apos;aide à côté des réglages pour comprendre chaque unité et paramètre.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <Scale className="w-4 h-4 text-amber-400" />
            <strong className="block text-sm text-white">Démo vs Données Réelles</strong>
            <p className="text-slate-400 leading-relaxed">
              L&apos;application sépare toujours les fixtures hors-ligne des flux officiels NOAA, ICOS, NASA, CAMS et HITRAN.
            </p>
          </div>
        </div>

        {/* Mentions légales et clause explicite de non-responsabilité */}
        <div
          data-demo-id="legal-disclaimer-box"
          className="rounded-xl border border-amber-500/40 bg-amber-950/25 p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Mentions Légales &amp; Clause de Non-Responsabilité sur les Données</span>
          </div>

          <div className="text-xs sm:text-[13px] text-slate-200 leading-relaxed space-y-2.5">
            <p>
              <strong>Non-responsabilité de l&apos;éditeur :</strong> L&apos;auteur et éditeur de Carbonor ({APP_META.author}) <strong>n&apos;est pas responsable des données fournies, affichées ou calculées dans l&apos;application</strong>.
            </p>
            <p>
              Les mesures, séries temporelles, grilles atmosphériques, bilans d&apos;émissions et paramètres spectraux proviennent d&apos;organismes tiers (NOAA GML, ICOS ERIC, NASA Earthdata, Copernicus ECMWF/CAMS, HITRAN, CITEPA, Global Carbon Project) ou de jeux d&apos;exemple embarqués en mode Démonstration. Ils sont fournis « en l&apos;état », à titre exclusivement pédagogique, scientifique et informatif, sans aucune garantie d&apos;exactitude, d&apos;exhaustivité, de fraîcheur ou de disponibilité continue.
            </p>
            <p>
              Pour toute décision critique, recherche publiée ou expertise réglementaire, veuillez vérifier les données directement auprès des portails officiels et de leurs DOI d&apos;origine. Logiciel distribué sous licence {APP_META.license}.
            </p>
          </div>
        </div>

        {/* Case à cocher d'acceptation */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs sm:text-sm text-slate-200">
          <input
            type="checkbox"
            checked={checkedDisclaimer}
            onChange={(e) => setCheckedDisclaimer(e.target.checked)}
            className="mt-0.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
          <span>
            J&apos;ai pris connaissance des mentions légales et je comprends que l&apos;éditeur de Carbonor n&apos;est pas responsable des données fournies dans l&apos;application.
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {legalAccepted && (
            <button
              type="button"
              data-demo-id="legal-close-btn"
              onClick={closeLegalModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              Fermer
            </button>
          )}
          <button
            type="button"
            disabled={!checkedDisclaimer}
            onClick={acceptLegalNotice}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>J&apos;ai compris et j&apos;accède à Carbonor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
