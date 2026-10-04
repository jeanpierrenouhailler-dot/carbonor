/**
 * Outils statistiques pour la comparaison rigoureuse entre mesures au sol,
 * observations satellitaires et modèles (NOAA / ICOS vs OCO-2 vs CAMS).
 */

export interface StatisticalComparison {
  count: number;
  meanObserved: number;
  meanModeled: number;
  bias: number;              // Biais moyen (Modèle - Observation)
  mae: number;               // Mean Absolute Error
  rmse: number;              // Root Mean Square Error
  pearsonR: number;          // Coefficient de corrélation de Pearson
  rSquared: number;          // R²
  maxPositiveResidual: number;
  maxNegativeResidual: number;
  units: string;
}

export function compareSeries(
  observed: number[],
  modeled: number[],
  units: string = 'ppm'
): StatisticalComparison {
  const n = Math.min(observed.length, modeled.length);
  if (n === 0) {
    return {
      count: 0,
      meanObserved: 0,
      meanModeled: 0,
      bias: 0,
      mae: 0,
      rmse: 0,
      pearsonR: 0,
      rSquared: 0,
      maxPositiveResidual: 0,
      maxNegativeResidual: 0,
      units
    };
  }

  let sumObs = 0;
  let sumMod = 0;
  for (let i = 0; i < n; i++) {
    sumObs += observed[i];
    sumMod += modeled[i];
  }
  const meanObs = sumObs / n;
  const meanMod = sumMod / n;

  let sumDiff = 0;
  let sumAbsDiff = 0;
  let sumSqDiff = 0;
  let sumCov = 0;
  let sumVarObs = 0;
  let sumVarMod = 0;
  let maxPos = -Infinity;
  let maxNeg = Infinity;

  for (let i = 0; i < n; i++) {
    const diff = modeled[i] - observed[i];
    sumDiff += diff;
    sumAbsDiff += Math.abs(diff);
    sumSqDiff += diff * diff;

    if (diff > maxPos) maxPos = diff;
    if (diff < maxNeg) maxNeg = diff;

    const devObs = observed[i] - meanObs;
    const devMod = modeled[i] - meanMod;
    sumCov += devObs * devMod;
    sumVarObs += devObs * devObs;
    sumVarMod += devMod * devMod;
  }

  const bias = sumDiff / n;
  const mae = sumAbsDiff / n;
  const rmse = Math.sqrt(sumSqDiff / n);

  let pearsonR = 0;
  const denom = Math.sqrt(sumVarObs * sumVarMod);
  if (denom > 1e-9) {
    pearsonR = sumCov / denom;
  }
  const rSquared = pearsonR * pearsonR;

  return {
    count: n,
    meanObserved: Number(meanObs.toFixed(3)),
    meanModeled: Number(meanMod.toFixed(3)),
    bias: Number(bias.toFixed(3)),
    mae: Number(mae.toFixed(3)),
    rmse: Number(rmse.toFixed(3)),
    pearsonR: Number(pearsonR.toFixed(4)),
    rSquared: Number(rSquared.toFixed(4)),
    maxPositiveResidual: Number(maxPos.toFixed(3)),
    maxNegativeResidual: Number(maxNeg.toFixed(3)),
    units
  };
}
