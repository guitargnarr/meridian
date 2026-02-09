"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, ArrowUpDown, Download } from "lucide-react";
import type { StateMetrics } from "@/lib/overlay-data";
import { FALLBACK_STATE_METRICS, formatPopulation, formatIncome } from "@/lib/overlay-data";
import { fetchLiveMetrics } from "@/lib/data-fetcher";
import { STATE_NAMES } from "@/lib/fips-utils";
import { metricsToRows, generateCSV, downloadFile } from "@/lib/export";

const STATE_ABBRS = Object.keys(FALLBACK_STATE_METRICS).sort();

interface MetricRow {
  label: string;
  key: string;
  format: (m: StateMetrics) => string;
  bestFn: (values: number[]) => number; // returns index of best value
  getValue: (m: StateMetrics) => number;
}

const METRIC_ROWS: MetricRow[] = [
  {
    label: "Population",
    key: "population",
    format: (m) => formatPopulation(m.population),
    getValue: (m) => m.population,
    bestFn: (v) => v.indexOf(Math.max(...v)),
  },
  {
    label: "Median Income",
    key: "medianIncome",
    format: (m) => formatIncome(m.medianIncome),
    getValue: (m) => m.medianIncome,
    bestFn: (v) => v.indexOf(Math.max(...v)),
  },
  {
    label: "Unemployment Rate",
    key: "unemploymentRate",
    format: (m) => `${m.unemploymentRate}%`,
    getValue: (m) => m.unemploymentRate,
    bestFn: (v) => v.indexOf(Math.min(...v)),
  },
  {
    label: "Poverty Rate",
    key: "povertyRate",
    format: (m) => `${m.povertyRate}%`,
    getValue: (m) => m.povertyRate,
    bestFn: (v) => v.indexOf(Math.min(...v)),
  },
  {
    label: "Gig Economy",
    key: "gig_pct",
    format: (m) => `${m.gig_pct}%`,
    getValue: (m) => m.gig_pct,
    bestFn: (v) => v.indexOf(Math.max(...v)),
  },
  {
    label: "Privacy Law",
    key: "hasActiveLegislation",
    format: (m) => (m.hasActiveLegislation ? "Yes" : "No"),
    getValue: (m) => (m.hasActiveLegislation ? 1 : 0),
    bestFn: () => -1, // no "best" for boolean
  },
];

