"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

export type RideMapMarker = {
  lat: number;
  lng: number;
  type: "pickup" | "destination" | "car" | "driver" | "pin";
  label?: string;
  /** 0-1 progress along route — used to rotate the driver car icon */
  routeProgress?: number;
};

export type RideMapRoute = {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  /** 0–1: how much of the route is "completed" (colours the green segment) */
  progress?: number;
};

interface RideMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: RideMapMarker[];
  route?: RideMapRoute;
  onClick?: (lat: number, lng: number) => void;
  /** Called once OSRM geometry is ready with the full [lat,lng][] array */
  onRouteReady?: (points: [number, number][]) => void;
  className?: string;
  interactive?: boolean;
}

const TILE_LIGHT = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_DARK  = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
const TILE_ATTR  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// ── marker helpers ────────────────────────────────────────────────────────────

function markerHtml(m: RideMapMarker, isDark: boolean): { html: string; anchor: [number, number] } {
  const bg  = isDark ? "#1f2937" : "#ffffff";
  const fg  = isDark ? "#f9fafb" : "#111111";
  const bdr = isDark ? "#374151" : "#e5e7eb";

  if (m.type === "pickup") {
    return {
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
      anchor: [8, 8],
    };
  }

  if (m.type === "destination") {
    return {
      html: `<div style="display:flex;flex-direction:column;align-items:center">
        <div style="width:32px;height:32px;border-radius:10px;background:${fg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.4)">
          <div style="width:10px;height:10px;border-radius:50%;background:${bg}"></div>
        </div>
        <div style="width:2px;height:10px;background:${fg};opacity:0.5"></div>
        <div style="width:5px;height:5px;border-radius:50%;background:${fg};opacity:0.4"></div>
      </div>`,
      anchor: [16, 52],
    };
  }

  if (m.type === "car") {
    return {
      html: `<div style="position:relative;width:22px;height:22px">
        <div style="position:absolute;width:38px;height:38px;border-radius:50%;background:rgba(59,130,246,0.18);top:50%;left:50%;transform:translate(-50%,-50%);animation:pulse 2s ease-in-out infinite"></div>
        <div style="position:absolute;width:22px;height:22px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,0.5);top:0;left:0"></div>
      </div>`,
      anchor: [11, 11],
    };
  }

  if (m.type === "driver") {
    // Compute heading rotation from routeProgress if provided
    const deg = m.routeProgress !== undefined ? Math.round(m.routeProgress * 360) : 0;
    return {
      html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="
          width:40px;height:40px;border-radius:50%;
          background:${bg};border:2px solid ${bdr};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 16px rgba(0,0,0,0.22);
          transform:rotate(${deg}deg);
          transition:transform 0.5s ease">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="${fg}" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        ${m.label ? `<span style="background:${bg};color:${fg};font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.15);border:1px solid ${bdr};white-space:nowrap">${m.label}</span>` : ""}
      </div>`,
      anchor: [20, m.label ? 60 : 40],
    };
  }

  // Generic pin
  return {
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:0">
      <div style="width:28px;height:28px;border-radius:50%;background:${bg};border:1.5px solid ${bdr};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${isDark ? "#9ca3af" : "#6b7280"}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
      </div>
      ${m.label ? `<span style="margin-top:1px;white-space:nowrap;background:${bg};color:${fg};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.12);border:1px solid ${bdr}">${m.label}</span>` : ""}
    </div>`,
    anchor: [14, m.label ? 50 : 28],
  };
}

// ── component ─────────────────────────────────────────────────────────────────

