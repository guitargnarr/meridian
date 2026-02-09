import type { StateMetrics } from "./overlay-data";
import { STATE_NAMES } from "./fips-utils";

export interface ExportRow {
  state: string;
  abbreviation: string;
  population: number;
  medianIncome: number;
  povertyRate: number;
  unemploymentRate: number;
  gigPercent: number;
  hasPrivacyLaw: boolean;
}

export function metricsToRows(metrics: Record<string, StateMetrics>): ExportRow[] {
  return Object.entries(metrics)
    .map(([abbr, m]) => ({
      state: STATE_NAMES[abbr] || abbr,
      abbreviation: abbr,
      population: m.population,
      medianIncome: m.medianIncome,
      povertyRate: m.povertyRate,
      unemploymentRate: m.unemploymentRate,
      gigPercent: m.gig_pct,
      hasPrivacyLaw: m.hasActiveLegislation,
    }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

export function generateCSV(rows: ExportRow[]): string {
  const headers = [
    "State",
    "Abbreviation",
    "Population",
    "Median Income",
    "Poverty Rate (%)",
    "Unemployment Rate (%)",
    "Gig Economy (%)",
    "Has Privacy Law",
  ];
  const lines = rows.map((r) =>
    [
      `"${r.state}"`,
      r.abbreviation,
      r.population,
      r.medianIncome,
      r.povertyRate,
      r.unemploymentRate,
      r.gigPercent,
      r.hasPrivacyLaw ? "Yes" : "No",
    ].join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

export function generateJSON(rows: ExportRow[]): string {
  return JSON.stringify(rows, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