export default function StateComparison() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [metrics, setMetrics] = useState(FALLBACK_STATE_METRICS);
  const [isLive, setIsLive] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Initialize selected states from URL
  const [selected, setSelected] = useState<string[]>(() => {
    const param = searchParams.get("states");
    if (param) {
      const abbrs = param.split(",").filter((a) => a in FALLBACK_STATE_METRICS);
      return abbrs.slice(0, 3);
    }
    return [];
  });

  useEffect(() => {
    fetchLiveMetrics().then((result) => {
      setMetrics(result.metrics);
      setIsLive(result.isLive);
    });
  }, []);

  // Update URL when selection changes
  useEffect(() => {
    if (selected.length > 0) {
      router.replace(`/compare?states=${selected.join(",")}`, { scroll: false });
    } else {
      router.replace("/compare", { scroll: false });
    }
  }, [selected, router]);

  const filteredStates = useMemo(() => {
    const q = search.toLowerCase();
    return STATE_ABBRS.filter((abbr) => {
      if (selected.includes(abbr)) return false;
      const name = STATE_NAMES[abbr] || abbr;
      return name.toLowerCase().includes(q) || abbr.toLowerCase().includes(q);
    });
  }, [search, selected]);

  function addState(abbr: string) {
    if (selected.length >= 3) return;
    setSelected([...selected, abbr]);
    setSelectorOpen(false);
    setSearch("");
  }

  function removeState(abbr: string) {
    setSelected(selected.filter((a) => a !== abbr));
  }

  function handleExportComparison() {
    const rows = metricsToRows(metrics).filter((r) =>
      selected.includes(r.abbreviation)
    );
    downloadFile(generateCSV(rows), "meridian-comparison.csv", "text/csv");
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-14">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#4a4540] mb-4">
            Decision Tool
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-[#f5f0eb] tracking-[-0.03em]">
            Compare{" "}
            <em className="font-display italic text-[#14b8a6]">states</em>
          </h1>
          <p className="mt-3 text-sm text-[#8a8580] max-w-lg mx-auto">
            Select 2-3 states to compare economic metrics side by side.
            Best value in each row highlighted.
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-[#22c55e]" : "bg-[#4a4540]"}`}
            />
            <span className="text-[10px] text-[#4a4540] uppercase tracking-wider">
              {isLive ? "Live Data" : "Static Data"}
            </span>
          </div>
        </div>

        {/* State selector chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8 justify-center">
          {selected.map((abbr) => (
            <div
              key={abbr}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/30"
            >
              <span className="text-sm font-medium text-[#14b8a6]">
                {STATE_NAMES[abbr] || abbr}
              </span>
              <button
                onClick={() => removeState(abbr)}
                className="text-[#14b8a6]/60 hover:text-[#14b8a6] transition-colors"
                aria-label={`Remove ${STATE_NAMES[abbr]}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {selected.length < 3 && (
            <div className="relative">
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#2a2a2a] text-[#8a8580] hover:border-[#14b8a6]/30 hover:text-[#f5f0eb] transition-all text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add State
              </button>

              {selectorOpen && (
                <div className="absolute top-full mt-2 left-0 w-64 card-glass rounded-xl border border-[#1a1a1a] overflow-hidden z-30 shadow-2xl">
                  <div className="p-2">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search states..."
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-sm text-[#f5f0eb] placeholder-[#4a4540] outline-none focus:border-[#14b8a6]/50"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStates.map((abbr) => (
                      <button
                        key={abbr}
                        onClick={() => addState(abbr)}
                        className="w-full px-4 py-2 text-left text-sm text-[#8a8580] hover:bg-[#14b8a6]/10 hover:text-[#f5f0eb] transition-colors"
                      >
                        <span className="text-[#4a4540] mr-2">{abbr}</span>
                        {STATE_NAMES[abbr]}
                      </button>
                    ))}
                    {filteredStates.length === 0 && (
                      <div className="px-4 py-3 text-xs text-[#4a4540]">No states found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison table */}
        {selected.length >= 2 ? (
          <>
            <div className="card-glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="px-4 py-3 text-left text-xs text-[#4a4540] uppercase tracking-wider font-medium">
                      <div className="flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3" />
                        Metric
                      </div>
                    </th>
                    {selected.map((abbr) => (
                      <th
                        key={abbr}
                        className="px-4 py-3 text-center text-xs text-[#f5f0eb] uppercase tracking-wider font-medium"
                      >
                        {STATE_NAMES[abbr] || abbr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRIC_ROWS.map((row) => {
                    const values = selected.map((abbr) =>
                      row.getValue(metrics[abbr])
                    );
                    const bestIdx = row.bestFn(values);

                    return (
                      <tr key={row.key} className="border-b border-[#1a1a1a]/50">
                        <td className="px-4 py-3 text-sm text-[#8a8580]">
                          {row.label}
                        </td>
                        {selected.map((abbr, i) => (
                          <td
                            key={abbr}
                            className={`px-4 py-3 text-center text-sm font-medium ${
                              i === bestIdx
                                ? "text-[#14b8a6]"
                                : "text-[#f5f0eb]"
                            }`}
                          >
                            {row.format(metrics[abbr])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* Legislation topics row */}
                  <tr>
                    <td className="px-4 py-3 text-sm text-[#8a8580]">
                      Legislation Topics
                    </td>
                    {selected.map((abbr) => (
                      <td
                        key={abbr}
                        className="px-4 py-3 text-center text-xs text-[#8a8580]"
                      >
                        {metrics[abbr].legislationTopics.length > 0
                          ? metrics[abbr].legislationTopics.join(", ")
                          : "None"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Export */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleExportComparison}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#0a0a0a] border border-[#1a1a1a] text-[#8a8580] hover:border-[#14b8a6]/30 hover:text-[#f5f0eb] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export Comparison CSV
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="card-glass rounded-xl p-8 max-w-md mx-auto">
              <ArrowUpDown className="w-8 h-8 text-[#4a4540] mx-auto mb-3" />
              <p className="text-sm text-[#8a8580]">
                {selected.length === 0
                  ? "Select at least 2 states to begin comparing."
                  : "Select one more state to see the comparison."}
              </p>
              <p className="mt-2 text-xs text-[#4a4540]">
                Try:{" "}
                <Link
                  href="/compare?states=CA,TX,NY"
                  className="text-[#14b8a6] hover:underline"
                >
                  CA vs TX vs NY
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
