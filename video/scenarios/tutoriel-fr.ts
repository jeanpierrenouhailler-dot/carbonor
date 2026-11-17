import { defineScenario, type RuntimeStep } from '@nouhailler/video-studio';

export default defineScenario<RuntimeStep>({
  id: 'tutoriel-fr',
  video: {
    title: 'Découvrir Carbonor — Observatoire du CO₂ Atmosphérique',
    description:
      'Tutoriel complet de la plateforme scientifique Carbonor : cinq niveaux de preuve, mesures au sol NOAA et ICOS, observations satellitaires NASA OCO-2/OCO-3, spectroscopie HITRAN, inventaires CITEPA et paramètres PWA.',
    language: 'fr',
    voiceEnabled: true,
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    clock: '2026-11-17T18:00:00+01:00',
    location: { city: 'Puy de Dôme', lat: 45.772, lng: 2.965 },
    firstChapter: 'Découvrir Carbonor',
    intro: {
      eyebrow: 'Tutoriel vidéo · Carbonor',
      title: 'Observatoire du CO₂ Atmosphérique',
      tagline:
        'Des stations au sol à la physique moléculaire, sans jamais confondre fait et modèle.',
      bullets: [
        'Mesures au sol NOAA et réseau européen ICOS',
        'Télédétection spatiale XCO₂ NASA OCO-2 et OCO-3',
        'Spectroscopie quantique HITRAN et loi de Beer-Lambert',
        'Inventaires CITEPA, mode Clair et installation PWA',
      ],
      narration:
        'Bienvenue dans ce tutoriel complet de Carbonor. En quatre minutes, découvrons comment l’application relie observations du carbone et physique moléculaire.',
      minDurationMs: 4200,
    },
    outro: {
      eyebrow: 'Carbonor · Plateforme scientifique ouverte',
      title: 'Pour aller plus loin',
      tagline:
        'Explorez les données certifiées et installez Carbonor sur mobile ou ordinateur.',
      bullets: [
        'Code source et documentation sur GitHub',
        'Sources : NOAA, ICOS, NASA, CAMS, HITRAN, CITEPA',
      ],
      links: [
        {
          label: 'Dépôt GitHub Carbonor',
          url: 'https://github.com/jeanpierrenouhailler-dot/carbonor',
        },
      ],
      narration:
        'Vous maîtrisez maintenant l’ensemble des modules de Carbonor. Retrouvez le code source et les documentations scientifiques directement sur GitHub.',
      minDurationMs: 4500,
    },
  },
  scenario: {
    name: 'tutoriel-fr',
    label: 'Tutoriel complet Carbonor (FR)',
    description:
      'Parcours guidé en 6 chapitres couvrant la page d’accueil, le tableau de bord, la carte interactive, les mesures au sol, la télédétection XCO₂, la spectroscopie HITRAN, les inventaires CITEPA et les paramètres système.',
    steps: [
      // ── Chapitre 1 : Découvrir Carbonor et ses 5 niveaux de preuve ──────────
      {
        type: 'highlight',
        target: 'hero-stats',
        narrate:
          'Sur l’écran d’accueil, quatre indicateurs affichent la concentration mondiale au sol, la moyenne satellitaire et le nombre de raies HITRAN.',
        video: { zoom: 1.2 },
      },
      {
        type: 'highlight',
        target: 'epistemology-timeline',
        narrate:
          'Carbonor repose sur une règle stricte : séparer cinq régimes de connaissance, de la mesure directe au modèle théorique.',
        video: { zoom: 1.15 },
      },
      {
        type: 'click',
        target: 'epistemology-observed',
        narrate:
          'Un clic sur le pilier Observé ouvre sa méthodologie dédiée, centrée sur l’inversion spectrale depuis l’espace.',
        video: { readingPause: 550 },
      },
      {
        type: 'highlight',
        target: 'epistemology-detail',
        narrate:
          'Chaque fiche détaille les instruments de mesure, les incertitudes et les observatoires associés.',
        video: { zoom: 1.15 },
      },
      {
        type: 'click',
        target: 'landing-launch-app',
        narrate:
          'Cliquons maintenant sur « Lancer l’App » pour entrer dans l’espace de travail scientifique.',
      },

      // ── Chapitre 2 : Lire le tableau de bord et explorer la carte ───────────
      {
        type: 'highlight',
        target: 'novice-guide-banner',
        narrate:
          'À l’ouverture, ce guide contextuel résume comment lire l’écran, avec une option pour masquer l’aide une fois à l’aise.',
        video: {
          chapter: 'Tableau de bord et carte multi-couches',
          transition: 'fade',
          zoom: 1.15,
        },
      },
      {
        type: 'highlight',
        target: 'dashboard-data-mode-card',
        narrate:
          'Juste dessous, le bandeau de statut sépare clairement le mode Démonstration hors-ligne des données officielles en direct.',
        video: { zoom: 1.2, readingPause: 450 },
      },
      {
        type: 'highlight',
        target: 'dashboard-kpis',
        narrate:
          'Les quatre cartes synthétisent Mauna Loa, le Puy de Dôme, le satellite NASA et la réanalyse européenne CAMS.',
        video: { zoom: 1.15 },
      },
      {
        type: 'highlight',
        target: 'dashboard-keeling-chart',
        narrate:
          'La courbe historique de Keeling retrace la hausse continue depuis 1958, rythmée par la respiration saisonnière de la végétation.',
        video: { zoom: 1.2, readingPause: 550 },
      },
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Ouvrons le menu latéral sur mobile pour rejoindre la carte interactive multi-réseaux.',
      },
      {
        type: 'navigate',
        target: 'nav-map',
        narrate:
          'Sélectionnons « Carte Interactive » afin de situer les observatoires et les traces orbitales sur un fond cartographique réel.',
      },
      {
        type: 'click',
        target: 'map-tile-topo',
        narrate:
          'Passons sur le fond topographique OpenStreetMap pour repérer facilement le relief des stations d’altitude.',
      },
      {
        type: 'click',
        target: 'map-network-icos',
        narrate:
          'Filtrons l’affichage sur le réseau européen ICOS avant d’inspecter les métadonnées d’une station.',
      },
      {
        type: 'highlight',
        target: 'map-station-panel',
        narrate:
          'Le panneau détaillé affiche la dernière valeur enregistrée, l’altitude de la prise d’air et le certificat d’étalonnage.',
        video: { zoom: 1.2, readingPause: 500 },
      },

      // ── Chapitre 3 : Mesures au sol et observations satellites XCO₂ ─────────
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Rouvrons le menu de navigation pour analyser les séries temporelles mesurées au sol.',
        video: {
          chapter: 'Mesures au sol et télédétection XCO₂',
          transition: 'fade',
        },
      },
      {
        type: 'navigate',
        target: 'nav-surface',
        narrate:
          'Accédons au module « CO₂ au Sol » regroupant les stations continues NOAA et ICOS.',
      },
      {
        type: 'click',
        target: 'surface-resolution-daily',
        narrate:
          'À Mauna Loa, affichons la résolution quotidienne pour observer les variations fines autour du cycle annuel.',
      },
      {
        type: 'click',
        target: 'surface-station-brw',
        narrate:
          'Basculons maintenant vers la station arctique de Barrow en Alaska, entourée par la forêt boréale.',
      },
      {
        type: 'highlight',
        target: 'surface-chart',
        narrate:
          'Le graphique met en évidence une amplitude saisonnière bien plus marquée aux hautes latitudes nord.',
        video: { zoom: 1.2, readingPause: 500 },
      },
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Passons maintenant de la surface à l’observation spatiale depuis l’orbite terrestre.',
      },
      {
        type: 'navigate',
        target: 'nav-xco2',
        narrate:
          'Ouvrons la vue « Télédétection XCO₂ » issue des spectromètres embarqués NASA OCO-2 et OCO-3.',
      },
      {
        type: 'click',
        target: 'xco2-track-global',
        narrate:
          'Choisissons le tracé global méridien pour explorer la répartition sur toute la colonne d’air sec.',
      },
      {
        type: 'click',
        target: 'xco2-filter-flag0',
        narrate:
          'Le filtre Quality Flag zéro ne conserve que les sondages par ciel dégagé, fiables pour l’assimilation.',
        video: { readingPause: 450 },
      },

      // ── Chapitre 4 : Physique moléculaire et effet de serre ─────────────────
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Descendons à l’échelle quantique dans la section Spectroscopie du menu.',
        video: {
          chapter: 'Physique moléculaire et effet de serre',
          transition: 'fade',
        },
      },
      {
        type: 'navigate',
        target: 'nav-spectroscopy-lines',
        narrate:
          'L’explorateur HITRAN affiche les transitions rotation-vibration de la molécule de dioxyde de carbone.',
      },
      {
        type: 'type',
        target: 'hitran-search-input',
        text: '626',
        narrate:
          'Saisissons « 626 » dans le champ de recherche pour isoler l’isotopologue majoritaire dans l’atmosphère.',
      },
      {
        type: 'highlight',
        target: 'hitran-table',
        narrate:
          'Chaque ligne précise le nombre d’onde, la branche P, Q ou R et l’intensité recalculée à la température choisie.',
        video: { zoom: 1.15, readingPause: 500 },
      },
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Rejoignons maintenant le laboratoire virtuel pour simuler le transfert radiatif.',
      },
      {
        type: 'navigate',
        target: 'nav-spectroscopy-lab',
        narrate:
          'Ce simulateur résout la loi de Beer-Lambert autour de la bande fondamentale à quinze micromètres.',
      },
      {
        type: 'click',
        target: 'lab-preset-800',
        narrate:
          'À huit cents ppm, le centre de bande est saturé mais les ailes s’élargissent et augmentent le forçage radiatif.',
        video: { readingPause: 500 },
      },
      {
        type: 'highlight',
        target: 'lab-spectrum-chart',
        narrate:
          'La courbe superpose en un coup d’œil le spectre simulé et la référence préindustrielle à deux cent quatre-vingts ppm.',
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'lab-tab-validation',
        narrate:
          'L’onglet Validation regroupe enfin huit tests confrontant le moteur physique aux références HITRAN et RADIS.',
        video: { readingPause: 500 },
      },

      // ── Chapitre 5 : Modèles CAMS, inventaires CITEPA et comparaison ─────────
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Abordons maintenant les flux régionaux et les inventaires nationaux d’émissions.',
        video: {
          chapter: 'Modèles CAMS, inventaires et comparaison',
          transition: 'fade',
        },
      },
      {
        type: 'navigate',
        target: 'nav-flux',
        narrate:
          'L’écran « Flux et Inventaires » distingue les inversions atmosphériques top-down des bilans comptables bottom-up.',
      },
      {
        type: 'click',
        target: 'flux-tab-emissions',
        narrate:
          'Affichons l’inventaire CITEPA SECTEN, ventilé par grands secteurs d’activité en France.',
      },
      {
        type: 'highlight',
        target: 'citepa-sector-0',
        narrate:
          'Chaque secteur indique son volume en mégatonnes équivalent CO₂ ainsi que sa part du bilan national.',
        video: { zoom: 1.2, readingPause: 450 },
      },
      {
        type: 'click',
        target: 'menu-mobile',
        narrate:
          'Terminons ce tour scientifique par le comparateur multi-sources.',
      },
      {
        type: 'navigate',
        target: 'nav-compare',
        narrate:
          'Cette vue confronte modèles, stations et satellites tout en veillant à la compatibilité physique des grandeurs.',
      },
      {
        type: 'click',
        target: 'compare-tooltip-scenario',
        narrate:
          'Chaque champ inclut une infobulle pédagogique expliquant les scénarios et leurs précautions d’analyse.',
        video: { zoom: 1.3, readingPause: 500 },
      },
      {
        type: 'click',
        target: 'compare-mode-icos',
        narrate:
          'Comparons ici les mesures ICOS au sol avec le niveau surface du modèle européen CAMS.',
      },
      {
        type: 'highlight',
        target: 'compare-stats-grid',
        narrate:
          'Le biais moyen, l’erreur quadratique et le coefficient de corrélation s’actualisent immédiatement.',
        video: { zoom: 1.2, readingPause: 450 },
      },

      // ── Chapitre 6 : Paramètres système, thème Clair, aide et PWA ───────────
      {
        type: 'click',
        target: 'btn-system-settings',
        narrate:
          'Ouvrons les paramètres système depuis la barre supérieure pour gérer les mises à jour et l’apparence.',
        video: {
          chapter: 'Paramètres système, thème Clair et PWA',
          transition: 'fade',
        },
      },
      {
        type: 'highlight',
        target: 'settings-version-dates',
        narrate:
          'On y consulte la version installée, la date de sortie et l’horodatage de la dernière vérification.',
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'settings-check-updates',
        narrate:
          'Le bouton de vérification contrôle les nouvelles versions et prépare leur installation en arrière-plan via le Service Worker.',
        video: { readingPause: 450 },
      },
      {
        type: 'click',
        target: 'settings-theme-light',
        narrate:
          'Activons le thème Clair « revue scientifique de jour », confortable en environnement très lumineux.',
        video: { readingPause: 550 },
      },
      {
        type: 'highlight',
        target: 'settings-pwa-install',
        narrate:
          'Un bouton dédié permet aussi d’installer Carbonor sur votre écran d’accueil mobile ou sur ordinateur.',
        video: { zoom: 1.2 },
      },
      {
        type: 'click',
        target: 'settings-legal-btn',
        narrate:
          'Affichons enfin les mentions légales rappelant que l’éditeur n’est pas responsable des données tierces affichées.',
      },
      {
        type: 'highlight',
        target: 'legal-disclaimer-box',
        narrate:
          'Cette clause de non-responsabilité accueille tout nouvel utilisateur lors de sa première ouverture.',
        video: { zoom: 1.15, readingPause: 600 },
      },
      {
        type: 'click',
        target: 'legal-close-btn',
        narrate:
          'Refermons cette fenêtre : Carbonor est prêt pour vos analyses.',
      },
    ],
  },
});
