"use client";

import { useState } from "react";
import { X, User, MapPin, Clock, Phone, ChevronLeft, Store } from "lucide-react";
import type { PharmacyFullDetail } from "./InteractiveMap";
import type { ClusterPharmacy } from "./InteractiveMap";

// ── Props ────────────────────────────────────────────────────────────────

interface PharmacyDetailPanelProps {
  // Single pharmacy mode
  pharmacy?: PharmacyFullDetail | null;
  status?: number;
  // Cluster list mode
  clusterPharmacies?: ClusterPharmacy[] | null;
  // Shared
  onClose: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────

const STATUS_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];
const STATUS_LABELS = ["Active", "Likely Active", "Uncertain", "Likely Closed"];
const STATUS_RATIONALE = [
  "NPPES record updated within 1 year. Active Medicare/Medicaid billing relationship.",
  "NPPES record updated within 2 years. Likely still operating.",
  "No NPPES updates in 2-4 years. Operational status unclear.",
  "No NPPES updates in 4+ years. May have ceased operations.",
];

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [m, d, y] = parts;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(m, 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return dateStr;
  return `${months[monthIdx]} ${parseInt(d, 10)}, ${y}`;
}

function yearsAgo(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 0;
  const year = parseInt(parts[2], 10);
  return new Date().getFullYear() - year;
}

