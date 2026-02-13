"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import Supercluster from "supercluster";
import { FIPS_TO_STATE, STATE_NAMES } from "@/lib/fips-utils";

// ── Types ────────────────────────────────────────────────────────────────

interface StateProperties { name: string }
interface CountyProperties { name: string }

type USTopology = Topology<{
  states: GeometryCollection<StateProperties>;
  counties?: GeometryCollection<CountyProperties>;
}>;

type CountyTopology = Topology<{
  counties: GeometryCollection<CountyProperties>;
}>;

interface PharmacyProps {
  status: number;
  index: number;
}

export interface PharmacyFullDetail {
  n: string; c: string; s: string; z: string; p: string;
  a1: string; a2: string; ln: string; dn: string;
  on: string; ot: string; op: string; ed: string; lu: string;
}

export interface ClusterPharmacy {
  detail: PharmacyFullDetail;
  status: number;
}

interface InteractiveMapProps {
  onPharmacyClick?: (detail: PharmacyFullDetail, status: number) => void;
  onClusterClick?: (pharmacies: ClusterPharmacy[]) => void;
  onDismiss?: () => void;
  selectedPharmacyIndex?: number | null;
}

export interface InteractiveMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

type CountyDensity = Record<string, number[]>;

// Status colors
const STATUS_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];
const STATUS_LABELS = ["Active", "Likely Active", "Uncertain", "Likely Closed"];

// ── Component ────────────────────────────────────────────────────────────

