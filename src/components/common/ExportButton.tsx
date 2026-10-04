import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Check } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  datasetName: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, datasetName, className = '' }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    setDownloading(true);

    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(','),
      ...data.map(item =>
        keys
          .map(key => {
            const val = item[key];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${datasetName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloading(false);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(
      {
        dataset: datasetName,
        exportedAt: new Date().toISOString(),
        recordsCount: data.length,
        licenseNotice: 'Export avec traçabilité et métadonnées scientifiques préservées.',
        data
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${datasetName}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5 text-xs shadow-xs ${className}`}>
      <button
        onClick={exportCSV}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
        title="Exporter en fichier CSV (tableur / R / Python)"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span>CSV</span>
      </button>

      <span className="h-4 w-px bg-slate-700" />

      <button
        onClick={exportJSON}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
        title="Exporter en format JSON standard"
      >
        <FileJson className="w-3.5 h-3.5 text-cyan-400" />
        <span>JSON</span>
      </button>
    </div>
  );
};
