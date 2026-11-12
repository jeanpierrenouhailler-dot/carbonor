import { describe, it, expect } from 'vitest';
import { ScientificExportService } from '../../src/services/scientificExportService';

describe('Service d’Exportation Scientifique Multi-Formats (ScientificExportService)', () => {
  const sampleObservations = [
    {
      id: 'mlo-2026-10-01',
      timestamp: '2026-10-01T00:00:00Z',
      value: 425.32,
      unit: 'ppm',
      uncertainty: 0.12,
      qualityFlag: '0',
      latitude: 19.5362,
      longitude: -155.5763,
      altitude: 3397,
      variable: 'co2_surface',
      provenance: {
        source: 'NOAA Global Monitoring Laboratory',
        dataset: 'co2_daily_mlo.txt',
        version: 'WMO-CO2-X2019',
        doi: '10.15138/9N0H-ZH07',
        license: 'NOAA Public Domain Data Policy',
        retrievedAt: '2026-10-04T21:37:00Z',
        quality: 'EXCELLENT',
        checksum: 'sha256:9f2c4e1a8b3d7c50'
      }
    },
    {
      id: 'mlo-2026-10-02',
      timestamp: '2026-10-02T00:00:00Z',
      value: 425.41,
      unit: 'ppm',
      uncertainty: 0.11,
      qualityFlag: '0',
      latitude: 19.5362,
      longitude: -155.5763,
      altitude: 3397,
      variable: 'co2_surface',
      provenance: {
        source: 'NOAA Global Monitoring Laboratory',
        dataset: 'co2_daily_mlo.txt',
        version: 'WMO-CO2-X2019',
        doi: '10.15138/9N0H-ZH07',
        license: 'NOAA Public Domain Data Policy',
        retrievedAt: '2026-10-04T21:37:00Z',
        quality: 'EXCELLENT',
        checksum: 'sha256:9f2c4e1a8b3d7c50'
      }
    }
  ];

  const exportOpts = {
    data: sampleObservations,
    datasetName: 'noaa_mlo_daily_co2',
    queryParameters: { station: 'MLO', resolution: 'daily' },
    qualityFlags: 'EXCELLENT (WMO Primary Standard)',
    title: 'Mesures quotidiennes de CO2 a Mauna Loa'
  };

  it('1. CSV : génère un en-tête commenté WMO/NOAA/ICOS embarquant toute la provenance', () => {
    const csv = ScientificExportService.exportToCsv(exportOpts);

    expect(csv).toContain('# CARBONOR SCIENTIFIC DATA EXPORT');
    expect(csv).toContain('# Source: NOAA Global Monitoring Laboratory');
    expect(csv).toContain('# Dataset: co2_daily_mlo.txt');
    expect(csv).toContain('# Version: WMO-CO2-X2019');
    expect(csv).toContain('# DOI: 10.15138/9N0H-ZH07');
    expect(csv).toContain('# Licence: NOAA Public Domain Data Policy');
    expect(csv).toContain('# Timestamp:');
    expect(csv).toContain('# Query:');
    expect(csv).toContain('# Quality Flags: EXCELLENT');
    expect(csv).toContain('# Checksum: sha256:9f2c4e1a8b3d7c50');
    expect(csv).toContain('value,unit,uncertainty,qualityFlag');
    expect(csv).toContain('425.32');
    expect(csv).toContain('425.41');
  });

  it('2. GeoJSON : génère une FeatureCollection RFC 7946 valide avec coordonnées et métadonnées', () => {
    const geojson = ScientificExportService.exportToGeoJson(exportOpts);

    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.metadata).toBeDefined();
    expect(geojson.metadata.source).toBe('NOAA Global Monitoring Laboratory');
    expect(geojson.metadata.dataset).toBe('co2_daily_mlo.txt');
    expect(geojson.metadata.version).toBe('WMO-CO2-X2019');
    expect(geojson.metadata.doi).toBe('10.15138/9N0H-ZH07');
    expect(geojson.metadata.license).toBe('NOAA Public Domain Data Policy');
    expect(geojson.metadata.checksum).toBe('sha256:9f2c4e1a8b3d7c50');

    expect(geojson.features).toHaveLength(2);
    const f1 = geojson.features[0];
    expect(f1.type).toBe('Feature');
    expect(f1.geometry.type).toBe('Point');
    expect(f1.geometry.coordinates).toEqual([-155.5763, 19.5362, 3397]);
    expect(f1.properties.value).toBe(425.32);
    expect(f1.properties.unit).toBe('ppm');
    expect(f1.properties.source).toBe('NOAA Global Monitoring Laboratory');
  });

  it('3. NetCDF : génère une structure CDL CF-1.8 valide avec attributs globaux obligatoires', () => {
    const cdl = ScientificExportService.exportToNetCdf(exportOpts);

    expect(cdl).toContain('netcdf noaa_mlo_daily_co2 {');
    expect(cdl).toContain('dimensions:');
    expect(cdl).toContain('time = 2 ;');
    expect(cdl).toContain('standard_name = "time"');
    expect(cdl).toContain('standard_name = "mole_fraction_of_carbon_dioxide_in_free_troposphere"');
    expect(cdl).toContain('units = "1e-6"');
    expect(cdl).toContain(':Conventions = "CF-1.8"');
    expect(cdl).toContain(':source = "NOAA Global Monitoring Laboratory"');
    expect(cdl).toContain(':dataset = "co2_daily_mlo.txt"');
    expect(cdl).toContain(':version = "WMO-CO2-X2019"');
    expect(cdl).toContain(':doi = "10.15138/9N0H-ZH07"');
    expect(cdl).toContain(':license = "NOAA Public Domain Data Policy"');
    expect(cdl).toContain(':cryptographic_checksum = "sha256:9f2c4e1a8b3d7c50"');
  });

  it('4. SVG : génère un graphique vectoriel autonome avec axes et cartouche métrologique complet', () => {
    const svg = ScientificExportService.exportToSvg(exportOpts);

    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('CARBONOR · OBSERVATOIRE SCIENTIFIQUE DU CO₂ ATMOSPHÉRIQUE');
    expect(svg).toContain('CARTOUCHE DE TRAÇABILITÉ SCIENTIFIQUE ISO/IEC 17025');
    expect(svg).toContain('Source :');
    expect(svg).toContain('NOAA Global Monitoring Laboratory');
    expect(svg).toContain('10.15138/9N0H-ZH07');
    expect(svg).toContain('sha256:9f2c4e1a8b3d7c50');
    expect(svg).toContain('<polyline');
    expect(svg).toContain('<metadata>');
    expect(svg).toContain('</svg>');
  });

  it('5. PDF : génère un flux binaire PDF 1.4 valide avec certificat métrologique et en-tête', () => {
    const pdfBytes = ScientificExportService.exportToPdf(exportOpts);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(500);

    const pdfString = new TextDecoder().decode(pdfBytes);
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString).toContain('/Type /Catalog');
    expect(pdfString).toContain('/Type /Pages');
    expect(pdfString).toContain('/Type /Page');
    expect(pdfString).toContain('RAPPORT SCIENTIFIQUE DE TRACABILITE ET AUDIT DES DONNEES');
    expect(pdfString).toContain('NOAA Global Monitoring Laboratory');
    expect(pdfString).toContain('10.15138/9N0H-ZH07');
    expect(pdfString).toContain('xref');
    expect(pdfString).toContain('%%EOF');
  });

  it('6. NDJSON & Parquet : génère un flux NDJSON conforme et documente le statut Parquet', () => {
    const ndjson = ScientificExportService.exportToNdjson(exportOpts);

    const lines = ndjson.split('\n');
    expect(lines.length).toBe(3); // 1 meta + 2 records

    const meta = JSON.parse(lines[0]);
    expect(meta._meta.format).toBe('NDJSON');
    expect(meta._meta.provenance.source).toBe('NOAA Global Monitoring Laboratory');
    expect(meta._meta.provenance.doi).toBe('10.15138/9N0H-ZH07');
    expect(meta._meta.provenance.checksum).toBe('sha256:9f2c4e1a8b3d7c50');

    const row1 = JSON.parse(lines[1]);
    expect(row1.value).toBe(425.32);

    const parquetInfo = ScientificExportService.exportToParquet(exportOpts);
    expect(parquetInfo.status).toBe('PARQUET_NOT_INSTALLED');
    expect(parquetInfo.ndjsonFallback).toBeDefined();
  });

  it('7. JSON : embarque l’objet racine provenance avec tous les 8 champs requis', () => {
    const json = ScientificExportService.exportToJson(exportOpts);

    expect(json.exportedAt).toBeDefined();
    expect(json.provenance).toBeDefined();
    expect(json.provenance.source).toBe('NOAA Global Monitoring Laboratory');
    expect(json.provenance.dataset).toBe('co2_daily_mlo.txt');
    expect(json.provenance.version).toBe('WMO-CO2-X2019');
    expect(json.provenance.doi).toBe('10.15138/9N0H-ZH07');
    expect(json.provenance.license).toBe('NOAA Public Domain Data Policy');
    expect(json.provenance.timestamp).toBeDefined();
    expect(json.provenance.query).toEqual({ station: 'MLO', resolution: 'daily' });
    expect(json.provenance.qualityFlags).toContain('EXCELLENT');
    expect(json.provenance.checksum).toBe('sha256:9f2c4e1a8b3d7c50');
    expect(json.data).toHaveLength(2);
  });

  it('8. Statuts et Traçabilité : intègre explicitement le MODE DÉMONSTRATION vs MODE DONNÉES RÉELLES', () => {
    // Mode Démonstration
    const demoCsv = ScientificExportService.exportToCsv({
      ...exportOpts,
      provenance: { dataMode: 'DEMO' }
    });
    expect(demoCsv).toContain('Statut: 🟡 MODE DÉMONSTRATION — Données d\'exemple / fixtures scientifiques embarquées.');

    const demoGeoJson = ScientificExportService.exportToGeoJson({
      ...exportOpts,
      provenance: { dataMode: 'DEMO' }
    });
    expect(demoGeoJson.metadata.dataMode).toBe('DEMO');
    expect(demoGeoJson.metadata.dataModeLabel).toContain('MODE DÉMONSTRATION');

    // Mode Données Réelles
    const realCsv = ScientificExportService.exportToCsv({
      ...exportOpts,
      provenance: { dataMode: 'REAL_DATA' }
    });
    expect(realCsv).toContain('Statut: 🟢 MODE DONNÉES RÉELLES — Données récupérées auprès de la source officielle.');

    const realCdl = ScientificExportService.exportToNetCdf({
      ...exportOpts,
      provenance: { dataMode: 'REAL_DATA' }
    });
    expect(realCdl).toContain(':data_mode = "REAL_DATA" ;');
    expect(realCdl).toContain(':data_mode_label = "🟢 MODE DONNÉES RÉELLES" ;');
  });
});
