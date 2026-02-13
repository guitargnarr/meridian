"use client";

import { useState, useCallback } from "react";
import InteractiveMap from "./components/InteractiveMap";
import type { PharmacyFullDetail, ClusterPharmacy } from "./components/InteractiveMap";
import PharmacyDetailPanel from "./components/PharmacyDetailPanel";

export default function ExplorePage() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<{
    detail: PharmacyFullDetail;
    status: number;
  } | null>(null);

  const [clusterPharmacies, setClusterPharmacies] = useState<ClusterPharmacy[] | null>(null);

  const handlePharmacyClick = useCallback((detail: PharmacyFullDetail, status: number) => {
    setClusterPharmacies(null);
    setSelectedPharmacy({ detail, status });
  }, []);

  const handleClusterClick = useCallback((pharmacies: ClusterPharmacy[]) => {
    setSelectedPharmacy(null);
    setClusterPharmacies(pharmacies);
  }, []);

  const handleDismiss = useCallback(() => {
    setSelectedPharmacy(null);
    setClusterPharmacies(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#050505] pt-14">
      <header className="flex items-center px-4 py-1.5 border-b border-[#1a1a1a] bg-[#050505]/90 backdrop-blur-sm z-10 entrance-header">
        <span className="text-xs text-[#4a4540] uppercase tracking-[0.15em] font-medium">
          Independent Pharmacy Market Map
        </span>
      </header>

      <main className="flex-1 min-w-0 overflow-hidden entrance-map relative">
        <InteractiveMap
          onPharmacyClick={handlePharmacyClick}
          onClusterClick={handleClusterClick}
          onDismiss={handleDismiss}
        />
        <PharmacyDetailPanel
          pharmacy={selectedPharmacy?.detail ?? null}
          status={selectedPharmacy?.status ?? 0}
          clusterPharmacies={clusterPharmacies}
          onClose={handleDismiss}
        />
      </main>
    </div>
  );
}