export default function RideMap({
  center = { lat: 11.4400, lng: 75.7000 },
  zoom = 15,
  markers = [],
  route,
  onClick,
  onRouteReady,
  className = "",
  interactive = true,
}: RideMapProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef         = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileRef        = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef     = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLayerRef  = useRef<any>(null);
  const routeAbortRef  = useRef<AbortController | null>(null);
  /** Full OSRM geometry stored so we can split completed/remaining */
  const routePointsRef = useRef<[number, number][]>([]);
  const initDoneRef    = useRef(false);
  const onRouteReadyRef = useRef(onRouteReady);
  onRouteReadyRef.current = onRouteReady;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  // ── helpers ──────────────────────────────────────────────────────────────
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((mk) => mk.remove());
    markersRef.current = [];
  }, []);

  const clearRoute = useCallback(() => {
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
    routeAbortRef.current?.abort();
    routeAbortRef.current = null;
    routePointsRef.current = [];
  }, []);

  /** Split full geometry into completed / remaining segments based on progress (0-1) */
  function splitRoute(pts: [number, number][], progress: number) {
    if (!progress || progress <= 0) return { done: [], left: pts };
    if (progress >= 1) return { done: pts, left: [] };
    const cutIdx = Math.max(1, Math.round(pts.length * progress));
    return { done: pts.slice(0, cutIdx + 1), left: pts.slice(cutIdx) };
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initDoneRef.current || !containerRef.current) return;
    initDoneRef.current = true;

    (async () => {
      const L = (await import("leaflet")).default;
      if (!containerRef.current) return;

      // Fix: delete _leaflet_id so Leaflet doesn't throw on remount
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (containerRef.current as any)._leaflet_id;

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
        attributionControl: true,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      if (interactive) L.control.zoom({ position: "topright" }).addTo(map);
      map.attributionControl.setPrefix(false);

      tileRef.current = L.tileLayer(isDarkRef.current ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTR,
        maxZoom: 20,
        subdomains: "abc",
      }).addTo(map);

      mapRef.current = map;

      if (onClick) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on("click", (e: any) => onClick(e.latlng.lat, e.latlng.lng));
      }

      // Fix: force invalidateSize multiple times to handle any layout delays
      const invalidate = () => { if (mapRef.current) mapRef.current.invalidateSize({ animate: false }); };
      [50, 150, 300, 600, 1200].forEach((ms) => setTimeout(invalidate, ms));

      // Also watch for container resize (handles CSS transitions, panel open/close)
      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => invalidate());
        ro.observe(containerRef.current);
        (map as { _roRef?: ResizeObserver })._roRef = ro;
      }
    })();

    return () => {
      clearRoute();
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any)._roRef?.disconnect();
        mapRef.current.remove();
        mapRef.current = null;
        initDoneRef.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── THEME SWITCH ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!mapRef.current) return;
      tileRef.current.remove();
      tileRef.current = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTR, maxZoom: 20, subdomains: "abc",
      }).addTo(mapRef.current);
    })();
  }, [isDark]);

  // ── CENTER / ZOOM (only when no route) ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || route) return;
    mapRef.current.setView([center.lat, center.lng], zoom, { animate: true, duration: 0.5 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, zoom]);

  // ── MARKERS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!mapRef.current) return;
      clearMarkers();
      markers.forEach((m) => {
        const { html, anchor } = markerHtml(m, isDark);
        const icon = L.divIcon({ html, className: "", iconAnchor: anchor });
        const mk = L.marker([m.lat, m.lng], { icon, interactive: false }).addTo(mapRef.current);
        markersRef.current.push(mk);
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, isDark]);

  // ── ROUTE (fetch + draw) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    clearRoute();
    if (!route) return;

    const ctrl = new AbortController();
    routeAbortRef.current = ctrl;

    (async () => {
      const L = (await import("leaflet")).default;
      if (!mapRef.current || ctrl.signal.aborted) return;

      const { from, to } = route;
      let latlngs: [number, number][] = [[from.lat, from.lng], [to.lat, to.lng]];

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
          { signal: ctrl.signal, cache: "force-cache" },
        );
        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = await res.json() as any;
          const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
          if (coords && coords.length > 1) {
            latlngs = coords.map(([lng, lat]) => [lat, lng]);
          }
        }
      } catch {
        if (ctrl.signal.aborted) return;
      }

      if (ctrl.signal.aborted || !mapRef.current) return;

      routePointsRef.current = latlngs;
      onRouteReadyRef.current?.(latlngs);

      drawRoute(L, latlngs, route.progress ?? 0);

      mapRef.current.fitBounds(
        L.latLngBounds(latlngs),
        { padding: [72, 72], maxZoom: 14, animate: true, duration: 0.8 },
      );
    })();

    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.from.lat, route?.from.lng, route?.to.lat, route?.to.lng]);

  // ── ROUTE PROGRESS UPDATE (redraw segments without re-fetching) ───────────
  useEffect(() => {
    if (!mapRef.current || !routePointsRef.current.length || !route) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!mapRef.current) return;
      drawRoute(L, routePointsRef.current, route.progress ?? 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.progress]);

  // ── draw helper ───────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function drawRoute(L: any, pts: [number, number][], progress: number) {
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
    if (!mapRef.current || pts.length < 2) return;

    const dark = isDarkRef.current;
    const { done, left } = splitRoute(pts, progress);
    const layers: { remove: () => void }[] = [];

    const addPolyline = (coords: [number, number][], color: string, weight: number, dashArray?: string) => {
      if (coords.length < 2) return;
      // subtle shadow
      const shadow = L.polyline(coords, {
        color: "rgba(0,0,0,0.12)", weight: weight + 5,
        lineCap: "round", lineJoin: "round", smoothFactor: 1,
      }).addTo(mapRef.current);
      const line = L.polyline(coords, {
        color, weight,
        lineCap: "round", lineJoin: "round", smoothFactor: 1,
        dashArray,
      }).addTo(mapRef.current);
      layers.push({ remove: () => { shadow.remove(); line.remove(); } });
    };

    // Remaining route: white casing + dark/light fill
    if (left.length >= 2) {
      const casing = L.polyline(left, {
        color: dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)",
        weight: 10, lineCap: "round", lineJoin: "round", smoothFactor: 1,
      }).addTo(mapRef.current);
      layers.push({ remove: () => casing.remove() });
      addPolyline(left, dark ? "#e2e8f0" : "#1a1a2e", 6);
    }

    // Completed route: green line
    if (done.length >= 2) {
      addPolyline(done, "#22c55e", 5);
    }

    routeLayerRef.current = { remove: () => layers.forEach((l) => l.remove()) };
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ background: isDark ? "#1e2130" : "#e8e4dc" }}
    />
  );
}
