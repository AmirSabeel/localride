"use client";

import { useState, useEffect, useRef } from "react";

export type RouteInfo = {
  distance: number;   // km, road distance
  duration: number;   // minutes, driving time
  loading: boolean;
};

const FALLBACK_SPEED_KMH = 30; // urban Kerala average

/** Straight-line haversine fallback */
function haversine(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

// Simple in-memory cache: key → RouteInfo
const cache = new Map<string, { distance: number; duration: number }>();

function cacheKey(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  return `${from.lat.toFixed(4)},${from.lng.toFixed(4)}_${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
}

export function useRouteInfo(
  from: { lat: number; lng: number } | null,
  to: { lat: number; lng: number } | null,
): RouteInfo {
  const [info, setInfo] = useState<RouteInfo>({ distance: 0, duration: 0, loading: false });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!from || !to) {
      setInfo({ distance: 0, duration: 0, loading: false });
      return;
    }

    const key = cacheKey(from, to);

    // Return cached result instantly
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      setInfo({ ...cached, loading: false });
      return;
    }

    // Haversine as immediate estimate while OSRM loads
    const straight = haversine(from, to);
    const roadEstimate = parseFloat((straight * 1.3).toFixed(1)); // road factor
    const durationEstimate = Math.round((roadEstimate / FALLBACK_SPEED_KMH) * 60);
    setInfo({ distance: roadEstimate, duration: durationEstimate, loading: true });

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`,
          { signal: ctrl.signal },
        );
        if (!res.ok) throw new Error("OSRM error");

        const data = await res.json() as {
          code?: string;
          routes?: Array<{ distance: number; duration: number }>;
        };

        if (data.code !== "Ok" || !data.routes?.[0]) throw new Error("No route");

        const route = data.routes[0];
        const distance = parseFloat((route.distance / 1000).toFixed(1)); // m → km
        const duration = Math.max(1, Math.round(route.duration / 60));   // s → min

        cache.set(key, { distance, duration });
        if (!ctrl.signal.aborted) {
          setInfo({ distance, duration, loading: false });
        }
      } catch {
        if (!ctrl.signal.aborted) {
          // Keep the haversine estimate, just mark not loading
          setInfo((prev) => ({ ...prev, loading: false }));
        }
      }
    })();

    return () => ctrl.abort();
  }, [from?.lat, from?.lng, to?.lat, to?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return info;
}
