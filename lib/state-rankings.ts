import type { StateMetrics } from "./overlay-data";

export interface StateRank {
  population: number;
  medianIncome: number;
  povertyRate: number;
  unemploymentRate: number;
  gig_pct: number;
}

/**
 * Compute national rank (1=best) for each metric across all states.
 * "Best" means: highest income/population/gig, lowest poverty/unemployment.
 */
export function computeStateRanks(
  metrics: Record<string, StateMetrics>
): Record<string, StateRank> {
  const entries = Object.entries(metrics);

  // Sort each metric and assign rank
  const populationSorted = [...entries].sort((a, b) => b[1].population - a[1].population);
  const incomeSorted = [...entries].sort((a, b) => b[1].medianIncome - a[1].medianIncome);
  const povertySorted = [...entries].sort((a, b) => a[1].povertyRate - b[1].povertyRate);
  const unemploymentSorted = [...entries].sort((a, b) => a[1].unemploymentRate - b[1].unemploymentRate);
  const gigSorted = [...entries].sort((a, b) => b[1].gig_pct - a[1].gig_pct);

  const ranks: Record<string, StateRank> = {};

  for (const [abbr] of entries) {
    ranks[abbr] = {
      population: populationSorted.findIndex(([a]) => a === abbr) + 1,
      medianIncome: incomeSorted.findIndex(([a]) => a === abbr) + 1,
      povertyRate: povertySorted.findIndex(([a]) => a === abbr) + 1,
      unemploymentRate: unemploymentSorted.findIndex(([a]) => a === abbr) + 1,
      gig_pct: gigSorted.findIndex(([a]) => a === abbr) + 1,
    };
  }

  return ranks;
}
