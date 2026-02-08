"use client";

import { useState, useRef } from "react";
import { BarChart3 } from "lucide-react";
import type { OverlayId } from "@/lib/overlay-data";
import InteractiveMap from "./components/InteractiveMap";
import MapControls from "./components/MapControls";
import type { InteractiveMapHandle } from "./components/InteractiveMap";

export default function InvestigatePage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isTilted, setIsTilted] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayId>>(new Set());

  const mapRef = useRef<InteractiveMapHandle>(null);

  function handleToggleOverlay(id: OverlayId) {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleStateClick(stateAbbr: string) {
    if (!stateAbbr) {
      setSelectedState(null);
      return;
    }
    setSelectedState(stateAbbr === selectedState ? null : stateAbbr);
  }

  return (
    <div className="h-screen flex flex-col bg-[#050505]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#1a1a1a] bg-[#050505]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-[#f5f0eb] hover:text-[#14b8a6] transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-[#14b8a6]" />
            <span className="text-lg font-semibold tracking-tight">
              MarketScope
            </span>
          </a>
          <div className="h-4 w-px bg-[#1a1a1a]" />
          <span className="text-sm text-[#4a4540] uppercase tracking-[0.15em] font-medium">
            Market Intelligence
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm text-[#8a8580] hover:text-[#f5f0eb] transition-colors"
          >
            Home
          </a>
          <a
            href="/investigate"
            className="text-sm text-[#14b8a6]"
          >
            Explore
          </a>
        </nav>
      </header>

      {/* Full-width map */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div
          className="flex-1 relative min-h-0"
          style={
            isTilted
              ? {
                  transform: "perspective(1200px) rotateX(20deg)",
                  transformOrigin: "center center",
                }
              : undefined
          }
        >
          <InteractiveMap
            ref={mapRef}
            onStateClick={handleStateClick}
            selectedState={selectedState}
            activeOverlays={activeOverlays}
          />
        </div>

        {/* Bottom controls */}
        <div className="shrink-0">
          <MapControls
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onReset={() => {
              mapRef.current?.resetZoom();
              setSelectedState(null);
            }}
            onToggleTilt={() => setIsTilted((v) => !v)}
            isTilted={isTilted}
            selectedState={selectedState}
            onClearState={() => {
              setSelectedState(null);
              mapRef.current?.resetZoom();
            }}
            activeOverlays={activeOverlays}
            onToggleOverlay={handleToggleOverlay}
          />
        </div>
      </main>
    </div>
  );
}
