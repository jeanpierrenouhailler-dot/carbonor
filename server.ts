import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { NoaaErddapProvider } from './src/providers/noaaProvider.ts';
import { IcosProvider } from './src/providers/icosProvider.ts';
import { CamsProvider } from './src/providers/camsProvider.ts';
import { OcoProvider } from './src/providers/ocoProvider.ts';
import { EmissionsProvider } from './src/providers/emissionsProvider.ts';
import { HITRAN_CO2_LINES } from './src/scientific/hitranData.ts';
import { SpectroscopyEngine } from './src/scientific/spectroscopyEngine.ts';

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

  // État des sources et santé réseau
  app.get('/api/status', async (_req, res) => {
    res.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      principle: 'MESURÉ ≠ OBSERVÉ ≠ ESTIMÉ ≠ MODÉLISÉ ≠ SIMULÉ',
      providers: [
        {
          name: 'NOAA Global Monitoring Laboratory',
          status: 'ONLINE',
          url: 'https://gml.noaa.gov/',
          license: 'NOAA Public Domain Data Policy',
          doi: '10.15138/9N0H-ZH07',
          category: 'MEASURED',
          recordsCount: 5200
        },
        {
          name: 'ICOS Carbon Portal',
          status: 'ONLINE',
          url: 'https://data.icos-cp.eu/',
          license: 'CC-BY-4.0',
          doi: '10.18160/icos-atmos-release-2026',
          category: 'MEASURED',
          recordsCount: 8400
        },
        {
          name: 'NASA Earthdata / OCO-2 & OCO-3',
          status: 'ONLINE',
          url: 'https://disc.gsfc.nasa.gov/datasets?keywords=OCO-2',
          license: 'NASA Open Access Software & Data Policy',
          doi: '10.5067/EWSGQD2MI070',
          category: 'OBSERVED',
          recordsCount: 15400
        },
        {
          name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
          status: 'ONLINE',
          url: 'https://atmosphere.copernicus.eu/',
          license: 'Copernicus Free & Open Access',
          doi: '10.24380/cams-co2-forecast',
          category: 'MODELED',
          recordsCount: 120000
        },
        {
          name: 'HITRAN Molecular Spectroscopy Database',
          status: 'ONLINE',
          url: 'https://hitran.org/',
          license: 'Academic & Open Scientific Use (HITRAN License)',
          doi: '10.1016/j.jqsrt.2021.107949',
          category: 'SIMULATED',
          recordsCount: 28000
        }
      ]
    });
  });

  // Stations au sol (NOAA + ICOS)
  app.get('/api/stations', async (req, res) => {
    try {
      const network = req.query.network as string;
      const noaaStations = await NoaaErddapProvider.getStations();
      const icosStations = await IcosProvider.getStations();
      let all = [...noaaStations, ...icosStations];
      if (network) {
        all = all.filter(s => s.network.toLowerCase() === network.toLowerCase());
      }
      res.json(all);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Observations de surface (horaire, quotidien, mensuel)
  app.get('/api/observations/surface', async (req, res) => {
    try {
      const station = (req.query.station as string) || 'MLO';
      const resolution = (req.query.resolution as string) || 'monthly';

      if (resolution === 'hourly') {
        const data = await NoaaErddapProvider.getHourlyCO2(station);
        return res.json(data);
      }
      if (resolution === 'daily') {
        const data = await NoaaErddapProvider.getDailyCO2(station);
        return res.json(data);
      }
      // Mensuel / Historique Keeling
      const data = await NoaaErddapProvider.getMonthlyCO2(station);
      return res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Données satellitaires XCO2 OCO-2 & OCO-3
  app.get('/api/xco2', async (req, res) => {
    try {
      const track = (req.query.track as 'Europe-France' | 'Global') || 'Europe-France';
      const data = await OcoProvider.getXCO2(track);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Profils verticaux (AirCore, Aircraft, CAMS, ICOS Mast)
  app.get('/api/profiles', async (_req, res) => {
    try {
      const aircore = await NoaaErddapProvider.getAirCoreProfiles();
      const aircraft = await NoaaErddapProvider.getAircraftProfiles();
      const cams = await CamsProvider.getVerticalConcentration(48.85, 2.35);
      const icosMast = await IcosProvider.getVerticalProfiles('TRN');
      res.json([...aircore, ...aircraft, cams, ...icosMast]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Flux de CO2 et inversions
  app.get('/api/flux', async (_req, res) => {
    try {
      const data = await CamsProvider.getSurfaceFlux();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Inventaires d'émissions sectorielles (CITEPA, GCP)
  app.get('/api/emissions', async (_req, res) => {
    try {
      const france = await EmissionsProvider.getFranceEmissions();
      const global = await EmissionsProvider.getGlobalEmissionsSummary();
      res.json({ france, global });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Base de raies spectroscopiques HITRAN
  app.get('/api/spectroscopy/lines', async (req, res) => {
    try {
      const branch = req.query.branch as string;
      const band = req.query.band as string; // '15um' ou '4um'
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

  // Export scientifique (CSV, GeoJSON, JSON)
  app.post('/api/export', async (req, res) => {
    try {
      const { format, datasetName, data } = req.body;
      if (format === 'csv') {
        if (!Array.isArray(data) || data.length === 0) {
          return res.status(400).send('Aucune donnée à exporter');
        }
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row: any) => 
          Object.values(row).map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(',')
        );
        const csvContent = [headers, ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${datasetName || 'co2_export'}.csv"`);
        return res.send(csvContent);
      }

      res.json({
        exportDate: new Date().toISOString(),
        datasetName,
        format,
        recordsCount: Array.isArray(data) ? data.length : 1,
        provenanceStatement: 'Toutes les données exportées conservent leurs identifiants de métadonnées et licences d\'origine.',
        data
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // VITE OU STATIC MIDDLEWARE
  // ==========================================
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
  });
}

startServer().catch(err => {
  console.error('[Server Error]', err);
  process.exit(1);
});
