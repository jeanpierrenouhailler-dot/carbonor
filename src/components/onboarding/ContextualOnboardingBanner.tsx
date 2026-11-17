import React from 'react';
import { Compass, HelpCircle, X } from 'lucide-react';
import type { ViewKey } from '../layout/Sidebar';
import { useOnboarding } from '../../context/OnboardingContext';

interface ScreenGuide {
  title: string;
  goal: string;
  tips: string[];
}

const SCREEN_GUIDES: Record<ViewKey, ScreenGuide> = {
  landing: {
    title: 'Guide d’accueil — Découvrir Carbonor pas à pas',
    goal: 'Cette page présente le projet scientifique, les 5 types de données (Mesuré, Observé, Estimé, Modélisé, Simulé) et donne accès aux 10 modules.',
    tips: [
      'Cliquez sur « Accéder à Carbonor » ou choisissez un écran dans le menu pour commencer.',
      'Testez le simulateur de forçage radiatif en bas de page en déplaçant le curseur de CO₂ (en ppm).',
      'Utilisez le bouton « Paramètres » (engrenage) en haut pour passer au thème Clair ou vérifier les mises à jour.',
    ],
  },
  dashboard: {
    title: 'Bien débuter sur le Tableau de Bord',
    goal: 'Cet écran rassemble en un coup d’œil la courbe historique de Mauna Loa (depuis 1958) et les 4 grands indicateurs planétaires.',
    tips: [
      'Survolez les icônes « ? » à côté de chaque chiffre pour savoir s’il s’agit d’une mesure directe au sol ou d’une moyenne satellite.',
      'En haut à droite, le badge « Mode Démo / Données réelles » indique si vous consultez les exemples embarqués ou les serveurs officiels.',
      'Cliquez sur n’importe quelle carte d’indicateur pour ouvrir le détail de provenance (DOI et empreinte SHA-256).',
    ],
  },
  map: {
    title: 'Comprendre la Carte Interactive',
    goal: 'Visualisez où se trouvent les observatoires au sol (points verts) et les passages de satellites (trace bleue) sur une carte du monde.',
    tips: [
      'Cochez ou décochez les cases « Couches » en haut pour afficher ou masquer les stations, les satellites ou la grille modèle CAMS.',
      'Changez le fond de carte (Standard, Sombre, Relief Topo ou Satellite) selon votre préférence de lecture.',
      'Cliquez sur un marqueur sur la carte pour lire les mesures précises de la station dans le panneau de droite.',
    ],
  },
  surface: {
    title: 'Comprendre les Mesures au Sol (In Situ)',
    goal: 'Explorez l’air mesuré directement dans des observatoires physiques (Mauna Loa à Hawaï, Puy de Dôme en France, Pôle Sud…).',
    tips: [
      'Choisissez d’abord une station dans le menu déroulant, puis la fréquence (mensuelle, quotidienne ou horaire).',
      'L’unité « ppm » signifie « parties par million » : 426 ppm = 426 molécules de CO₂ pour 1 million de molécules d’air sec.',
      'Utilisez le menu de comparaison pour superposer deux stations (ex. Hémisphère Nord vs Pôle Sud).',
    ],
  },
  xco2: {
    title: 'Comprendre les Satellites XCO₂ (NASA OCO-2/3)',
    goal: 'Les satellites mesurent le CO₂ moyen sur toute la hauteur de l’atmosphère (de 0 à 50 km), appelé XCO₂.',
    tips: [
      'Sélectionnez une zone géographique (France-Europe ou Monde) via le sélecteur de trace.',
      'Filtrez sur « Quality Flag 0 » pour ne garder que les observations validées par ciel dégagé.',
      'Rappelez-vous : XCO₂ (colonne totale) est différent d’une mesure au sol sensible aux forêts et villes locales.',
    ],
  },
  profiles: {
    title: 'Lire un Profil Vertical (du sol à 30 km)',
    goal: 'Découvrez comment la concentration de CO₂ évolue quand on monte en altitude grâce aux ballons AirCore, avions et mâts de mesure.',
    tips: [
      'Choisissez un profil dans la liste déroulante pour comparer un ballon stratosphérique et une tour météo.',
      'Basculez l’axe vertical entre « Altitude (km) » et « Pression (hPa) ».',
      'En haute altitude (stratosphère), l’air est plus vieux de quelques années et contient donc légèrement moins de CO₂.',
    ],
  },
  'spectroscopy-lines': {
    title: 'Explorer les Raies Quantiques (HITRAN)',
    goal: 'Chaque molécule de CO₂ absorbe la lumière infrarouge à des fréquences très précises appelées « raies ». Cet écran permet de les filtrer.',
    tips: [
      'Commencez par choisir une « Bande Vibrationnelle » (ex. 15 µm, responsable principale de l’effet de serre).',
      'Ajustez les curseurs de Température (K) et de Pression (atm) pour voir comment les raies s’élargissent.',
      'Cliquez sur le « ? » de chaque bloc de filtre pour obtenir l’explication physique complète.',
    ],
  },
  'spectroscopy-pqr': {
    title: 'Comprendre la Structure P, Q, R et les Unités',
    goal: 'Visualisez les trois familles de transitions d’énergie d’une molécule qui vibre et tourne en même temps, et convertissez les unités spectrales.',
    tips: [
      'Basculez entre la bande à 15 µm (qui possède la grande pointe centrale Q) et celle à 4,3 µm.',
      'Passez la souris sur les barres du graphique pour afficher les détails d’une transition précise.',
      'Modifiez n’importe lequel des 3 champs du convertisseur en bas pour convertir instantanément cm⁻¹, µm et THz.',
    ],
  },
  'spectroscopy-lab': {
    title: 'Laboratoire Virtuel Beer-Lambert',
    goal: 'Simulez en direct comment la concentration de CO₂ modifie l’absorption des rayons infrarouges émis par la Terre.',
    tips: [
      'Déplacez le curseur de Concentration (ou cliquez sur 280, 420, 560 ppm) pour observer le spectre changer.',
      'Cochez « Superposer référence préindustrielle (280 ppm) » pour voir l’effet supplémentaire du CO₂ moderne.',
      'Modifiez la Température, la Pression et le Trajet optique (L) avec les curseurs pour tester différentes couches atmosphériques.',
    ],
  },
  'spectroscopy-validation': {
    title: 'Validation du Moteur Physique (RADIS & Voigt)',
    goal: 'Vérifiez la précision mathématique des calculs spectraux de Carbonor par rapport aux équations de référence internationales.',
    tips: [
      'Ajustez les curseurs P (pression) et T (température) en bas pour comparer le profil exact de Faddeeva au Pseudo-Voigt.',
      'Les valeurs d’écart sont exprimées en pourcentage afin d’évaluer la marge d’erreur numérique.',
    ],
  },
  flux: {
    title: 'Flux de Surface & Inversions CAMS',
    goal: 'Observez où la Terre absorbe du carbone (océans, forêts en été) et où elle en rejette (activités humaines, respiration hivernale).',
    tips: [
      'Utilisez les onglets en haut pour naviguer entre les flux CAMS, les inventaires nationaux et le convertisseur d’unités.',
      'Une valeur négative indique un « puits » (absorption nette de CO₂) ; une valeur positive indique une « source ».',
    ],
  },
  emissions: {
    title: 'Inventaires d’Émissions Sectoriels (CITEPA)',
    goal: 'Consultez la répartition des émissions françaises par grand secteur (Transports, Industrie, Bâtiment, Agriculture, Puits forestier).',
    tips: [
      'Utilisez le menu déroulant pour changer d’édition annuelle CITEPA SECTEN.',
      'Cliquez sur une carte sectorielle pour afficher les sous-secteurs détaillés (ex. voitures particulières vs poids lourds).',
    ],
  },
  compare: {
    title: 'Comparateur Multi-Sources',
    goal: 'Confrontez les mesures d’un satellite, d’une station au sol et d’un modèle numérique CAMS pour comprendre pourquoi ils diffèrent légèrement.',
    tips: [
      'Sélectionnez un scénario de comparaison en haut de la page.',
      'Lisez toujours l’encadré d’homogénéité : comparer une station au sol à un satellite implique un écart physique normal.',
    ],
  },
  france: {
    title: 'Zoom Régional France & Europe (ICOS)',
    goal: 'Explorez les stations françaises (Puy de Dôme, Observatoire de Haute-Provence, Tour de Traînou) et européennes du réseau ICOS.',
    tips: [
      'Basculez entre l’onglet France et l’onglet Europe pour comparer les altitudes et les concentrations.',
      'Cliquez sur « Synchroniser ICOS » pour actualiser les données depuis le portail européen.',
    ],
  },
  'pipeline-audit': {
    title: 'Audit de Transparence & Traçabilité',
    goal: 'Vérifiez l’origine exacte de chaque fichier local, son horodatage UTC et son empreinte cryptographique SHA-256.',
    tips: [
      'Cliquez sur un fichier dans la liste pour inspecter ses premières lignes brutes et son DOI officiel.',
      'Utilisez « Actualiser » pour rafraîchir les jeux de données depuis les archives officielles.',
    ],
  },
  sources: {
    title: 'Sources Officielles & Licences Ouvertes',
    goal: 'Retrouvez les références académiques, licences (CC-BY, Public Domain) et liens directs vers les 7 institutions partenaires.',
    tips: [
      'Chaque bloc indique le DOI à citer dans vos rapports ou travaux pédagogiques.',
    ],
  },
  docs: {
    title: 'Documentation & Équations Scientifiques',
    goal: 'Consultez les formules physiques complètes (Beer-Lambert, profil de Voigt, forçage radiatif du GIEC) expliquées étape par étape.',
    tips: [
      'Cliquez sur les icônes « ? » pour afficher les définitions détaillées de chaque constante ou variable.',
    ],
  },
};

interface ContextualOnboardingBannerProps {
  currentView: ViewKey;
}

export const ContextualOnboardingBanner: React.FC<
  ContextualOnboardingBannerProps
> = ({ currentView }) => {
  const { noviceTipsEnabled, dismissedViews, dismissViewGuide } = useOnboarding();

  if (!noviceTipsEnabled || dismissedViews[currentView]) {
    return null;
  }

  const guide = SCREEN_GUIDES[currentView];
  if (!guide) return null;

  return (
    <aside
      aria-label={guide.title}
      className="mb-6 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 sm:p-5 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-950/70 border border-cyan-500/35 text-cyan-300">
              <Compass className="w-3 h-3" />
              Guide Novice Contextuel
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {guide.title}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {guide.goal}
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {guide.tips.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => dismissViewGuide(currentView)}
          aria-label="Masquer le guide sur cet écran"
          title="Masquer ce guide sur cet écran (réactivable dans Paramètres)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
