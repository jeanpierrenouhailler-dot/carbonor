# Architecture Technique & Modèle de Données

## Schéma Global du Flux de Données

```text
  [NOAA GML / ERDDAP]   [ICOS Carbon Portal]   [NASA Earthdata OCO]   [Copernicus CAMS]   [HITRAN 2020]
          │                      │                       │                    │                 │
          └──────────────────────┴───────────┬───────────┴────────────────────┴─────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │  Backend Express (server) │
                               │  - Validation des unités  │
                               │  - Normalisation météo    │
                               │  - Cache en mémoire/disque│
                               └─────────────┬─────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │     REST APIs (/api/*)    │
                               │     - /api/status         │
                               │     - /api/stations       │
                               │     - /api/observations   │
                               │     - /api/xco2           │
                               │     - /api/spectroscopy   │
                               └─────────────┬─────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │   PWA Frontend (React 19) │
                               │   - Service Worker Workbox│
                               │   - IndexedDB/LocalStorage│
                               │   - Moteur SVG réactif    │
                               │   - Calculateur physique  │
                               └───────────────────────────┘
```

## Stratégie de Résilience & Mode Dégradé

1. **Aucune Invention de Données** :
   En cas d'indisponibilité réseau, le service de cache (`CacheService`) fournit la dernière donnée enregistrée horodatée avec le statut explicite `CACHED`.
2. **PWA Hors-Ligne** :
   Le Service Worker Workbox intercepte les routes statiques et les appels `/api/*` avec une stratégie `NetworkFirst` et bascule automatiquement sur les données locales persistées.
3. **Moteur Spectroscopique Autonome** :
   La simulation raie-par-raie s'exécute côté client ou serveur sans dépendance externe en temps réel, garantissant un fonctionnement scientifique 100% hors-ligne.
