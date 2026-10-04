import React from 'react';
import { DataProvenance, ScientificDataCategory } from '../../types/observation';
import { Info, ShieldCheck, Satellite, Compass, Cpu, Atom } from 'lucide-react';

interface ProvenanceBadgeProps {
  category: ScientificDataCategory;
  provenance?: DataProvenance;
  onClick?: () => void;
  showText?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  category,
  provenance,
  onClick,
  showText = true
}) => {
  const getCategoryConfig = (cat: ScientificDataCategory) => {
    switch (cat) {
      case 'MEASURED':
        return {
          label: 'MESURÉ',
          tooltip: 'Mesure physico-chimique in situ directe (analyseur CRDS/NDIR au sol ou AirCore)',
          icon: ShieldCheck,
          classes: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
        };
      case 'OBSERVED':
        return {
          label: 'OBSERVÉ',
          tooltip: 'Observation satellitaire indirecte par inversion de spectre solaire réfléchi (OCO-2/3)',
          icon: Satellite,
          classes: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400 hover:border-cyan-400'
        };
      case 'ESTIMATED':
        return {
          label: 'ESTIMÉ',
          tooltip: 'Flux et émissions déduits (inversion atmosphérique bayésienne ou inventaire sectoriel)',
          icon: Compass,
          classes: 'bg-amber-950/80 border-amber-500/40 text-amber-400 hover:border-amber-400'
        };
      case 'MODELED':
        return {
          label: 'MODÉLISÉ',
          tooltip: 'Champ assimilé par modèle de circulation générale et chimie-transport (CAMS IFS)',
          icon: Cpu,
          classes: 'bg-purple-950/80 border-purple-500/40 text-purple-400 hover:border-purple-400'
        };
      case 'SIMULATED':
        return {
          label: 'SIMULÉ',
          tooltip: 'Transfert radiatif théorique raie-par-raie (bases HITRAN et loi de Beer-Lambert)',
          icon: Atom,
          classes: 'bg-rose-950/80 border-rose-500/40 text-rose-400 hover:border-rose-400'
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${config.label} : ${config.tooltip}${provenance ? ' — Source: ' + provenance.source : ''}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider border transition-all cursor-pointer ${config.classes}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {showText && <span>{config.label}</span>}
      {provenance && (
        <span className="opacity-60 text-[10px] ml-0.5">ℹ</span>
      )}
    </button>
  );
};
