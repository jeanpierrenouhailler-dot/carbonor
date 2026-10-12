# Guide de Déploiement Cloudflare Pages — Carbonor (CO₂ Atmosphère)

Ce projet est prêt pour un déploiement clé-en-main sur **Cloudflare Pages**.

---

## 🚀 Méthode 1 : Déploiement Automatique via GitHub / GitLab

1. Connectez-vous à la console [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Rendez-vous dans **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Sélectionnez le dépôt de votre projet.
4. Configurez les options de build :
   - **Framework preset** : `Vite` (ou `None`)
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Variables d'environnement** :
     - `NODE_VERSION` = `20`
5. Cliquez sur **Save and Deploy**.

---

## ⚡ Méthode 2 : Déploiement CLI avec Wrangler

Si vous souhaitez déployer directement depuis votre terminal :

```bash
# 1. Compiler l'application cliente
npm run build

# 2. Déployer sur Cloudflare Pages
npx wrangler pages deploy dist --project-name carbonor
```

---

## 🛡️ Ce qui a été préconfiguré dans le projet

1. **Règles de routage SPA (`public/_redirects`)** :
   ```
   /*    /index.html   200
   ```
   Évite les erreurs 404 lors du rafraîchissement des routes client ou de la navigation directe.

2. **En-têtes de sécurité & Cache Service Worker (`public/_headers`)** :
   - Cache optimisé pour les assets immuables (`/assets/*`).
   - Revalidation immédiate pour le Service Worker (`/sw.js`).
   - En-têtes HTTP de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

3. **Progressive Web App (PWA)** :
   - Le service worker Workbox met en cache les assets et fournit un mode hors ligne résilient.