const InteractiveMap = forwardRef<InteractiveMapHandle, InteractiveMapProps>(
  function InteractiveMap(props, ref) {
    const { onPharmacyClick, onClusterClick, onDismiss, selectedPharmacyIndex } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
    const projectionRef = useRef<d3.GeoProjection | null>(null);
    const pathRef = useRef<d3.GeoPath<unknown, d3.GeoPermissibleObjects> | null>(null);
    const stateFeaturesRef = useRef<GeoJSON.Feature[]>([]);
    const clusterIndexRef = useRef<Supercluster<PharmacyProps> | null>(null);
    const pharmacyDetailsRef = useRef<PharmacyFullDetail[] | null>(null);
    const countyDensityRef = useRef<CountyDensity | null>(null);

    const [stateTopoData, setStateTopoData] = useState<USTopology | null>(null);
    const [countyTopoData, setCountyTopoData] = useState<CountyTopology | null>(null);
    const [countiesLoading, setCountiesLoading] = useState(false);
    const [pharmacyDataLoaded, setPharmacyDataLoaded] = useState(false);
    const [hoverInfo, setHoverInfo] = useState<{
      type: "state" | "pharmacy" | "cluster";
      label: string;
      detail?: string;
    } | null>(null);
    const tooltipPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const tooltipRafRef = useRef<number>(0);
    const [currentZoom, setCurrentZoom] = useState(1);

    // ── Expose zoom controls via ref ──────────────────────────────────

    useImperativeHandle(ref, () => ({
      zoomIn() {
        if (svgRef.current && zoomRef.current) {
          d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
        }
      },
      zoomOut() {
        if (svgRef.current && zoomRef.current) {
          d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1 / 1.5);
        }
      },
      resetZoom() {
        if (svgRef.current && zoomRef.current) {
          d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
        }
      },
    }));

    // ── Fetch data ────────────────────────────────────────────────────

    useEffect(() => {
      fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
        .then((r) => r.json())
        .then((data: USTopology) => setStateTopoData(data))
        .catch(() => {});
    }, []);

    useEffect(() => {
      fetch("/data/pharmacy-points.json")
        .then((r) => r.json())
        .then((points: number[][]) => {
          // Build GeoJSON features for supercluster
          const features: GeoJSON.Feature<GeoJSON.Point, PharmacyProps>[] = points.map(
            ([lon, lat, status], i) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [lon, lat] },
              properties: { status, index: i },
            })
          );

          const index = new Supercluster<PharmacyProps>({
            radius: 100,
            maxZoom: 18,
            map: (props) => ({
              status: props.status,
              index: props.index,
              // Track status counts for cluster coloring
              s0: props.status === 0 ? 1 : 0,
              s1: props.status === 1 ? 1 : 0,
              s2: props.status === 2 ? 1 : 0,
              s3: props.status === 3 ? 1 : 0,
            }),
            reduce: (accumulated: Record<string, number>, props: Record<string, number>) => {
              accumulated.s0 = (accumulated.s0 || 0) + (props.s0 || 0);
              accumulated.s1 = (accumulated.s1 || 0) + (props.s1 || 0);
              accumulated.s2 = (accumulated.s2 || 0) + (props.s2 || 0);
              accumulated.s3 = (accumulated.s3 || 0) + (props.s3 || 0);
            },
          });

          index.load(features);
          clusterIndexRef.current = index;
          setPharmacyDataLoaded(true);
          console.log(`Supercluster loaded: ${points.length} pharmacies`);
        })
        .catch((e) => console.error("Failed to load pharmacy points:", e));

      // Lazy-load details
      fetch("/data/pharmacy-details.json")
        .then((r) => r.json())
        .then((details) => {
          pharmacyDetailsRef.current = details;
        })
        .catch(() => {});
    }, []);

    // ── Lazy-load county TopoJSON ─────────────────────────────────────

    // Eagerly load county density data
    useEffect(() => {
      fetch("/data/county-density.json")
        .then((r) => r.json())
        .then((data: CountyDensity) => {
          countyDensityRef.current = data;
        })
        .catch(() => {});
    }, []);

    const loadCounties = useCallback(() => {
      if (countyTopoData || countiesLoading) return;
      setCountiesLoading(true);
      fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
        .then((r) => r.json())
        .then((data: CountyTopology) => {
          setCountyTopoData(data);
          setCountiesLoading(false);
        })
        .catch(() => setCountiesLoading(false));
    }, [countyTopoData, countiesLoading]);

    useEffect(() => {
      if (currentZoom > 1.5) loadCounties();
    }, [currentZoom, loadCounties]);

    // ── Tooltip mouse tracking ────────────────────────────────────────

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      tooltipPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!tooltipRafRef.current) {
        tooltipRafRef.current = requestAnimationFrame(() => {
          setTooltipPos(tooltipPosRef.current);
          tooltipRafRef.current = 0;
        });
      }
    }, []);

    // ── Pharmacy cluster rendering ────────────────────────────────────

    const updateClusters = useCallback(
      (transform: d3.ZoomTransform, k: number) => {
        if (!gRef.current || !clusterIndexRef.current || !projectionRef.current) return;

        const projection = projectionRef.current;
        const index = clusterIndexRef.current;
        const pharmacyGroup = gRef.current.select<SVGGElement>(".pharmacies");

        // Map D3 scale to supercluster zoom
        const scZoom = Math.floor(3 + Math.log2(Math.max(1, k)) * 3);

        // Compute viewport bbox from visible area for performance + fewer off-screen clusters
        let bbox: GeoJSON.BBox = [-180, 17, -65, 72]; // fallback: full US
        if (containerRef.current) {
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          // Invert the four corners of the viewport through the zoom transform + projection
          const inv = transform.invert([0, 0]);
          const inv2 = transform.invert([w, h]);
          const tl = projection.invert?.([inv[0], inv[1]]);
          const br = projection.invert?.([inv2[0], inv2[1]]);
          if (tl && br && isFinite(tl[0]) && isFinite(br[0])) {
            // Add padding to avoid popping at edges
            const pad = 2;
            bbox = [
              Math.max(-180, Math.min(tl[0], br[0]) - pad),
              Math.max(-90, Math.min(tl[1], br[1]) - pad),
              Math.min(180, Math.max(tl[0], br[0]) + pad),
              Math.min(90, Math.max(tl[1], br[1]) + pad),
            ];
          }
        }

        const clusters = index.getClusters(bbox, scZoom);

        // D3 data join
        type ClusterFeature = (typeof clusters)[0];
        const nodes = pharmacyGroup
          .selectAll<SVGGElement, ClusterFeature>(".ph-node")
          .data(clusters, (d) => {
            const props = d.properties as Record<string, unknown>;
            return props.cluster_id !== undefined
              ? `c-${props.cluster_id}`
              : `p-${props.index}`;
          });

        // Exit
        nodes.exit().remove();

        // Enter
        const enter = nodes.enter().append("g").attr("class", "ph-node");

        enter.append("circle");
        enter.append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("pointer-events", "none")
          .attr("fill", "#fff")
          .attr("font-size", 10)
          .attr("font-weight", "bold");

        // Enter + Update
        const merged = enter.merge(nodes);

        merged.each(function (d) {
          const g = d3.select(this);
          const coords = d.geometry.coordinates;
          const projected = projection(coords as [number, number]);
          if (!projected) {
            g.style("display", "none");
            return;
          }
          g.style("display", "");

          const [x, y] = projected;
          g.attr("transform", `translate(${x},${y})`);

          const circle = g.select("circle");
          const text = g.select("text");

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = d.properties as any;

          if (p.cluster) {
            // Cluster
            const count = p.point_count || 0;
            const r = Math.min(30, 8 + Math.sqrt(count) * 1.5);
            const counts = [p.s0 || 0, p.s1 || 0, p.s2 || 0, p.s3 || 0];
            const dominantIdx = counts.indexOf(Math.max(...counts));
            const color = STATUS_COLORS[dominantIdx];

            const screenR = r / k;
            circle
              .attr("r", screenR)
              .attr("fill", color)
              .attr("fill-opacity", 0.85)
              .attr("stroke", "#fff")
              .attr("stroke-width", 1 / k)
              .attr("stroke-opacity", 0.3)
              .attr("cursor", "pointer");

            const fontSize = Math.max(7, Math.min(11, r * 0.6)) / k;
            text
              .text(count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count)
              .attr("font-size", fontSize)
              .style("display", screenR > 4 / k ? "" : "none");

            // Click cluster: open sidebar with pharmacy list
            g.on("click", (event: MouseEvent) => {
              event.stopPropagation();
              if (!onClusterClick) return;
              const details = pharmacyDetailsRef.current;
              if (!details) return;
              // Get all leaf points in this cluster (max 200 to avoid perf issues)
              const leaves = index.getLeaves(p.cluster_id, 200);
              const pharmacies: ClusterPharmacy[] = leaves.map((leaf) => {
                const lp = leaf.properties as PharmacyProps;
                return {
                  detail: details[lp.index] || {} as PharmacyFullDetail,
                  status: lp.status,
                };
              });
              onClusterClick(pharmacies);
            });

            // Hover
            g.on("mouseenter", () => {
              const breakdown = counts.map((c, i) => `${STATUS_LABELS[i]}: ${c}`).join(" / ");
              setHoverInfo({
                type: "cluster",
                label: `${count.toLocaleString()} pharmacies`,
                detail: breakdown,
              });
            }).on("mouseleave", () => setHoverInfo(null));
          } else {
            // Individual pharmacy point
            const status = p.status as number;
            const color = STATUS_COLORS[status];

            const dotR = 4 / k;
            circle
              .attr("r", dotR)
              .attr("fill", color)
              .attr("fill-opacity", 0.9)
              .attr("stroke", "#000")
              .attr("stroke-width", 0.5 / k)
              .attr("stroke-opacity", 0.6)
              .attr("cursor", "pointer");

            text.style("display", "none");

            // Click to open sidebar
            g.on("click", (event: MouseEvent) => {
              event.stopPropagation();
              const details = pharmacyDetailsRef.current;
              const idx = p.index as number;
              if (details && details[idx] && onPharmacyClick) {
                onPharmacyClick(details[idx], status);
              }
            });

            // Hover
            g.on("mouseenter", () => {
              circle.attr("r", 6 / k).attr("fill-opacity", 1);
              const details = pharmacyDetailsRef.current;
              const idx = p.index as number;
              if (details && details[idx]) {
                const det = details[idx];
                setHoverInfo({
                  type: "pharmacy",
                  label: det.n,
                  detail: `${det.c}, ${det.s} ${det.z} -- ${STATUS_LABELS[status]}`,
                });
              } else {
                setHoverInfo({
                  type: "pharmacy",
                  label: STATUS_LABELS[status],
                  detail: "",
                });
              }
            }).on("mouseleave", () => {
              circle.attr("r", dotR).attr("fill-opacity", 0.9);
              setHoverInfo(null);
            });
          }
        });
      },
      [onPharmacyClick, onClusterClick]
    );

    // ── Main D3 render ────────────────────────────────────────────────

    useEffect(() => {
      if (!stateTopoData || !svgRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const svgEl = svgRef.current;
      const topoData = stateTopoData;

      let cancelled = false;
      const rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          renderMap(container, svgEl);
        });
      });

      function renderMap(container: HTMLDivElement, svgEl: SVGSVGElement) {
        const svg = d3.select(svgEl);
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width <= 0 || height <= 0) return;

        svg.attr("width", width).attr("height", height);
        svg.selectAll("*").remove();

        const stateFeatures = topojson.feature(topoData, topoData.objects.states).features;
        stateFeaturesRef.current = stateFeatures;

        const projection = d3.geoAlbersUsa().fitSize([width, height], {
          type: "FeatureCollection",
          features: stateFeatures,
        });

        const path = d3.geoPath().projection(projection);
        projectionRef.current = projection;
        pathRef.current = path;

        const g = svg.append("g");
        gRef.current = g;

        // County layer
        const countyGroup = g.append("g").attr("class", "counties").style("opacity", 0);

        // State fills (uniform dark)
        g.append("g")
          .attr("class", "states")
          .selectAll("path")
          .data(stateFeatures)
          .join("path")
          .attr("d", (d) => path(d) || "")
          .attr("fill", "#0a0a0a")
          .attr("stroke", "none")
          .on("mouseenter", function (_, d) {
            const fips = String(d.id).padStart(2, "0");
            const stateAbbr = FIPS_TO_STATE[fips];
            const name = stateAbbr ? STATE_NAMES[stateAbbr] || stateAbbr : "";
            if (name) {
              setHoverInfo({ type: "state", label: name });
            }
            d3.select(this).attr("stroke", "#1a3a35").attr("stroke-width", 1);
          })
          .on("mouseleave", function () {
            setHoverInfo(null);
            d3.select(this).attr("stroke", "none");
          });

        // State borders
        const stateMesh = topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b);
        g.append("g")
          .attr("class", "state-borders")
          .append("path")
          .datum(stateMesh)
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "#2a2a2a")
          .attr("stroke-width", 1)
          .attr("vector-effect", "non-scaling-stroke")
          .attr("pointer-events", "none");

        // Pharmacy cluster layer (above borders)
        g.append("g").attr("class", "pharmacies");

        // Label layer
        const labelGroup = g.append("g").attr("class", "labels").style("opacity", 0);
        stateFeatures.forEach((feature) => {
          const fips = String(feature.id).padStart(2, "0");
          const stateAbbr = FIPS_TO_STATE[fips];
          if (!stateAbbr) return;
          const centroid = path.centroid(feature);
          if (isNaN(centroid[0]) || isNaN(centroid[1])) return;
          labelGroup
            .append("text")
            .attr("x", centroid[0])
            .attr("y", centroid[1])
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", 10)
            .attr("fill", "#4a4540")
            .attr("pointer-events", "none")
            .text(stateAbbr);
        });

        // ── Zoom (Google Maps style) ─────────────────────────────────

        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 40])
          .on("zoom", (event) => {
            g.attr("transform", event.transform.toString());
            const k = event.transform.k;
            setCurrentZoom(k);

            countyGroup.style("opacity", k > 1.5 ? Math.min(1, (k - 1.5) / 2) : 0);
            labelGroup.style("opacity", k > 2 && k < 6 ? Math.min(1, (6 - k) / 2) : 0);
            // Fade state borders at very high zoom so individual dots stand out
            g.select(".state-borders").style("opacity", k > 10 ? Math.max(0.2, 1 - (k - 10) / 10) : 1);

            // Update pharmacy clusters
            updateClusters(event.transform, k);
          });

        zoomRef.current = zoom;
        svg.call(zoom);

        // Double-click to reset
        svg.on("dblclick.zoom", null);
        svg.on("dblclick", () => {
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        });

        // Click empty space to dismiss sidebar
        svg.on("click", () => {
          if (onDismiss) onDismiss();
        });

        // Initial cluster render
        updateClusters(d3.zoomIdentity, 1);
      }

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
      };
    }, [stateTopoData, updateClusters]);

    // ── Re-render clusters when pharmacy data loads ────────────────────

    useEffect(() => {
      if (!pharmacyDataLoaded || !gRef.current || !svgRef.current) return;
      const transform = d3.zoomTransform(svgRef.current);
      updateClusters(transform, transform.k);
    }, [pharmacyDataLoaded, updateClusters]);

    // ── County layer with heat map fills ──────────────────────────────

    useEffect(() => {
      if (!countyTopoData || !gRef.current || !pathRef.current) return;
      const path = pathRef.current;
      const countyGroup = gRef.current.select<SVGGElement>(".counties");
      if (!countyGroup.selectAll("path").empty()) return;

      const density = countyDensityRef.current;
      const countyFeatures = topojson.feature(countyTopoData, countyTopoData.objects.counties).features;

      // Heat map color scale (dark teal bins)
      const heatColors = ["#0a0a0a", "#0c1614", "#0f201d", "#122b27", "#163a34"];
      const heatScale = d3.scaleQuantize<string>()
        .domain([1, 50])
        .range(heatColors.slice(1)); // 1-50+ maps to 4 bins

      countyGroup
        .selectAll("path")
        .data(countyFeatures)
        .join("path")
        .attr("d", (d) => path(d as d3.GeoPermissibleObjects) || "")
        .attr("fill", (d) => {
          if (!density) return "#0a0a0a";
          const fips = String(d.id).padStart(5, "0");
          const counts = density[fips];
          if (!counts || counts[0] === 0) return "#0a0a0a";
          return heatScale(counts[0]);
        })
        .attr("stroke", "#1a1a1a")
        .attr("stroke-width", 0.3)
        .attr("vector-effect", "non-scaling-stroke")
        .attr("pointer-events", "all")
        .on("mouseenter", function (_, d) {
          if (!density) return;
          const fips = String(d.id).padStart(5, "0");
          const counts = density[fips];
          if (!counts || counts[0] === 0) return;
          const name = (d.properties as { name?: string })?.name || `County ${fips}`;
          // Look up state from first 2 digits of FIPS
          const stateFips = fips.slice(0, 2);
          const stateAbbr = FIPS_TO_STATE[stateFips] || "";
          setHoverInfo({
            type: "state",
            label: `${name}, ${stateAbbr}`,
            detail: `${counts[0]} pharmacies (${counts[1]} active)`,
          });
          d3.select(this).attr("stroke", "#14b8a6").attr("stroke-width", 1);
        })
        .on("mouseleave", function () {
          setHoverInfo(null);
          d3.select(this).attr("stroke", "#1a1a1a").attr("stroke-width", 0.3);
        });

      countyGroup.style("opacity", currentZoom > 1.5 ? Math.min(1, (currentZoom - 1.5) / 2) : 0);
    }, [countyTopoData, currentZoom]);

    // ── Resize handler ────────────────────────────────────────────────

    useEffect(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;

      const observer = new ResizeObserver(() => {
        if (!stateTopoData || !svgRef.current || !gRef.current) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width <= 0 || height <= 0) return;

        const svg = d3.select(svgRef.current);
        svg.attr("width", width).attr("height", height);

        const features = stateFeaturesRef.current;
        if (features.length === 0) return;

        const projection = d3.geoAlbersUsa().fitSize([width, height], {
          type: "FeatureCollection",
          features,
        });
        const path = d3.geoPath().projection(projection);
        projectionRef.current = projection;
        pathRef.current = path;

        const g = gRef.current;
        g.select(".states")
          .selectAll<SVGPathElement, GeoJSON.Feature>("path")
          .attr("d", (d) => path(d) || "");

        const stateMesh = topojson.mesh(stateTopoData, stateTopoData.objects.states, (a, b) => a !== b);
        g.select(".state-borders").select("path").attr("d", path(stateMesh) || "");

        g.select(".labels").selectAll("text").remove();
        features.forEach((feature) => {
          const fips = String(feature.id).padStart(2, "0");
          const stateAbbr = FIPS_TO_STATE[fips];
          if (!stateAbbr) return;
          const centroid = path.centroid(feature);
          if (isNaN(centroid[0]) || isNaN(centroid[1])) return;
          g.select(".labels")
            .append("text")
            .attr("x", centroid[0])
            .attr("y", centroid[1])
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", 10)
            .attr("fill", "#4a4540")
            .attr("pointer-events", "none")
            .text(stateAbbr);
        });

        if (countyTopoData) {
          g.select(".counties")
            .selectAll<SVGPathElement, GeoJSON.Feature>("path")
            .attr("d", (d) => path(d as d3.GeoPermissibleObjects) || "");
        }

        // Re-render clusters at new projection
        const transform = d3.zoomTransform(svgRef.current);
        updateClusters(transform, transform.k);
      });

      observer.observe(container);
      return () => observer.disconnect();
    }, [stateTopoData, countyTopoData, updateClusters]);

    // ── Render ────────────────────────────────────────────────────────

    if (!stateTopoData) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#14b8a6] border-t-transparent animate-spin" />
            <p className="text-sm text-[#4a4540]">Loading map data...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ background: "#050505", cursor: "grab" }}
        onMouseMove={handleMouseMove}
      >
        <svg ref={svgRef} className="w-full h-full" style={{ cursor: "grab" }} />

        {/* Loading indicators */}
        {!pharmacyDataLoaded && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a]/90 border border-[#1a1a1a] text-xs text-[#4a4540]">
            <div className="w-3 h-3 rounded-full border border-[#14b8a6] border-t-transparent animate-spin" />
            Loading 41,752 pharmacies...
          </div>
        )}

        {countiesLoading && (
          <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 rounded bg-[#0a0a0a]/90 border border-[#1a1a1a] text-xs text-[#4a4540]">
            <div className="w-3 h-3 rounded-full border border-[#14b8a6] border-t-transparent animate-spin" />
            Loading counties...
          </div>
        )}

        {/* Zoom level */}
        {currentZoom > 1.1 && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#0a0a0a]/90 border border-[#1a1a1a] text-xs text-[#4a4540]">
            {currentZoom.toFixed(1)}x
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="card-glass rounded-lg px-4 py-2 flex items-center gap-4">
            {STATUS_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[i] }}
                />
                <span className="text-xs text-[#8a8580] whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoverInfo && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-[#0a0a0a]/95 border border-[#2a2a2a] backdrop-blur-sm text-sm whitespace-nowrap"
            style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 10 }}
          >
            <span className="text-[#f5f0eb] font-medium">{hoverInfo.label}</span>
            {hoverInfo.detail && (
              <div className="text-xs text-[#8a8580] mt-0.5">{hoverInfo.detail}</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

InteractiveMap.displayName = "InteractiveMap";
export default InteractiveMap;
