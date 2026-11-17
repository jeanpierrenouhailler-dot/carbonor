export const APP_META = {
  name: 'Carbonor',
  fullName: 'Carbonor — CO₂ Atmosphère & Cycle du Carbone',
  version: '2.6.0',
  releaseDate: '2026-11-17',
  releaseDateLabel: '17 novembre 2026',
  author: 'Jean-Pierre Nouhailler',
  repositoryUrl: 'https://github.com/jeanpierrenouhailler-dot/carbonor',
  license: 'MIT',
  autoCheckIntervalMs: 15 * 60 * 1000, // Vérification automatique toutes les 15 minutes
  minFocusRecheckMs: 5 * 60 * 1000,   // Re-vérification au retour sur l'onglet après 5 minutes
} as const;