function formatPhone(phone: string): string {
  if (!phone || phone.length < 10) return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// ── Single Pharmacy Detail ──────────────────────────────────────────────

function PharmacyDetail({ pharmacy: ph, status, onBack }: {
  pharmacy: PharmacyFullDetail;
  status: number;
  onBack?: () => void;
}) {
  const color = STATUS_COLORS[status] || STATUS_COLORS[2];
  const label = STATUS_LABELS[status] || "Unknown";
  const rationale = STATUS_RATIONALE[status] || "";
  const years = yearsAgo(ph.ed);

  return (
    <div className="p-4 md:p-5 space-y-4">
      {/* Back button (when navigating from cluster list) */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#14b8a6] hover:text-[#14b8a6]/80 transition-colors -mb-2"
        >
          <ChevronLeft size={14} />
          Back to list
        </button>
      )}

      {/* Header */}
      <div className="min-w-0">
        <h2 className="text-base md:text-lg font-display text-[#f5f0eb] leading-tight break-words">
          {ph.n || "Unknown Pharmacy"}
        </h2>
        <span
          className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {label}
        </span>
      </div>

      {/* Status Rationale */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a]/60 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#4a4540] uppercase tracking-[0.1em] font-medium">
          <Clock size={12} />
          Status Rationale
        </div>
        <p className="text-sm text-[#8a8580] leading-relaxed">{rationale}</p>
        {ph.lu && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#4a4540]">Last verified</span>
            <span className="text-[#f5f0eb] font-mono">{formatDate(ph.lu)}</span>
          </div>
        )}
        {ph.ed && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#4a4540]">Registered</span>
            <span className="text-[#f5f0eb] font-mono">
              {formatDate(ph.ed)}{years > 0 ? ` (${years}y)` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Decision Maker */}
      {ph.on && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#4a4540] uppercase tracking-[0.1em] font-medium">
            <User size={12} />
            Decision Maker
          </div>
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a]/60 p-3 space-y-1.5">
            <div className="text-sm text-[#f5f0eb] font-medium">
              {ph.on}{ph.ot ? `, ${ph.ot}` : ""}
            </div>
            {ph.op && (
              <a
                href={`tel:${ph.op.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1.5 text-sm text-[#14b8a6] hover:text-[#14b8a6]/80 transition-colors"
              >
                <Phone size={12} />
                {formatPhone(ph.op)}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#4a4540] uppercase tracking-[0.1em] font-medium">
          <MapPin size={12} />
          Location
        </div>
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a]/60 p-3 space-y-1.5">
          <div className="text-sm text-[#f5f0eb]">
            {ph.a1}
            {ph.a2 && <span className="text-[#8a8580]">, {ph.a2}</span>}
          </div>
          <div className="text-sm text-[#8a8580]">
            {ph.c}, {ph.s} {ph.z}
          </div>
          {ph.p && (
            <a
              href={`tel:${ph.p.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 text-sm text-[#8a8580] hover:text-[#14b8a6] transition-colors"
            >
              <Phone size={12} />
              {formatPhone(ph.p)}
            </a>
          )}
          {ph.ln && ph.ln !== ph.n && (
            <div className="pt-1 border-t border-[#1a1a1a]">
              <span className="text-xs text-[#4a4540]">Legal: </span>
              <span className="text-xs text-[#8a8580]">{ph.ln}</span>
            </div>
          )}
          {ph.dn && (
            <div>
              <span className="text-xs text-[#4a4540]">DBA: </span>
              <span className="text-xs text-[#8a8580]">{ph.dn}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cluster List View ───────────────────────────────────────────────────

function ClusterList({ pharmacies, onSelect }: {
  pharmacies: ClusterPharmacy[];
  onSelect: (ph: ClusterPharmacy) => void;
}) {
  // Sort: Active first, then Likely Active, etc.
  const sorted = [...pharmacies].sort((a, b) => a.status - b.status);
  const statusCounts = [0, 0, 0, 0];
  sorted.forEach((p) => { if (p.status >= 0 && p.status <= 3) statusCounts[p.status]++; });

  return (
    <div className="p-4 md:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Store size={16} className="text-[#14b8a6]" />
        <h2 className="text-base font-display text-[#f5f0eb]">
          {pharmacies.length} Pharmacies
        </h2>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {statusCounts.map((count, i) => count > 0 ? (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${STATUS_COLORS[i]}20`, color: STATUS_COLORS[i], border: `1px solid ${STATUS_COLORS[i]}40` }}
          >
            {count} {STATUS_LABELS[i]}
          </span>
        ) : null)}
      </div>

      {/* Pharmacy list */}
      <div className="space-y-1.5 pt-1">
        {sorted.map((item, i) => {
          const ph = item.detail;
          const color = STATUS_COLORS[item.status];
          return (
            <button
              key={i}
              onClick={() => onSelect(item)}
              className="w-full text-left rounded-lg border border-[#1a1a1a] bg-[#0a0a0a]/60 p-3 hover:border-[#2a2a2a] hover:bg-[#0a0a0a] transition-all group"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[#f5f0eb] font-medium truncate group-hover:text-white transition-colors">
                    {ph.n || "Unknown"}
                  </div>
                  <div className="text-xs text-[#8a8580] truncate">
                    {ph.c}, {ph.s} {ph.z}
                  </div>
                  {ph.on && (
                    <div className="text-xs text-[#4a4540] mt-0.5 truncate">
                      {ph.on}{ph.ot ? `, ${ph.ot}` : ""}
                    </div>
                  )}
                </div>
                <ChevronLeft size={14} className="text-[#4a4540] rotate-180 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────

export default function PharmacyDetailPanel({
  pharmacy,
  status = 0,
  clusterPharmacies,
  onClose,
}: PharmacyDetailPanelProps) {
  const [selectedFromCluster, setSelectedFromCluster] = useState<ClusterPharmacy | null>(null);

  const isOpen = !!(pharmacy || clusterPharmacies);
  const showingDetail = !!pharmacy || !!selectedFromCluster;
  const showingList = !!clusterPharmacies && !selectedFromCluster;

  // Reset selection when panel closes or cluster changes
  const handleClose = () => {
    setSelectedFromCluster(null);
    onClose();
  };

  const handleBack = () => {
    setSelectedFromCluster(null);
  };

  const handleSelectFromCluster = (item: ClusterPharmacy) => {
    setSelectedFromCluster(item);
  };

  const renderContent = () => {
    // Direct pharmacy click
    if (pharmacy) {
      return <PharmacyDetail pharmacy={pharmacy} status={status} />;
    }
    // Viewing detail from cluster list
    if (selectedFromCluster) {
      return (
        <PharmacyDetail
          pharmacy={selectedFromCluster.detail}
          status={selectedFromCluster.status}
          onBack={handleBack}
        />
      );
    }
    // Cluster list
    if (clusterPharmacies) {
      return <ClusterList pharmacies={clusterPharmacies} onSelect={handleSelectFromCluster} />;
    }
    return null;
  };

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
          <div className="flex justify-end p-2">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#4a4540] hover:text-[#f5f0eb] transition-colors"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>
          {renderContent()}
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
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 pointer-events-auto -z-10"
            onClick={handleClose}
          />
        )}
        <div className="pointer-events-auto card-glass border-t border-[#1a1a1a] rounded-t-2xl max-h-[70vh] overflow-y-auto safe-area-bottom">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#2a2a2a]" />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent" />
          {renderContent()}
        </div>
      </div>
    </>
  );
}
