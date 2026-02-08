"use client";

import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  MapPin,
  X,
  Layers,
} from "lucide-react";
import type { OverlayId } from "@/lib/overlay-data";
import { OVERLAY_CONFIGS } from "@/lib/overlay-data";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleTilt: () => void;
  isTilted: boolean;
  selectedState: string | null;
  onClearState: () => void;
  activeOverlays: Set<OverlayId>;
  onToggleOverlay: (id: OverlayId) => void;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleTilt,
  isTilted,
  selectedState,
  onClearState,
  activeOverlays,
  onToggleOverlay,
}: MapControlsProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-sm">
      {/* Left: Data layer toggles */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 mr-2">
          <Layers className="w-4 h-4 text-[#4a4540]" />
          <span className="text-xs text-[#4a4540] uppercase tracking-[0.1em] font-medium">
            Data Layers
          </span>
          {activeOverlays.size > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#14b8a6]/10 text-[10px] text-[#14b8a6] font-medium">
              {activeOverlays.size}
            </span>
          )}
        </div>
        {OVERLAY_CONFIGS.map((config) => {
          const active = activeOverlays.has(config.id);
          return (
            <button
              key={config.id}
              onClick={() => onToggleOverlay(config.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                active
                  ? "border-current/30 bg-current/10"
                  : "text-[#4a4540] border-transparent hover:text-[#8a8580] hover:bg-[#1a1a1a]"
              }`}
              style={active ? { color: config.color, borderColor: `${config.color}33`, backgroundColor: `${config.color}1a` } : undefined}
              title={config.description}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: active ? config.color : "#4a4540" }}
              />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Center: Selected state chip */}
      <div className="flex items-center gap-3">
        {selectedState && (
          <button
            onClick={onClearState}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-sm text-[#14b8a6] hover:bg-[#14b8a6]/20 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {selectedState}
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#8a8580] hover:text-[#f5f0eb] transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#8a8580] hover:text-[#f5f0eb] transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#8a8580] hover:text-[#f5f0eb] transition-colors"
          title="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleTilt}
          className={`p-1.5 rounded transition-colors ${
            isTilted
              ? "bg-[#14b8a6]/10 text-[#14b8a6]"
              : "hover:bg-[#1a1a1a] text-[#8a8580] hover:text-[#f5f0eb]"
          }`}
          title="Toggle 2.5D tilt"
        >
          <Box className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
