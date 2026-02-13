"use client";

import { X, Pill, Users } from "lucide-react";
import { STATE_NAMES } from "@/lib/fips-utils";
import type { StateMetrics } from "@/lib/overlay-data";
import { FALLBACK_STATE_METRICS, METRIC_MAXES, formatPopulation, formatPharmacyCount } from "@/lib/overlay-data";

interface StateDetailPanelProps {
  stateAbbr: string | null;
  onClose: () => void;
  stateMetrics?: Record<string, StateMetrics>;
}

function MetricBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-[#1a1a1a] mt-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function MetricContent({ metrics, stateAbbr, fullName, onClose }: {
  metrics: StateMetrics;
  stateAbbr: string;
  fullName: string;
  onClose: () => void;
}) {
  const pharm = metrics.pharmacy;
  const viability = pharm
    ? Math.round(((pharm.active + pharm.likelyActive) / pharm.independentCount) * 100)
    : 0;
  const viabilityColor = viability >= 55 ? "#22c55e" : viability >= 48 ? "#eab308" : "#ef4444";

  return (
    <div className="p-4 md:p-5 space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-display text-[#f5f0eb]">{fullName}</h2>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20">
            {stateAbbr}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 text-[#4a4540] hover:text-[#f5f0eb] transition-colors"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pharmacy Market (Primary) */}
      {pharm && (
        <>
          {/* Viability Score */}
          <div className="space-y-2">
            <h3 className="text-xs text-[#4a4540] uppercase tracking-[0.15em] font-medium flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" />
              Viability Score
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold" style={{ color: viabilityColor }}>
                {viability}%
              </span>
              <span className="text-xs text-[#4a4540]">of pharmacies contactable</span>
            </div>
          </div>

          {/* Total Count */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8a8580]">Independent pharmacies</span>
              <span className="text-sm font-mono text-[#f5f0eb]">
                {formatPharmacyCount(pharm.independentCount)}
              </span>
            </div>
            <MetricBar pct={(pharm.independentCount / METRIC_MAXES.pharmacyCount) * 100} color="#a855f7" />
          </div>

          {/* Status Breakdown */}
          <div className="space-y-2">
            <div className="text-[10px] text-[#4a4540] uppercase tracking-wider">Status Breakdown</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#22c55e]">Active</span>
                  <span className="text-[11px] font-mono text-[#8a8580]">{pharm.active.toLocaleString()}</span>
                </div>
                <MetricBar pct={(pharm.active / pharm.independentCount) * 100} color="#22c55e" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#3b82f6]">Likely Active</span>
                  <span className="text-[11px] font-mono text-[#8a8580]">{pharm.likelyActive.toLocaleString()}</span>
                </div>
                <MetricBar pct={(pharm.likelyActive / pharm.independentCount) * 100} color="#3b82f6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#eab308]">Uncertain</span>
                  <span className="text-[11px] font-mono text-[#8a8580]">{pharm.uncertain.toLocaleString()}</span>
                </div>
                <MetricBar pct={(pharm.uncertain / pharm.independentCount) * 100} color="#eab308" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#ef4444]">Likely Closed</span>
                  <span className="text-[11px] font-mono text-[#8a8580]">{pharm.likelyClosed.toLocaleString()}</span>
                </div>
                <MetricBar pct={(pharm.likelyClosed / pharm.independentCount) * 100} color="#ef4444" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Context: Population */}
      <div className="pt-2 border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#4a4540]" />
            <span className="text-xs text-[#4a4540]">Population</span>
          </div>
          <span className="text-xs font-mono text-[#8a8580]">
            {formatPopulation(metrics.population)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StateDetailPanel({ stateAbbr, onClose, stateMetrics }: StateDetailPanelProps) {
  const isOpen = !!stateAbbr;
  const metricsMap = stateMetrics ?? FALLBACK_STATE_METRICS;
  const metrics = stateAbbr ? metricsMap[stateAbbr] : null;
  const fullName = stateAbbr ? STATE_NAMES[stateAbbr] || stateAbbr : "";

  return (
    <>
      {/* Desktop: right sidebar (md and up) */}
      <div
        className="absolute right-0 top-0 bottom-0 w-80 z-20 pointer-events-none hidden md:block"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="h-full pointer-events-auto card-glass border-l border-[#1a1a1a] overflow-y-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent" />
          {metrics && stateAbbr && (
            <MetricContent metrics={metrics} stateAbbr={stateAbbr} fullName={fullName} onClose={onClose} />
          )}
        </div>
      </div>

      {/* Mobile: bottom sheet (below md) */}
      <div
        className="absolute left-0 right-0 bottom-0 z-20 pointer-events-none md:hidden"
        style={{
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 pointer-events-auto -z-10"
            onClick={onClose}
          />
        )}
        <div className="pointer-events-auto card-glass border-t border-[#1a1a1a] rounded-t-2xl max-h-[70vh] overflow-y-auto safe-area-bottom">
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#2a2a2a]" />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent" />
          {metrics && stateAbbr && (
            <MetricContent metrics={metrics} stateAbbr={stateAbbr} fullName={fullName} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
}
