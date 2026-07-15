"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type LocationData = {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
};

type Options = {
  onUpdate: (loc: LocationData) => void;
  onError?: (msg: string) => void;
  watch?: boolean;
  enableHighAccuracy?: boolean;
};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) throw new Error();
    const data = await res.json() as { display_name?: string; address?: Record<string, string> };
    const a = data.address ?? {};
    const parts = [
      a.road ?? a.pedestrian ?? a.path ?? a.footway,
      a.suburb ?? a.neighbourhood ?? a.village ?? a.town ?? a.city_district,
      a.city ?? a.town ?? a.county,
    ].filter(Boolean);
    return parts.length
      ? parts.join(", ")
      : (data.display_name?.split(",").slice(0, 2).join(", ") ?? "Current location");
  } catch {
    return "Current location";
  }
}

export function useLocationTracking({
  onUpdate,
  onError,
  watch = true,
  enableHighAccuracy = true,
}: Options) {
  const watchIdRef      = useRef<number | null>(null);
  const mountedRef      = useRef(false);
  const geocodeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef     = useRef(onUpdate);
  const onErrorRef      = useRef(onError);
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");

  // Keep refs in sync so stale closures never matter
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onErrorRef.current = onError; },  [onError]);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    if (!mountedRef.current) return;
    const { latitude: lat, longitude: lng } = pos.coords;

    // Immediate update with coords
    onUpdateRef.current({ lat, lng, address: "Current location" });

    // Debounced reverse geocode
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      const address = await reverseGeocode(lat, lng);
      if (mountedRef.current) onUpdateRef.current({ lat, lng, address });
    }, 1500);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const msgs: Record<number, string> = {
      1: "Location permission denied. Enable it in browser/app settings.",
      2: "Location unavailable. Check your GPS.",
      3: "Location request timed out.",
    };
    onErrorRef.current?.(msgs[err.code] ?? "Unable to get location.");
  }, []);

  // Check & watch permission status
  useEffect(() => {
    if (!("permissions" in navigator)) return;
    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      setPermissionState(status.state);
      status.onchange = () => setPermissionState(status.state);
    }).catch(() => {});
  }, []);

  // Start/stop tracking
  useEffect(() => {
    mountedRef.current = true;

    // Geolocation requires HTTPS except on localhost
    const isSecure = typeof window !== "undefined" &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost");

    if (!isSecure) {
      // On HTTP (e.g. local network IP), silently skip — no error spam
      return;
    }

    if (!("geolocation" in navigator)) {
      onErrorRef.current?.("Geolocation is not supported by this browser.");
      return;
    }

    const opts: PositionOptions = {
      enableHighAccuracy,
      maximumAge: 10_000,
      timeout: 20_000,
    };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition, handleError, opts,
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handlePosition, handleError, { ...opts, maximumAge: 30_000 },
      );
    }

    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, [watch, enableHighAccuracy, handlePosition, handleError]);

  return { permissionState };
}
