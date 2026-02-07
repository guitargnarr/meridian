"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

interface GeoMapProps {
  stateStats: Map<string, number>;
  onStateClick?: (stateAbbr: string) => void;
}

// FIPS code to state abbreviation mapping
const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
  "56": "WY", "60": "AS", "66": "GU", "69": "MP", "72": "PR",
  "78": "VI",
};

interface StateProperties {
  name: string;
}

type USTopology = Topology<{
  states: GeometryCollection<StateProperties>;
}>;

export default function GeoMap({ stateStats, onStateClick }: GeoMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topoData, setTopoData] = useState<USTopology | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const maxCount = Math.max(1, ...Array.from(stateStats.values()));

  // Fetch TopoJSON data
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
      .then((r) => r.json())
      .then((data: USTopology) => setTopoData(data))
      .catch(() => {
        // Silently fail -- map just won't render
      });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  // Render map with D3
  useEffect(() => {
    if (!topoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const projection = d3.geoAlbersUsa().fitSize([width, height], {
      type: "FeatureCollection",
      features: topojson.feature(
        topoData,
        topoData.objects.states
      ).features,
    });

    const path = d3.geoPath().projection(projection);
    const features = topojson.feature(
      topoData,
      topoData.objects.states
    ).features;

    // Color scale: void -> teal for threat density
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateRgb("#1a1a1a", "#14b8a6"));

    const g = svg.append("g");

    g.selectAll("path")
      .data(features)
      .join("path")
      .attr("d", (d) => path(d) || "")
      .attr("fill", (d) => {
        const fips = String(d.id).padStart(2, "0");
        const stateAbbr = FIPS_TO_STATE[fips];
        const count = stateAbbr ? stateStats.get(stateAbbr) || 0 : 0;
        return count > 0
          ? (colorScale(count) as string)
          : "#0a0a0a";
      })
      .attr("stroke", "#2a2a2a")
      .attr("stroke-width", 0.5)
      .attr("cursor", (d) => {
        const fips = String(d.id).padStart(2, "0");
        const stateAbbr = FIPS_TO_STATE[fips];
        const count = stateAbbr ? stateStats.get(stateAbbr) || 0 : 0;
        return count > 0 ? "pointer" : "default";
      })
      .on("mouseenter", function (_, d) {
        const fips = String(d.id).padStart(2, "0");
        const stateAbbr = FIPS_TO_STATE[fips];
        setHoveredState(stateAbbr || null);
        d3.select(this)
          .attr("stroke", "#14b8a6")
          .attr("stroke-width", 1.5)
          .raise();
      })
      .on("mouseleave", function () {
        setHoveredState(null);
        d3.select(this)
          .attr("stroke", "#2a2a2a")
          .attr("stroke-width", 0.5);
      })
      .on("click", (_, d) => {
        const fips = String(d.id).padStart(2, "0");
        const stateAbbr = FIPS_TO_STATE[fips];
        if (stateAbbr && stateStats.has(stateAbbr)) {
          onStateClick?.(stateAbbr);
        }
      });
  }, [topoData, stateStats, maxCount, onStateClick]);

  if (!topoData) {
    return (
      <div className="flex items-center justify-center h-full text-[10px] text-[#4a4540]">
        Loading map...
      </div>
    );
  }

  const hoveredCount = hoveredState ? stateStats.get(hoveredState) || 0 : 0;

  return (
    <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "#050505" }}
      />
      {hoveredState && (
        <div
          className="absolute pointer-events-none z-10 px-2 py-1 rounded bg-[#0a0a0a]/95 border border-[#2a2a2a] text-[10px] whitespace-nowrap"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 8,
          }}
        >
          <span className="text-[#f5f0eb] font-medium">{hoveredState}</span>
          {hoveredCount > 0 && (
            <span className="text-[#14b8a6] ml-1.5">
              {hoveredCount} phone{hoveredCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
