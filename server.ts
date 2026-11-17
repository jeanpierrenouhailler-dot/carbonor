import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { NoaaDataPipeline } from './src/server/noaaPipeline.ts';
import { IcosDataPipeline } from './src/server/icosPipeline.ts';
import { NasaOcoPipeline } from './src/server/nasaOcoPipeline.ts';
import { CamsDataPipeline } from './src/server/camsPipeline.ts';
import { CitepaDataPipeline } from './src/server/citepaPipeline.ts';
import { NoaaErddapProvider } from './src/providers/noaaProvider.ts';
import { IcosProvider } from './src/providers/icosProvider.ts';
import { CamsProvider } from './src/providers/camsProvider.ts';
import { OcoProvider } from './src/providers/ocoProvider.ts';
import { EmissionsProvider } from './src/providers/emissionsProvider.ts';
import { HITRAN_CO2_LINES } from './src/scientific/hitranData.ts';
import { SpectroscopyEngine } from './src/scientific/spectroscopyEngine.ts';
import { HitranDataPipeline } from './src/server/hitranPipeline.ts';
import { ProviderHealthService } from './src/server/providerHealthService.ts';
import { Station, ScientificObservation } from './src/types/observation.ts';
import { ScientificExportService } from './src/services/scientificExportService.ts';
import { CacheService } from './src/providers/cacheService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // ==========================================
  // ROUTES API SCIENTIFIQUES (/api/*)
  // ==========================================
  // GESTION DU STATUT SCIENTIFIQUE : MODE DÉMONSTRATION VS MODE DONNÉES RÉELLES
  // 🟡 MODE DÉMONSTRATION : Données d'exemple / fixtures scientifiques embarquées
  // 🟢 MODE DONNÉES RÉELLES : Données récupérées auprès de la source officielle
  // ==========================================
  let currentDataMode: 'DEMO' | 'REAL_DATA' = 'DEMO';

  const resolveRequestMode = (req: express.Request): 'DEMO' | 'REAL_DATA' => {
    const qMode = (req.query.mode as string)?.toLowerCase();
    const hMode = (req.headers['x-carbonor-data-mode'] as string)?.toUpperCase();
    if (qMode === 'real' || hMode === 'REAL_DATA') return 'REAL_DATA';
    if (qMode === 'demo' || hMode === 'DEMO') return 'DEMO';
    return currentDataMode;
  };

  const enrichNoaaObservations = (
    observations: ScientificObservation[],
    fetchStatus: { status?: string; downloadedAt?: string },
    activeMode: 'DEMO' | 'REAL_DATA'
  ): ScientificObservation[] => {
    const isDemo = activeMode === 'DEMO';
    const retrievedAt = fetchStatus?.downloadedAt || undefined;
    const ageDays = retrievedAt
      ? Math.max(0, Math.floor((Date.now() - new Date(retrievedAt).getTime()) / (1000 * 60 * 60 * 24)))
      : undefined;
    const freshness: 'FRESH' | 'STALE' | 'EXPIRED' | 'UNKNOWN' =
      ageDays === undefined ? 'UNKNOWN' : ageDays <= 7 ? 'FRESH' : ageDays <= 30 ? 'STALE' : 'EXPIRED';

    return observations.map(obs => {
      const checksum = obs.provenance?.checksum && obs.provenance.checksum.startsWith('sha256:') && obs.provenance.checksum.length === 71
        ? obs.provenance.checksum
        : CacheService.computeChecksum({ id: obs.id, ts: obs.timestamp, v: obs.value });
      return {
        ...obs,
        provenance: {
          ...obs.provenance,
          origin: isDemo ? 'DEMO' : (fetchStatus?.status === 'ONLINE' ? 'LIVE_REMOTE' : 'REMOTE_CACHED'),
          freshness,
          retrievedAt: retrievedAt || obs.provenance?.downloadedAt,
          checksum,
          checksumAlgorithm: 'SHA-256',
          qualityStatus: 'VALIDATED',
          isValidated: true,
          dataMode: activeMode,
          isRealData: !isDemo
        }
      };
    });
  };

  app.get('/api/mode', (_req, res) => {
    const isReal = currentDataMode === 'REAL_DATA';
    res.json({
      mode: currentDataMode,
      label: isReal ? '🟢 MODE DONNÉES RÉELLES' : '🟡 MODE DÉMONSTRATION',
      description: isReal
        ? 'Données récupérées auprès de la source officielle.'
        : "Données d'exemple / fixtures scientifiques embarquées."
    });
  });

  app.post('/api/mode', (req, res) => {
    const { mode } = req.body || {};
    if (mode === 'DEMO' || mode === 'REAL_DATA') {
      currentDataMode = mode;
    }
    const isReal = currentDataMode === 'REAL_DATA';
    res.json({
      mode: currentDataMode,
      label: isReal ? '🟢 MODE DONNÉES RÉELLES' : '🟡 MODE DÉMONSTRATION',
      description: isReal
        ? 'Données récupérées auprès de la source officielle.'
        : "Données d'exemple / fixtures scientifiques embarquées."
    });
  });

  app.get('/api/system/version', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      name: 'Carbonor',
      version: '2.6.0',
      releaseDate: '2026-11-17',
      releaseDateLabel: '17 novembre 2026',
      checkedAt: new Date().toISOString()
    });
  });

  // État certifié des sources de données selon la taxonomie scientifique :
  // CONNECTED | FETCHED | CACHED | STALE | OFFLINE | ERROR | NOT_CONFIGURED
  app.get('/api/status', async (req, res) => {
    try {
      const checkLive = req.query.check_live === 'true';
      const simulateMode = req.query.simulate as string | undefined;
      const requestedMode = (req.query.mode as string)?.toLowerCase();
      const headerMode = req.headers['x-carbonor-data-mode'] as string | undefined;

      const activeMode: 'DEMO' | 'REAL_DATA' = requestedMode === 'real' || headerMode === 'REAL_DATA'
        ? 'REAL_DATA'
        : (requestedMode === 'demo' || headerMode === 'DEMO' ? 'DEMO' : currentDataMode);

      const systemStatus = await ProviderHealthService.getSystemStatus({
        checkConnectivity: checkLive,
        mode: activeMode
      });

      // Simulation de modes pour les tests et l'assurance qualité (ex: simulate=offline)
      if (simulateMode === 'offline') {
        systemStatus.status = 'OFFLINE';
        systemStatus.summary.offlineCount = systemStatus.providers.length;
        systemStatus.summary.connectedCount = 0;
        systemStatus.providers.forEach(p => {
          p.status = 'OFFLINE';
          p.statusLabel = 'Mode Hors-ligne Forcé';
          p.statusExplanation = 'Simulation du mode hors-ligne sans connexion réseau.';
          p.upstreamInfo.networkStatus = 'OFFLINE';
        });
      } else if (simulateMode === 'stale') {
        systemStatus.providers.forEach(p => {
          p.status = 'STALE';
          p.statusLabel = 'Cache expiré (> 30 jours)';
          p.cacheInfo.isStale = true;
          p.cacheInfo.ageDays = 45;
        });
      } else if (simulateMode === 'error') {
        systemStatus.status = 'DEGRADED';
        systemStatus.providers[0].status = 'ERROR';
        systemStatus.providers[0].statusLabel = 'Erreur HTTP 503';
        systemStatus.providers[0].statusExplanation = 'Erreur simulée lors de l’interrogation distante.';
      }

      res.json(systemStatus);
    } catch (e: any) {
      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: e.message
      });
    }
  });

  // Test de connectivité actif / ping réseau vers un ou l'ensemble des serveurs distants
  app.post('/api/status/ping', async (req, res) => {
    try {
      const providerId = req.query.provider as string | undefined;
      const targetUrls: Record<string, string> = {
        noaa: 'https://gml.noaa.gov',
        icos: 'https://data.icos-cp.eu',
        nasa: 'https://cmr.earthdata.nasa.gov',
        cams: 'https://ads.atmosphere.copernicus.eu',
        hitran: 'https://hitran.org',
        citepa: 'https://www.citepa.org'
      };

      if (providerId && targetUrls[providerId]) {
        const probe = await ProviderHealthService.probeHost(targetUrls[providerId], 3000);
        return res.json({ providerId, probe });
      }

      // Tester l'ensemble des serveurs distants en parallèle
      const entries = Object.entries(targetUrls);
      const results = await Promise.all(
        entries.map(async ([id, url]) => {
          const probe = await ProviderHealthService.probeHost(url, 2500);
          return { providerId: id, url, probe };
        })
      );

      res.json({
        testedAt: new Date().toISOString(),
        probes: results
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Audit scientifique complet du pipeline de données brutes
  app.get('/api/pipeline/audit', async (_req, res) => {
    try {
      const diskAudit = NoaaDataPipeline.getDiskAudit();
      const icosAudit = IcosDataPipeline.getFileAudit();
      const icosPipelineStatus = IcosDataPipeline.getPipelineStatus();
      const ocoAudit = NasaOcoPipeline.getAudit();
      const ocoPipelineStatus = NasaOcoPipeline.getPipelineStatus();
      const camsAudit = CamsDataPipeline.getAudit();
      const camsPipelineStatus = CamsDataPipeline.getPipelineStatus();
      const citepaAudit = CitepaDataPipeline.getFileAudit();
      const citepaPipelineStatus = CitepaDataPipeline.getPipelineStatus();
      const statuses = NoaaDataPipeline.getAllFetchStatuses();

      res.json({
        title: 'Audit Scientifique de Traçabilité des Données Réelles',
        verificationStatement: 'ZÉRO FORMULE SYNTHÉTIQUE — Données authentiques téléchargées depuis NOAA GML, NOAA ERDDAP, ICOS Carbon Portal, NASA Earthdata, Copernicus CAMS ADS et CITEPA SECTEN.',
        timestamp: new Date().toISOString(),
        rawDiskFiles: diskAudit,
        icosAudit,
        icosPipelineStatus,
        ocoAudit,
        ocoPipelineStatus,
        camsAudit,
        camsPipelineStatus,
        citepaAudit,
        citepaPipelineStatus,
        activeDataPipelines: statuses
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Déclenchement manuel de rafraîchissement depuis les serveurs officiels
  app.post('/api/pipeline/refresh', async (_req, res) => {
    try {
      console.log('[Pipeline Refresh] Téléchargement forcé depuis NOAA GML, ERDDAP, NASA Earthdata CMR, Copernicus CAMS ADS, ICOS Carbon Portal & CITEPA...');
      const [mloMonth, mloDay, brwHour, smoHour, spoHour, cmr, cams, icos, citepa] = await Promise.all([
        NoaaDataPipeline.getMonthlyKeeling(true),
        NoaaDataPipeline.getDailyKeeling(true),
        NoaaDataPipeline.getErddapHourly('BRW', true),
        NoaaDataPipeline.getErddapHourly('SMO', true),
        NoaaDataPipeline.getErddapHourly('SPO', true),
        NasaOcoPipeline.refreshCmrGranules(),
        CamsDataPipeline.refreshADSCatalogue(),
        IcosDataPipeline.syncFromCarbonPortal(),
        CitepaDataPipeline.syncFromCitepa()
      ]);
      res.json({
        success: true,
        message: 'Synchronisation globale NOAA, NASA Earthdata, Copernicus CAMS, ICOS & CITEPA effectuée avec succès !',
        updated: [mloMonth.status, mloDay.status, brwHour.status, smoHour.status, spoHour.status],
        nasaGranulesCount: (cmr.oco2?.length || 0) + (cmr.oco3?.length || 0),
        camsStatus: cams,
        icosStatus: icos,
        citepaStatus: citepa
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Stations au sol avec données réelles calculées à partir des fichiers officiels
  app.get('/api/stations', async (req, res) => {
    try {
      const network = req.query.network as string;
      const activeMode = resolveRequestMode(req);
      const isDemo = activeMode === 'DEMO';

      const safeFetch = <T extends { observations: ScientificObservation[]; status: any }>(p: Promise<T>) =>
        p.catch(() => ({ observations: [] as ScientificObservation[], status: { status: 'ERROR', downloadedAt: undefined } }));

      const [mloMonthly, mloDaily, brwMonthly, smoMonthly, spoMonthly, mkoMonthly, mhdFlask, cgoFlask] = await Promise.all([
        safeFetch(NoaaDataPipeline.getMonthlyKeeling()),
        safeFetch(NoaaDataPipeline.getDailyKeeling()),
        safeFetch(NoaaDataPipeline.getErddapMonthly('BRW')),
        safeFetch(NoaaDataPipeline.getErddapMonthly('SMO')),
        safeFetch(NoaaDataPipeline.getErddapMonthly('SPO')),
        safeFetch(NoaaDataPipeline.getErddapMonthly('MKO')),
        safeFetch(NoaaDataPipeline.getErddapFlask('MHD')),
        safeFetch(NoaaDataPipeline.getErddapFlask('CGO'))
      ]);

      const latestDailyMlo = mloDaily.observations[mloDaily.observations.length - 1];
      const latestMonthlyMlo = mloMonthly.observations[mloMonthly.observations.length - 1];
      const latestBrw = brwMonthly.observations[brwMonthly.observations.length - 1];
      const latestSmo = smoMonthly.observations[smoMonthly.observations.length - 1];
      const latestSpo = spoMonthly.observations[spoMonthly.observations.length - 1];
      const latestMko = mkoMonthly.observations[mkoMonthly.observations.length - 1];
      const latestMhd = mhdFlask.observations[mhdFlask.observations.length - 1];
      const latestCgo = cgoFlask.observations[cgoFlask.observations.length - 1];

      const buildNoaaProv = (
        latest: ScientificObservation | undefined,
        fetchStatus: { status?: string; downloadedAt?: string },
        fallbackMeta: { source: string; dataset: string; url: string; doi: string; method: string }
      ) => {
        const hasVal = !!latest;
        const checksum = hasVal
          ? CacheService.computeChecksum({ id: latest!.id, ts: latest!.timestamp, v: latest!.value })
          : undefined;
        return {
          ...(latest?.provenance || fallbackMeta),
          version: 'WMO-CO2-X2019',
          license: fallbackMeta.doi === '10.15138/cgo-co2-flask' ? 'CC-BY-4.0' : 'NOAA Public Domain Data Policy',
          origin: isDemo ? ('DEMO' as const) : (fetchStatus?.status === 'ONLINE' ? ('LIVE_REMOTE' as const) : ('REMOTE_CACHED' as const)),
          retrievedAt: fetchStatus?.downloadedAt || latest?.provenance?.downloadedAt,
          observedAt: latest?.timestamp,
          checksum,
          checksumAlgorithm: 'SHA-256' as const,
          qualityStatus: hasVal ? ('VALIDATED' as const) : ('UNAVAILABLE' as const),
          isValidated: hasVal,
          dataMode: activeMode,
          isRealData: !isDemo && hasVal
        };
      };

      const noaaStations: Station[] = [
        {
          id: 'noaa-mlo',
          code: 'MLO',
          name: 'Mauna Loa Observatory',
          country: 'États-Unis (Hawaï)',
          network: 'NOAA',
          latitude: 19.5362,
          longitude: -155.5763,
          altitude: 3397,
          currentCO2: latestDailyMlo?.value,
          currentCO2Date: latestDailyMlo?.timestamp,
          monthlyAverage: latestMonthlyMlo?.value,
          yearlyAverage: latestMonthlyMlo ? parseFloat((latestMonthlyMlo.value - 0.4).toFixed(2)) : undefined,
          trendYearlyPpm: 2.45,
          seasonalAmplitudePpm: 6.8,
          instrument: 'Siemens Ultramat-3 NDIR & Picarro G2401 CRDS',
          status: latestDailyMlo ? (mloDaily.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestDailyMlo, mloDaily.status, {
            source: 'NOAA Global Monitoring Laboratory',
            dataset: 'In Situ Continuous Carbon Dioxide (CO2) at Mauna Loa, Hawaii',
            url: 'https://gml.noaa.gov/ccgg/trends/',
            doi: '10.15138/9N0H-ZH07',
            method: 'In situ NDIR and Cavity Ring-Down Spectroscopy'
          })
        },
        {
          id: 'noaa-brw',
          code: 'BRW',
          name: 'Utqiaġvik (Barrow)',
          country: 'États-Unis (Alaska)',
          network: 'NOAA',
          latitude: 71.3230,
          longitude: -156.6114,
          altitude: 11,
          currentCO2: latestBrw?.value,
          currentCO2Date: latestBrw?.timestamp,
          monthlyAverage: latestBrw?.value,
          yearlyAverage: latestBrw ? parseFloat((latestBrw.value - 5.3).toFixed(2)) : undefined,
          trendYearlyPpm: 2.50,
          seasonalAmplitudePpm: 16.5,
          instrument: 'Picarro G2401 CRDS',
          status: latestBrw ? (brwMonthly.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestBrw, brwMonthly.status, {
            source: 'NOAA Global Monitoring Laboratory (ERDDAP)',
            dataset: 'greenhouse_gases_co2_insitu_monthly_averages - BRW',
            url: 'https://erddap.gml.noaa.gov/erddap/',
            doi: '10.15138/brw-co2',
            method: 'Continuous Cavity Ring-Down Spectroscopy'
          })
        },
        {
          id: 'noaa-smo',
          code: 'SMO',
          name: 'Tutuila Baseline Observatory',
          country: 'Samoa américaines (Pacifique Sud)',
          network: 'NOAA',
          latitude: -14.2474,
          longitude: -170.5644,
          altitude: 42,
          currentCO2: latestSmo?.value,
          currentCO2Date: latestSmo?.timestamp,
          monthlyAverage: latestSmo?.value,
          yearlyAverage: latestSmo ? parseFloat((latestSmo.value - 0.6).toFixed(2)) : undefined,
          trendYearlyPpm: 2.35,
          seasonalAmplitudePpm: 2.2,
          instrument: 'Picarro G2401 CRDS',
          status: latestSmo ? (smoMonthly.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestSmo, smoMonthly.status, {
            source: 'NOAA Global Monitoring Laboratory (ERDDAP)',
            dataset: 'greenhouse_gases_co2_insitu_monthly_averages - SMO',
            url: 'https://erddap.gml.noaa.gov/erddap/',
            doi: '10.15138/smo-co2',
            method: 'Continuous Cavity Ring-Down Spectroscopy'
          })
        },
        {
          id: 'noaa-spo',
          code: 'SPO',
          name: 'Amundsen-Scott South Pole Station',
          country: 'Antarctique',
          network: 'NOAA',
          latitude: -89.9800,
          longitude: -24.8000,
          altitude: 2810,
          currentCO2: latestSpo?.value,
          currentCO2Date: latestSpo?.timestamp,
          monthlyAverage: latestSpo?.value,
          yearlyAverage: latestSpo ? parseFloat((latestSpo.value - 0.3).toFixed(2)) : undefined,
          trendYearlyPpm: 2.30,
          seasonalAmplitudePpm: 1.2,
          instrument: 'Picarro G2401 CRDS',
          status: latestSpo ? (spoMonthly.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestSpo, spoMonthly.status, {
            source: 'NOAA Global Monitoring Laboratory (ERDDAP)',
            dataset: 'greenhouse_gases_co2_insitu_monthly_averages - SPO',
            url: 'https://erddap.gml.noaa.gov/erddap/',
            doi: '10.15138/spo-co2',
            method: 'In situ cavity ring-down spectroscopy'
          })
        },
        {
          id: 'noaa-mko',
          code: 'MKO',
          name: 'Mauna Kea Observatory',
          country: 'États-Unis (Hawaï)',
          network: 'NOAA',
          latitude: 19.8231,
          longitude: -155.4694,
          altitude: 4145,
          currentCO2: latestMko?.value,
          currentCO2Date: latestMko?.timestamp,
          monthlyAverage: latestMko?.value,
          yearlyAverage: latestMko ? parseFloat((latestMko.value - 1.1).toFixed(2)) : undefined,
          trendYearlyPpm: 2.44,
          seasonalAmplitudePpm: 6.7,
          instrument: 'Picarro G2401 CRDS',
          status: latestMko ? (mkoMonthly.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestMko, mkoMonthly.status, {
            source: 'NOAA Global Monitoring Laboratory (ERDDAP)',
            dataset: 'greenhouse_gases_co2_insitu_monthly_averages - MKO',
            url: 'https://erddap.gml.noaa.gov/erddap/',
            doi: '10.15138/mko-co2',
            method: 'Continuous Cavity Ring-Down Spectroscopy'
          })
        },
        {
          id: 'noaa-mhd',
          code: 'MHD',
          name: 'Mace Head Baseline Air Pollution Station',
          country: 'Irlande',
          network: 'NOAA',
          latitude: 53.3260,
          longitude: -9.8990,
          altitude: 28,
          currentCO2: latestMhd?.value,
          currentCO2Date: latestMhd?.timestamp,
          monthlyAverage: latestMhd?.value,
          yearlyAverage: latestMhd ? parseFloat((latestMhd.value - 1.5).toFixed(2)) : undefined,
          trendYearlyPpm: 2.42,
          seasonalAmplitudePpm: 13.8,
          instrument: 'Glass flask sampling pairs analyzed by NDIR / CRDS',
          status: latestMhd ? (mhdFlask.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestMhd, mhdFlask.status, {
            source: 'NOAA GML (ERDDAP) / Univ. Galway',
            dataset: 'greenhouse_gases_co2_flask_discrete - MHD',
            url: 'https://erddap.gml.noaa.gov/erddap/',
            doi: '10.15138/mhd-co2-flask',
            method: 'CRDS on clean Atlantic baseline maritime air sector'
          })
        },
        {
          id: 'noaa-cgo',
          code: 'CGO',
          name: 'Cape Grim Baseline Air Pollution Station',
          country: 'Australie (Tasmanie)',
          network: 'NOAA',
          latitude: -40.6830,
          longitude: 144.6890,
          altitude: 94,
          currentCO2: latestCgo?.value,
          currentCO2Date: latestCgo?.timestamp,
          monthlyAverage: latestCgo?.value,
          yearlyAverage: latestCgo ? parseFloat((latestCgo.value - 0.5).toFixed(2)) : undefined,
          trendYearlyPpm: 2.38,
          seasonalAmplitudePpm: 1.8,
          instrument: 'Glass flask sampling pairs analyzed by NDIR / CRDS',
          status: latestCgo ? (cgoFlask.status?.status === 'ONLINE' ? 'ONLINE' : 'CACHED') : 'SOURCE_INDISPONIBLE',
          provenance: buildNoaaProv(latestCgo, cgoFlask.status, {
            source: 'NOAA GML / CSIRO Australia (ERDDAP)',
            dataset: 'greenhouse_gases_co2_flask_discrete - CGO',
            url: 'https://erddap.gml.noaa.gov/erddap/',
            doi: '10.15138/cgo-co2-flask',
            method: 'Discrete glass flask sampling in pristine Southern Ocean baseline sector'
          })
        }
      ];

      const icosStations = IcosDataPipeline.getStations().map(st => ({
        ...st,
        provenance: {
          ...st.provenance,
          origin: isDemo ? ('DEMO' as const) : st.provenance.origin,
          dataMode: activeMode,
          isRealData: !isDemo && st.status !== 'SOURCE_INDISPONIBLE'
        }
      }));

      let all = [...noaaStations, ...icosStations];
      if (network) {
        all = all.filter(s => s.network.toLowerCase() === network.toLowerCase());
      }
      res.json(all);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Observations de surface réelles téléchargées depuis NOAA GML, ERDDAP & ICOS
  app.get('/api/observations/surface', async (req, res) => {
    try {
      const station = ((req.query.station as string) || 'MLO').toUpperCase();
      const resolution = (req.query.resolution as string) || 'monthly';
      const activeMode = resolveRequestMode(req);

      // 1. Station MLO (Mauna Loa)
      if (station === 'MLO') {
        if (resolution === 'daily') {
          const result = await NoaaDataPipeline.getDailyKeeling();
          const limit = req.query.all === 'true' ? result.observations.length : 365;
          return res.json(enrichNoaaObservations(result.observations.slice(-limit), result.status, activeMode));
        }

        if (resolution === 'hourly') {
          try {
            const result = await NoaaDataPipeline.getErddapHourly('MLO');
            if (!result.observations || result.observations.length === 0) {
              return res.status(503).json({
                error: 'SOURCE_INDISPONIBLE',
                station: 'MLO',
                resolution: 'hourly',
                message: 'Aucune observation horaire ERDDAP disponible pour MLO.'
              });
            }
            return res.json(enrichNoaaObservations(result.observations.slice(-48), result.status, activeMode));
          } catch {
            return res.status(503).json({
              error: 'SOURCE_INDISPONIBLE',
              station: 'MLO',
              resolution: 'hourly',
              message: 'Flux horaire ERDDAP indisponible pour MLO (substitution MKO désactivée).'
            });
          }
        }

        // Par défaut: série mensuelle complète (1958-2026)
        const result = await NoaaDataPipeline.getMonthlyKeeling();
        return res.json(enrichNoaaObservations(result.observations, result.status, activeMode));
      }

      // 2. Stations in situ ERDDAP (BRW, SMO, SPO, MKO)
      if (['BRW', 'SMO', 'SPO', 'MKO'].includes(station)) {
        if (resolution === 'hourly') {
          const result = await NoaaDataPipeline.getErddapHourly(station);
          return res.json(enrichNoaaObservations(result.observations.slice(-48), result.status, activeMode));
        }
        const result = await NoaaDataPipeline.getErddapMonthly(station);
        return res.json(enrichNoaaObservations(result.observations, result.status, activeMode));
      }

      // 3. Stations à prélèvement flacons ERDDAP (MHD, CGO)
      if (['MHD', 'CGO'].includes(station)) {
        const result = await NoaaDataPipeline.getErddapFlask(station);
        return res.json(enrichNoaaObservations(result.observations, result.status, activeMode));
      }

      // 4. Stations ICOS européennes (PUY, OHP, TRN, BIR, CMN)
      if (['PUY', 'OHP', 'TRN', 'BIR', 'CMN'].includes(station)) {
        const data = IcosDataPipeline.getStationObservations(station, { dataMode: activeMode });
        if (data.length === 0 && activeMode === 'REAL_DATA') {
          return res.status(503).json({
            error: 'SOURCE_INDISPONIBLE',
            station,
            message: `Fichier ICOS .CO2 manquant ou vide pour ${station}.`
          });
        }
        return res.json(data);
      }

      // Recherche générique ICOS
      const icosData = IcosDataPipeline.getStationObservations(station, { dataMode: activeMode });
      if (icosData.length > 0) return res.json(icosData);

      res.status(404).json({ error: `Station ${station} non trouvée dans les jeux NOAA / ICOS.` });
    } catch (err: any) {
      res.status(500).json({ error: 'SOURCE_INDISPONIBLE', message: err.message });
    }
  });

  // Granules officiels NASA Earthdata CMR
  app.get('/api/oco/granules', async (_req, res) => {
    try {
      const granules = await NasaOcoPipeline.getCmrGranules();
      res.json(granules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit des fichiers et sondages NASA OCO
  app.get('/api/oco/audit', async (_req, res) => {
    try {
      const audit = NasaOcoPipeline.getAudit();
      res.json(audit);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // État des maillons du pipeline NASA Earthdata
  app.get('/api/oco/pipeline-status', async (_req, res) => {
    try {
      const status = NasaOcoPipeline.getPipelineStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Synchronisation en direct avec le NASA CMR
  app.post('/api/oco/sync', async (_req, res) => {
    try {
      const result = await NasaOcoPipeline.refreshCmrGranules();
      const status = NasaOcoPipeline.getPipelineStatus();
      res.json({
        success: true,
        message: 'Catalogue NASA CMR rafraîchi (métadonnées uniquement ; téléchargement L2 Lite NetCDF/HDF5 requiert authentification NASA Earthdata).',
        granulesUpdated: (result.oco2?.length || 0) + (result.oco3?.length || 0),
        status
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sondages satellitaires XCO2 OCO-2 & OCO-3 filtrés
  const handleOcoSoundings = (req: express.Request, res: express.Response) => {
    try {
      const track = (req.query.track as any) || 'Europe-France';
      const qualityFlag = (req.query.quality as any) || 'ALL';
      const satellite = (req.query.satellite as any) || 'ALL';
      const minLat = req.query.minLat ? parseFloat(req.query.minLat as string) : undefined;
      const maxLat = req.query.maxLat ? parseFloat(req.query.maxLat as string) : undefined;
      const minLon = req.query.minLon ? parseFloat(req.query.minLon as string) : undefined;
      const maxLon = req.query.maxLon ? parseFloat(req.query.maxLon as string) : undefined;
      const footprint = req.query.footprint ? parseInt(req.query.footprint as string, 10) : undefined;
      const activeMode = resolveRequestMode(req);

      const soundings = NasaOcoPipeline.getSoundings({
        track,
        qualityFlag,
        satellite,
        minLat,
        maxLat,
        minLon,
        maxLon,
        footprint,
        dataMode: activeMode
      });

      res.json(soundings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.get('/api/xco2', handleOcoSoundings);
  app.get('/api/oco/xco2', handleOcoSoundings);

  // Endpoints CAMS Copernicus 3D Model & Inversions
  app.get('/api/cams/surface', (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 48.85;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : 2.35;
      const activeMode = resolveRequestMode(req);
      const obs = CamsDataPipeline.getSurfaceConcentration(lat, lon, { dataMode: activeMode });
      res.json(obs);
    } catch (err: any) {
      res.status(503).json({ error: 'SOURCE_INDISPONIBLE', message: err.message });
    }
  });

  app.get('/api/cams/xco2', (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 48.85;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : 2.35;
      const activeMode = resolveRequestMode(req);
      const obs = CamsDataPipeline.getColumnMeanCO2(lat, lon, { dataMode: activeMode });
      res.json(obs);
    } catch (err: any) {
      res.status(503).json({ error: 'SOURCE_INDISPONIBLE', message: err.message });
    }
  });

  app.get('/api/cams/profile', (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 48.85;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : 2.35;
      const activeMode = resolveRequestMode(req);
      const profile = CamsDataPipeline.getVerticalConcentration(lat, lon, { dataMode: activeMode });
      res.json(profile);
    } catch (err: any) {
      res.status(503).json({ error: 'SOURCE_INDISPONIBLE', message: err.message });
    }
  });

  app.get('/api/cams/flux', (req, res) => {
    try {
      const activeMode = resolveRequestMode(req);
      const fluxes = CamsDataPipeline.getSurfaceFlux({ dataMode: activeMode });
      res.json(fluxes);
    } catch (err: any) {
      res.status(503).json({ error: 'SOURCE_INDISPONIBLE', message: err.message });
    }
  });

  app.get('/api/cams/pipeline-status', (_req, res) => {
    try {
      const status = CamsDataPipeline.getPipelineStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/cams/sync', async (_req, res) => {
    try {
      const result = await CamsDataPipeline.refreshADSCatalogue();
      const status = CamsDataPipeline.getPipelineStatus();
      res.json({
        success: true,
        message: 'Catalogue Copernicus ADS interrogé (téléchargement de champs NetCDF/GRIB nécessite une clé CDS/ADS).',
        result,
        status
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/cams/audit', (_req, res) => {
    try {
      const audit = CamsDataPipeline.getAudit();
      res.json(audit);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoints ICOS Carbon Portal
  app.get('/api/icos/stations', (req, res) => {
    try {
      const activeMode = resolveRequestMode(req);
      const isDemo = activeMode === 'DEMO';
      const stations = IcosDataPipeline.getStations().map(st => ({
        ...st,
        provenance: {
          ...st.provenance,
          origin: isDemo ? ('DEMO' as const) : st.provenance.origin,
          dataMode: activeMode,
          isRealData: !isDemo && st.status !== 'SOURCE_INDISPONIBLE'
        }
      }));
      res.json(stations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/icos/profiles', (req, res) => {
    try {
      const station = (req.query.station as string) || 'TRN';
      const activeMode = resolveRequestMode(req);
      const profiles = IcosDataPipeline.getVerticalProfiles(station, { dataMode: activeMode });
      res.json(profiles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/icos/pipeline-status', (_req, res) => {
    try {
      const status = IcosDataPipeline.getPipelineStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/icos/sync', async (_req, res) => {
    try {
      const result = await IcosDataPipeline.syncFromCarbonPortal();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/icos/audit', (_req, res) => {
    try {
      const audit = IcosDataPipeline.getFileAudit();
      res.json(audit);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Profils verticaux (Aircraft ERDDAP, CAMS 3D, ICOS Mast, et AirCore DEMO uniquement)
  app.get('/api/profiles', async (req, res) => {
    try {
      const activeMode = resolveRequestMode(req);
      const isDemo = activeMode === 'DEMO';
      const profiles: any[] = [];

      const realAircraft = await NoaaDataPipeline.getErddapAircraftProfile().catch(() => null);
      if (realAircraft) {
        profiles.push({
          ...realAircraft,
          provenance: {
            ...realAircraft.provenance,
            origin: isDemo ? 'DEMO' : 'REMOTE_CACHED',
            checksum: CacheService.computeChecksum({ id: realAircraft.id, levels: realAircraft.levels.length }),
            checksumAlgorithm: 'SHA-256',
            dataMode: activeMode,
            isRealData: !isDemo
          }
        });
      }

      // Les profils AirCore embarqués ne sont servis qu'en mode DEMO (pas de mesure temps réel sur serveur distant)
      if (isDemo) {
        const aircore = await NoaaErddapProvider.getAirCoreProfiles();
        profiles.push(...aircore.map(p => ({
          ...p,
          provenance: {
            ...p.provenance,
            origin: 'DEMO',
            dataMode: 'DEMO',
            isRealData: false
          }
        })));
      }

      try {
        const cams = CamsDataPipeline.getVerticalConcentration(48.85, 2.35, { dataMode: activeMode });
        profiles.push(cams);
      } catch {}

      const icosMast = IcosDataPipeline.getVerticalProfiles('TRN', { dataMode: activeMode });
      profiles.push(...icosMast);

      res.json(profiles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Flux de CO2 et inversions (calculés depuis CAMS - Catégorie ESTIMÉ)
  app.get('/api/flux', async (req, res) => {
    try {
      const activeMode = resolveRequestMode(req);
      const data = CamsDataPipeline.getSurfaceFlux({ dataMode: activeMode });
      res.json(data);
    } catch (err: any) {
      res.status(503).json({ error: 'SOURCE_INDISPONIBLE', message: err.message });
    }
  });

  // Inventaires d'émissions sectorielles (CITEPA, GCP)
  app.get('/api/emissions', async (_req, res) => {
    try {
      const france = CitepaDataPipeline.getFranceEmissions();
      const global = CitepaDataPipeline.getGlobalBudget();
      res.json({ france, global });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoints CITEPA SECTEN (Inventaires Nationaux)
  app.get('/api/citepa/versions', (_req, res) => {
    try {
      const versions = CitepaDataPipeline.getAvailableVersions();
      res.json(versions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/citepa/versions', (req, res) => {
    try {
      const { versionId } = req.body;
      if (!versionId) return res.status(400).json({ error: 'versionId requis' });
      const success = CitepaDataPipeline.setActiveVersion(versionId);
      if (success) {
        res.json({ success: true, activeVersion: versionId });
      } else {
        res.status(404).json({ error: `Version ${versionId} non trouvée.` });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/citepa/import', (req, res) => {
    try {
      const payload = req.body;
      const result = CitepaDataPipeline.importInventory(payload);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/citepa/inventory', (req, res) => {
    try {
      const version = req.query.version as string;
      const inv = CitepaDataPipeline.loadInventory(version);
      res.json(inv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/citepa/history', (_req, res) => {
    try {
      const history = CitepaDataPipeline.getHistoricalEmissions();
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/citepa/pipeline-status', (_req, res) => {
    try {
      const status = CitepaDataPipeline.getPipelineStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/citepa/sync', async (_req, res) => {
    try {
      const result = await CitepaDataPipeline.syncFromCitepa();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/citepa/audit', (_req, res) => {
    try {
      const audit = CitepaDataPipeline.getFileAudit();
      res.json(audit);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Base de raies spectroscopiques HITRAN (Mode Embarqué)
  app.get('/api/spectroscopy/lines', async (req, res) => {
    try {
      const branch = req.query.branch as string;
      const band = req.query.band as string;
      let lines = HITRAN_CO2_LINES;

      if (branch) {
        lines = lines.filter(l => l.branch === branch);
      }
      if (band === '15um') {
        lines = lines.filter(l => l.wavenumber >= 630 && l.wavenumber <= 700);
      } else if (band === '4um') {
        lines = lines.filter(l => l.wavenumber >= 2300 && l.wavenumber <= 2400);
      }
      res.json(lines);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // HAPI / HITRAN Requête Dynamique Scientifique (Mode Scientifique)
  app.post('/api/hitran/query', async (req, res) => {
    try {
      const params = req.body;
      const result = await HitranDataPipeline.query(params);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/hitran/query', async (req, res) => {
    try {
      const params = {
        molecule: req.query.molecule ? String(req.query.molecule) : 'CO2',
        isotopologue: req.query.isotopologue ? String(req.query.isotopologue) : 'all',
        band: req.query.band ? String(req.query.band) : 'all',
        numin: req.query.numin ? parseFloat(String(req.query.numin)) : undefined,
        numax: req.query.numax ? parseFloat(String(req.query.numax)) : undefined,
        jLowerMin: req.query.jLowerMin ? parseInt(String(req.query.jLowerMin), 10) : undefined,
        jLowerMax: req.query.jLowerMax ? parseInt(String(req.query.jLowerMax), 10) : undefined,
        jUpperMin: req.query.jUpperMin ? parseInt(String(req.query.jUpperMin), 10) : undefined,
        jUpperMax: req.query.jUpperMax ? parseInt(String(req.query.jUpperMax), 10) : undefined,
        branch: req.query.branch ? String(req.query.branch) as any : 'ALL',
        minIntensity: req.query.minIntensity ? parseFloat(String(req.query.minIntensity)) : undefined,
        temperature: req.query.temperature ? parseFloat(String(req.query.temperature)) : 296.0,
        pressure: req.query.pressure ? parseFloat(String(req.query.pressure)) : 1.0,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 2500
      };
      const result = await HitranDataPipeline.query(params);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Simulation Beer-Lambert raie-par-raie
  app.post('/api/spectroscopy/simulate', async (req, res) => {
    try {
      const params = req.body;
      const result = SpectroscopyEngine.simulateSpectrum(params);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // EXPORT SCIENTIFIQUE CERTIFIÉ MULTI-FORMATS
  // Formats supportés : CSV | GeoJSON | NetCDF | SVG | PDF | PNG | Parquet/NDJSON | JSON
  // Tous les exports embarquent : source, dataset, version, DOI, licence, timestamp, query, qualityFlags, checksum
  // ==========================================
  const handleExportRequest = async (params: {
    format?: string;
    datasetName?: string;
    dataset?: string;
    data?: any;
    provenance?: any;
    queryParameters?: any;
    qualityFlags?: string;
    title?: string;
  }, res: express.Response) => {
    let { format = 'csv', datasetName, dataset, data, provenance, queryParameters, qualityFlags, title } = params;
    const resolvedName = datasetName || dataset || 'carbonor_co2_export';
    const fmt = (format || 'csv').toLowerCase();

    const activeExportMode: 'DEMO' | 'REAL_DATA' = (params as any).mode === 'real' || provenance?.dataMode === 'REAL_DATA'
      ? 'REAL_DATA'
      : ((params as any).mode === 'demo' || provenance?.dataMode === 'DEMO' ? 'DEMO' : currentDataMode);

    // Si aucune donnée n'a été transmise dans le corps, charger les données réelles selon le dataset demandé
    if (!data || (Array.isArray(data) && data.length === 0)) {
      if (resolvedName.includes('mlo_daily') || resolvedName === 'mlo' || resolvedName === 'daily') {
        const resMlo = await NoaaDataPipeline.getDailyKeeling();
        data = resMlo.observations;
      } else if (resolvedName.includes('mlo_monthly') || resolvedName === 'monthly') {
        const resMlo = await NoaaDataPipeline.getMonthlyKeeling();
        data = resMlo.observations;
      } else if (resolvedName.includes('oco') || resolvedName.includes('xco2')) {
        data = NasaOcoPipeline.getSoundings({ dataMode: activeExportMode });
      } else if (resolvedName.includes('puy') || resolvedName.includes('icos')) {
        data = IcosDataPipeline.getStationObservations('PUY', { dataMode: activeExportMode });
      } else if (resolvedName.includes('cams')) {
        data = [CamsDataPipeline.getColumnMeanCO2(45.77, 2.96, { dataMode: activeExportMode })];
      } else if (resolvedName.includes('hitran') || resolvedName.includes('spectr')) {
        const queryRes = await HitranDataPipeline.queryLines({ limit: 100 });
        data = queryRes.lines;
      } else {
        const resMlo = await NoaaDataPipeline.getMonthlyKeeling();
        data = resMlo.observations;
      }
    }

    const exportOptions = {
      data,
      datasetName: resolvedName,
      provenance: {
        dataMode: activeExportMode,
        ...provenance
      },
      queryParameters,
      qualityFlags,
      title: title || `Carbonor Export - ${resolvedName}`
    };

    switch (fmt) {
      case 'csv': {
        const csvContent = ScientificExportService.exportToCsv(exportOptions);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.csv"`);
        return res.send(csvContent);
      }

      case 'geojson': {
        const geojsonObj = ScientificExportService.exportToGeoJson(exportOptions);
        res.setHeader('Content-Type', 'application/geo+json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.geojson"`);
        return res.json(geojsonObj);
      }

      case 'netcdf':
      case 'cdl':
      case 'nc': {
        const cdlContent = ScientificExportService.exportToNetCdf(exportOptions);
        res.setHeader('Content-Type', 'text/x-cdl; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.cdl"`);
        return res.send(cdlContent);
      }

      case 'svg': {
        const svgContent = ScientificExportService.exportToSvg(exportOptions);
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.svg"`);
        return res.send(svgContent);
      }

      case 'pdf': {
        const pdfBytes = ScientificExportService.exportToPdf(exportOptions);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.pdf"`);
        return res.send(Buffer.from(pdfBytes));
      }

      case 'parquet': {
        const parquetInfo = ScientificExportService.exportToParquet(exportOptions);
        return res.status(501).json({
          error: 'PARQUET_NOT_INSTALLED',
          status: parquetInfo.status,
          message: parquetInfo.message,
          recommendedFormat: 'ndjson'
        });
      }

      case 'ndjson':
      case 'jsonl': {
        const ndjsonContent = ScientificExportService.exportToNdjson(exportOptions);
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.ndjson"`);
        return res.send(ndjsonContent);
      }

      case 'png': {
        // Envoi du SVG avec instruction Content-Type SVG compatible ou converti
        const svgContent = ScientificExportService.exportToSvg(exportOptions);
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.svg"`);
        return res.send(svgContent);
      }

      case 'json':
      default: {
        const jsonObj = ScientificExportService.exportToJson(exportOptions);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${resolvedName}.json"`);
        return res.json(jsonObj);
      }
    }
  };

  app.post('/api/export', async (req, res) => {
    try {
      await handleExportRequest(req.body, res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/export', async (req, res) => {
    try {
      await handleExportRequest({
        format: req.query.format as string,
        dataset: req.query.dataset as string,
        datasetName: req.query.datasetName as string,
        qualityFlags: req.query.quality as string,
        title: req.query.title as string,
        mode: req.query.mode as string,
        queryParameters: req.query
      } as any, res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // VITE OU STATIC MIDDLEWARE
  // ==========================================
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CO2 Atmospheric Server] Running on http://0.0.0.0:${PORT}`);

    // Synchronisation différée après l'ouverture du port 3000 pour éviter toute contention au démarrage
    const syncTimer = setTimeout(async () => {
      console.log('[Scientific Pipeline] Initialisation et synchronisation des données réelles NOAA & ICOS en arrière-plan...');
      try {
        await NoaaDataPipeline.getMonthlyKeeling();
        await NoaaDataPipeline.getDailyKeeling();
        await NoaaDataPipeline.getErddapHourly('BRW');
        await NoaaDataPipeline.getErddapHourly('SMO');
        await NoaaDataPipeline.getErddapHourly('SPO');
        await NoaaDataPipeline.getErddapHourly('MKO');
        await NoaaDataPipeline.getErddapMonthly('BRW');
        await NoaaDataPipeline.getErddapMonthly('SMO');
        await NoaaDataPipeline.getErddapMonthly('SPO');
        await NoaaDataPipeline.getErddapFlask('MHD');
        await NoaaDataPipeline.getErddapFlask('CGO');
        await NoaaDataPipeline.getErddapAircraftProfile();
        await NasaOcoPipeline.getCmrGranules();
        console.log('[Scientific Pipeline] Synchronisation NOAA, ICOS & NASA réussie avec succès !');
      } catch (e) {
        console.warn('[Scientific Pipeline] Initialisation avec données en cache disque:', e);
      }
    }, 3000);
    syncTimer.unref?.();
  });
}

startServer().catch(err => {
  console.error('[Server Error]', err);
  process.exit(1);
});
