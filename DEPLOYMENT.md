# Guide de Déploiement & PWA

## 1. Déploiement Standard
L'application fonctionne comme une PWA full-stack :
```bash
# Compilation du bundle frontend avec Workbox et Tailwind 4
npm run build

# Démarrage du serveur Express full-stack
npm run start
```

## 2. PWA & Service Worker
Le plugin `vite-plugin-pwa` génère automatiquement le service worker à la compilation (`npm run build`) :
- Pré-mise en cache de tous les assets statiques (`js`, `css`, `html`, `svg`, `png`).
- Mise en cache dynamique des requêtes `/api/*` en stratégie `NetworkFirst`.
- Manifeste PWA accessible sur `/manifest.webmanifest`.
- Icônes conformes Chromium, Android et iOS Safari dans `/public`.

## 3. Variables d'Environnement
Définies dans `.env.example` :
- `PORT` : Port d'écoute du serveur (défaut : 3000).
- `APP_URL` : URL publique de l'application.
