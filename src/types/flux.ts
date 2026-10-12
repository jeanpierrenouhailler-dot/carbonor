import { DataProvenance, ScientificDataCategory } from './observation.ts';

export interface FluxRecord {
  id: string;
  region: string;              // 'France' | 'Europe' | 'Global' | 'Land Biosphere' | 'Oceans'
  timestamp: string;
  category: ScientificDataCategory;
  netFlux: number;             // Flux net atmosphère -> surface ou inverse (convention: positif vers atmosphère)
  naturalFluxNEE: number;      // Net Ecosystem Exchange (respiration - photosynthèse)
  anthropogenicFossil: number; // Combustibles fossiles + cimenterie
  oceanUptake: number;         // Puits océanique de CO2 (souvent négatif = absorption)
  landSink: number;            // Puits biosphère terrestre
  inversionPosterior: number;  // Flux déduit par assimilation inverse CAMS
  unit: 'µmol/(m²·s)' | 'gC/(m²·d)' | 'MtCO₂/an' | 'GtC/an';
  uncertaintyPercentage: number;
  provenance: DataProvenance;
}

export interface EmissionSubSector {
  name: string;
  valueMtCO2?: number;
  valueMtCO2e?: number;
  sharePercent: number;
}

export interface EmissionInventoryItem {
  id: string;
  sector: string;              // 'Énergie & Électricité' | 'Transports' | 'Industrie & Matériaux' | 'Bâtiments' | 'Agriculture' | 'Déchets' | 'UTCATF'
  country: string;
  year: number;
  valueMtCO2: number;          // Mt CO₂ / an
  valueMtCO2e?: number;         // Mt CO₂e / an (avec PRG AR5 CH4, N2O, F-gaz)
  sharePercent: number;        // % du total national
  category: ScientificDataCategory; // ESTIMATED
  isDirectMeasurement: false;  // Ne jamais présenter une émission estimée comme une mesure directe !
  inventoryAgency: string;     // 'CITEPA (France)' | 'EEA (Europe)' | 'EDGAR / Global Carbon Project'
  accountingMethod?: string;
  subSectors?: EmissionSubSector[];
  provenance: DataProvenance;
}

export interface CitepaHistoryPoint {
  year: number;
  totalMtCO2e: number;
  transportMt: number;
  batimentsMt: number;
  industrieMt: number;
  agricultureMt: number;
  energieMt: number;
  dechetsMt: number;
  sinkMt: number;
}

export interface CitepaVersionSummary {
  id: string;
  edition: string;
  consolidatedYear: number;
  publicationDate: string;
  totalCO2eGrossMt: number;
  totalSinkMt: number;
  netCO2eMt: number;
  reportingNorm: string;
  isActive: boolean;
  filename: string;
}

export interface CitepaInventoryResponse {
  manifest: {
    source: string;
    dataset: string;
    edition: string;
    publicationDate: string;
    latestConsolidatedYear: number;
    provisionalYear: number;
    reportingNorm: string;
    gwpMetric: string;
    perimeter: string;
    license: string;
    officialUrl: string;
    citation: string;
    doi: string;
  };
  totals2024: {
    totalCO2eGrossMt: number;
    totalCO2GrossMt: number;
    totalSinkLULUCFMt: number;
    totalCO2eNetMt: number;
    evolutionSince1990Percent: number;
    evolution2023To2024Percent: number;
  };
  sectors: EmissionInventoryItem[];
  history1990_2024: CitepaHistoryPoint[];
  globalBudget2025: any;
}
