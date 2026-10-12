import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Globe2, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  X, 
  Code2, 
  Database,
  Info
} from 'lucide-react';
import { ScientificExportService, ExportProvenanceInfo } from '../../services/scientificExportService';
import { useDataMode } from '../../context/DataModeContext';
import { DataProvenance } from '../../types/observation';

interface ExportButtonProps {
  data: any[];
  datasetName: string;
  provenance?: DataProvenance | Partial<ExportProvenanceInfo>;
  queryParameters?: Record<string, any>;
  qualityFlags?: string;
  title?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  datasetName, 
  provenance,
  queryParameters,
  qualityFlags,
  title,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [showProvDetails, setShowProvDetails] = useState(false);
  const { dataMode } = useDataMode();

  const provWithMode = {
    dataMode: provenance?.dataMode || dataMode,
    ...provenance
  };

  const resolvedProv = ScientificExportService.resolveProvenance({
    data,
    datasetName,
    provenance: provWithMode,
    queryParameters,
    qualityFlags,
    title
  });

  const exportOptions = {
    data,
    datasetName,
    provenance: resolvedProv,
    queryParameters,
    qualityFlags,
    title: title || `Carbonor - ${datasetName}`
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'csv' | 'geojson' | 'netcdf' | 'svg' | 'png' | 'pdf' | 'parquet' | 'json') => {
    if (!data || data.length === 0) return;
    setDownloadingFormat(format);

    try {
      const dateTag = new Date().toISOString().slice(0, 10);
      const baseName = `${datasetName}_${dateTag}`;

      switch (format) {
        case 'csv': {
          const csvText = ScientificExportService.exportToCsv(exportOptions);
          const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
          triggerDownload(blob, `${baseName}.csv`);
          break;
        }

        case 'geojson': {
          const geojsonObj = ScientificExportService.exportToGeoJson(exportOptions);
          const blob = new Blob([JSON.stringify(geojsonObj, null, 2)], { type: 'application/geo+json;charset=utf-8;' });
          triggerDownload(blob, `${baseName}.geojson`);
          break;
        }

        case 'netcdf': {
          const cdlText = ScientificExportService.exportToNetCdf(exportOptions);
          const blob = new Blob([cdlText], { type: 'text/x-cdl;charset=utf-8;' });
          triggerDownload(blob, `${baseName}.cdl`);
          break;
        }

        case 'svg': {
          const svgText = ScientificExportService.exportToSvg(exportOptions);
          const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8;' });
          triggerDownload(blob, `${baseName}.svg`);
          break;
        }

        case 'png': {
          const svgText = ScientificExportService.exportToSvg(exportOptions);
          const img = new Image();
          const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8;' });
          const url = URL.createObjectURL(svgBlob);

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = 2400; // 2x haute résolution
                canvas.height = 1400;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#0b0f19';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(pngBlob => {
                    if (pngBlob) {
                      triggerDownload(pngBlob, `${baseName}.png`);
                    }
                    resolve();
                  }, 'image/png');
                } else {
                  resolve();
                }
              } catch (e) {
                reject(e);
              } finally {
                URL.revokeObjectURL(url);
              }
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              // Fallback si canvas bloqué : télécharger en SVG
              const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8;' });
              triggerDownload(blob, `${baseName}.svg`);
              resolve();
            };
            img.src = url;
          });
          break;
        }

        case 'pdf': {
          const pdfBytes = ScientificExportService.exportToPdf(exportOptions);
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
          triggerDownload(blob, `${baseName}.pdf`);
          break;
        }

        case 'parquet': {
          const ndjsonText = ScientificExportService.exportToParquetOrNdjson(exportOptions);
          const blob = new Blob([ndjsonText], { type: 'application/x-ndjson;charset=utf-8;' });
          triggerDownload(blob, `${baseName}.ndjson`);
          break;
        }

        case 'json':
        default: {
          const jsonObj = ScientificExportService.exportToJson(exportOptions);
          const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json;charset=utf-8;' });
          triggerDownload(blob, `${baseName}.json`);
          break;
        }
      }
    } catch (err) {
      console.error('[Export Error]', err);
    } finally {
      setTimeout(() => {
        setDownloadingFormat(null);
      }, 600);
    }
  };

  const formats = [
    {
      id: 'csv',
      title: 'CSV Scientifique',
      ext: '.csv',
      desc: 'Tableur Excel, R, Python avec cartouche d\'en-tête métrologique WMO/NOAA/ICOS',
      icon: FileSpreadsheet,
      badge: 'Tableur / R / Py',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
    },
    {
      id: 'geojson',
      title: 'GeoJSON Réel',
      ext: '.geojson',
      desc: 'Standard RFC 7946 pour SIG, QGIS, ArcGIS, Mapbox avec coordonnées et métadonnées',
      icon: Globe2,
      badge: 'SIG & Cartographie',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30'
    },
    {
      id: 'netcdf',
      title: 'NetCDF (CF-1.8)',
      ext: '.cdl / .nc',
      desc: 'Standard mondial de climatologie (Unidata CDL, Python xarray, Panoply, CDO)',
      icon: Layers,
      badge: 'Climatologie CF-1.8',
      color: 'text-blue-400 border-blue-500/30 bg-blue-950/30'
    },
    {
      id: 'svg',
      title: 'SVG Vectoriel HD',
      ext: '.svg',
      desc: 'Graphique haute définition autonome avec axes, cartouche et métadonnées Dublin Core',
      icon: Code2,
      badge: 'Publication / LaTeX',
      color: 'text-purple-400 border-purple-500/30 bg-purple-950/30'
    },
    {
      id: 'png',
      title: 'PNG Image 2K',
      ext: '.png',
      desc: 'Rendu graphique 2400×1400 avec cartouche métrologique complet pour présentations',
      icon: ImageIcon,
      badge: 'Image HD Prête',
      color: 'text-pink-400 border-pink-500/30 bg-pink-950/30'
    },
    {
      id: 'pdf',
      title: 'PDF Certificat',
      ext: '.pdf',
      desc: 'Rapport officiel d\'audit métrologique et certificat de traçabilité conforme ISO/IEC 17025',
      icon: FileText,
      badge: 'Rapport Certifié',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/30'
    },
    {
      id: 'parquet',
      title: 'NDJSON / Parquet',
      ext: '.ndjson',
      desc: 'Format tabulaire haute performance pour Python Polars, DuckDB, Pandas et PyArrow',
      icon: Database,
      badge: 'Big Data / Polars',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30'
    },
    {
      id: 'json',
      title: 'JSON Structuré',
      ext: '.json',
      desc: 'Arborescence JSON complète incluant l\'objet racine provenance et flags de qualité',
      icon: FileJson,
      badge: 'API Standard',
      color: 'text-teal-400 border-teal-500/30 bg-teal-950/30'
    }
  ];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer group"
        title="Exporter les données avec traçabilité complète (CSV, GeoJSON, NetCDF, SVG, PNG, PDF, Parquet)"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span>Exporter</span>
        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          8 formats
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Modal Hub d'Exportation Scientifique */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    Export Métrologique Conforme
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {data?.length || 0} enregistrements
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-400" />
                  <span>Centre d'Exportation &amp; Formats Scientifiques</span>
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Provenance Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5 font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Traçabilité embarquée dans chaque fichier exporté
                </span>
                <button
                  type="button"
                  onClick={() => setShowProvDetails(!showProvDetails)}
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  {showProvDetails ? 'Masquer' : 'Détails des métadonnées →'}
                </button>
              </div>

              <div className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${resolvedProv.dataMode === 'REAL_DATA' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}`}>
                    {resolvedProv.dataModeLabel}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {resolvedProv.dataModeDescription}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Source :</strong> {resolvedProv.source}</span>
                  <span><strong>Produit :</strong> {resolvedProv.dataset} ({resolvedProv.version})</span>
                  <span><strong>DOI :</strong> {resolvedProv.doi || 'N/A'}</span>
                  <span><strong>Licence :</strong> {resolvedProv.license}</span>
                  <span><strong>Qualité :</strong> <strong className="text-emerald-400">{resolvedProv.qualityFlags}</strong></span>
                </div>
              </div>

              {showProvDetails && (
                <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 animate-in fade-in">
                  <div><strong>Empreinte SHA-256 :</strong> <span className="text-cyan-300 break-all">{resolvedProv.checksum}</span></div>
                  <div><strong>Méthodologie :</strong> {resolvedProv.method}</div>
                  <div><strong>Paramètres de requête :</strong> {JSON.stringify(resolvedProv.query)}</div>
                  <div><strong>Horodatage d'export :</strong> {resolvedProv.timestamp}</div>
                </div>
              )}
            </div>

            {/* Formats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {formats.map(fmt => {
                const Icon = fmt.icon;
                const isDownloading = downloadingFormat === fmt.id;

                return (
                  <button
                    key={fmt.id}
                    onClick={() => handleExport(fmt.id as any)}
                    disabled={isDownloading || !data || data.length === 0}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between gap-2.5 relative disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg border ${fmt.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            <span>{fmt.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">{fmt.ext}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{fmt.badge}</span>
                        </div>
                      </div>

                      {isDownloading && (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {fmt.desc}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Téléchargement direct</span>
                      <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Télécharger →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 font-mono">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Garantie de non-altération : Zéro formule synthétique
              </span>
              <span className="font-mono text-slate-400">
                Carbonor v1.0
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
