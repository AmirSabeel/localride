"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Phone, MessageCircle, AlertTriangle,
  Star, Clock, Route, Shield, Car, CheckCircle2, Search, UserCheck, CircleDot,
} from "lucide-react";
import { useAppStore, type RideStatus } from "@/store/app-store";
import RideMap, { type RideMapMarker } from "@/components/ui/ride-map";
import { useRouteInfo } from "@/hooks/use-route-info";

const STATUS_STEPS: { key: RideStatus; label: string; icon: React.ElementType }[] = [
  { key: "searching", label: "Searching", icon: Search },
  { key: "confirmed", label: "Confirmed", icon: UserCheck },
  { key: "driver_arriving", label: "Arriving", icon: Car },
  { key: "in_progress", label: "In Progress", icon: CircleDot },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export default function RideTracking() {
  const { activeRide, setActiveRide, setCustomerView } = useAppStore();
  const initialIdx = activeRide ? STATUS_STEPS.findIndex((s) => s.key === activeRide.status) : 0;
  const [statusIndex, setStatusIndex] = useState(initialIdx >= 0 ? initialIdx : 0);
  /** 0–1 continuous progress along the real OSRM geometry */
  const [routeProgress, setRouteProgress] = useState(0);
  /** Real OSRM geometry points, set once route is fetched */
  const routePointsRef = useRef<[number, number][]>([]);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate ride progression through status steps
  useEffect(() => {
    if (statusIndex >= 3) return;
    const timer = setTimeout(() => {
      const next = statusIndex + 1;
      setStatusIndex(next);
      const newStatus = STATUS_STEPS[next].key;
      if (newStatus === "completed") {
        setTimeout(() => setCustomerView("ride-complete"), 2000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [statusIndex, setCustomerView]);

  // Animate driver along the real route once in_progress
  useEffect(() => {
    if (statusIndex < 2) { setRouteProgress(0); return; }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    // Step from current progress to 1.0 over ~15s
    const STEPS = 150;
    const INTERVAL = 100; // ms
    let step = 0;
    progressTimerRef.current = setInterval(() => {
      step++;
      setRouteProgress(Math.min(step / STEPS, 1));
      if (step >= STEPS) clearInterval(progressTimerRef.current!);
    }, INTERVAL);
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [statusIndex]);

  /** Interpolate a lat/lng along the route geometry at progress 0-1 */
  function interpolateRoute(pts: [number, number][], progress: number): { lat: number; lng: number; heading: number } {
    if (!pts.length) return { lat: 0, lng: 0, heading: 0 };
    if (progress <= 0) return { lat: pts[0][0], lng: pts[0][1], heading: 0 };
    if (progress >= 1) {
      const n = pts.length;
      const [lat, lng] = pts[n - 1];
      const [plat, plng] = pts[n - 2] || pts[n - 1];
      return { lat, lng, heading: Math.atan2(lng - plng, lat - plat) * (180 / Math.PI) };
    }
    const idx = progress * (pts.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, pts.length - 1);
    const frac = idx - lo;
    const lat = pts[lo][0] + (pts[hi][0] - pts[lo][0]) * frac;
    const lng = pts[lo][1] + (pts[hi][1] - pts[lo][1]) * frac;
    const heading = Math.atan2(pts[hi][1] - pts[lo][1], pts[hi][0] - pts[lo][0]) * (180 / Math.PI);
    return { lat, lng, heading };
  }

  const mapMarkers = useMemo((): RideMapMarker[] => {
    const ms: RideMapMarker[] = [];
    if (activeRide) {
      ms.push({ lat: activeRide.pickup.lat, lng: activeRide.pickup.lng, type: "pickup" });
      ms.push({ lat: activeRide.destination.lat, lng: activeRide.destination.lng, type: "destination" });
    }
    if (statusIndex >= 2 && activeRide) {
      const pts = routePointsRef.current;
      if (pts.length > 1) {
        // Interpolate driver along the real road geometry
        const { lat, lng, heading } = interpolateRoute(pts, routeProgress);
        ms.push({ lat, lng, type: "driver", routeProgress: heading / 360 });
      } else {
        // Fallback: linear interpolation before OSRM geometry arrives
        const frac = routeProgress;
        const lat = activeRide.pickup.lat + (activeRide.destination.lat - activeRide.pickup.lat) * frac;
        const lng = activeRide.pickup.lng + (activeRide.destination.lng - activeRide.pickup.lng) * frac;
        ms.push({ lat, lng, type: "driver" });
      }
    }
    return ms;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide, statusIndex, routeProgress]);

  const mapRoute = useMemo(() =>
    activeRide ? {
      from: { lat: activeRide.pickup.lat, lng: activeRide.pickup.lng },
      to: { lat: activeRide.destination.lat, lng: activeRide.destination.lng },
      progress: statusIndex >= 2 ? routeProgress : 0,
    } : undefined,
    [activeRide, statusIndex, routeProgress]
  );

  const mapCenter = useMemo(() => activeRide
    ? { lat: (activeRide.pickup.lat + activeRide.destination.lat) / 2, lng: (activeRide.pickup.lng + activeRide.destination.lng) / 2 }
    : { lat: 11.5064, lng: 75.6797 },
    [activeRide]
  );

  // Real road distance + duration
  const routeInfo = useRouteInfo(
    activeRide ? activeRide.pickup : null,
    activeRide ? activeRide.destination : null,
  );
  const realDistance = routeInfo.distance || activeRide?.distance || 0;
  const realDuration = routeInfo.duration || activeRide?.duration || 0;
  // ETA counts down as ride progresses
  const remainingEta = Math.max(0, Math.round(realDuration * (1 - statusIndex / (STATUS_STEPS.length - 1))));

  if (!activeRide) return null;

  const currentStatus = STATUS_STEPS[statusIndex];
  const canCancel = statusIndex <= 2;

  const handleCancel = () => {
    setActiveRide(null);
    setCustomerView("home");
    toast.info("Ride cancelled");
  };

  const handleSOS = () => {
    toast.error("Emergency SOS activated! Help is on the way.");
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* Real Leaflet Map */}
      <RideMap
        center={mapCenter}
        zoom={15}
        markers={mapMarkers}
        route={mapRoute}
        onRouteReady={(pts) => { routePointsRef.current = pts; }}
        interactive={false}
        className="absolute inset-0 w-full h-full"
      />

      {/* Top Bar */}
      <motion.div
        className="glass safe-top fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/5"
          whileTap={{ scale: 0.9 }}
          onClick={() => { setActiveRide(null); setCustomerView("home"); }}
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-foreground">Ride in Progress</span>
          <span className="text-[10px] text-muted-foreground capitalize">{currentStatus.label}</span>
        </div>
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          whileTap={{ scale: 0.9 }}
          onClick={handleSOS}
        >
          <AlertTriangle className="h-4.5 w-4.5" />
        </motion.button>
      </motion.div>

      {/* Driver Info Card */}
      <motion.div
        className="glass-strong shadow-premium fixed top-16 left-4 right-4 z-30 mx-auto max-w-md rounded-2xl p-3.5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full gradient-primary text-lg font-bold text-white">
            {activeRide.driverName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{activeRide.driverName}</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-ride-amber text-ride-amber" />
                <span className="text-xs font-medium">{activeRide.driverRating}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {activeRide.vehicleColor} {activeRide.vehicleType} • {activeRide.vehiclePlate}
            </span>
          </div>
          <div className="flex gap-2">
            <motion.button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ride-green/10 text-ride-green"
              whileTap={{ scale: 0.9 }}
              onClick={() => toast.info("Calling driver...")}
            >
              <Phone className="h-4.5 w-4.5" />
            </motion.button>
            <motion.button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground"
              whileTap={{ scale: 0.9 }}
              onClick={() => toast.info("Opening chat...")}
            >
              <MessageCircle className="h-4.5 w-4.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="glass-strong shadow-float safe-bottom rounded-t-3xl px-5 pt-4 pb-6 mx-auto max-w-md">
          {/* Handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/15" />

          {/* Route Summary */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="h-2.5 w-2.5 rounded-full bg-ride-green" />
              <div className="h-6 w-[2px] bg-foreground/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-ride-red" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium truncate">{activeRide.pickup.address}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Destination</p>
                <p className="text-sm font-medium truncate">{activeRide.destination.address}</p>
              </div>
            </div>
          </div>

          {/* Status Stepper */}
          <div className="mb-4">
            <div className="relative flex items-start justify-between">
              {/* connector track */}
              <div className="absolute top-4 left-4 right-4 h-[2px] bg-foreground/10 z-0" />
              {/* completed fill */}
              <div
                className="absolute top-4 left-4 h-[2px] bg-ride-green z-0 transition-all duration-500"
                style={{ width: `calc((100% - 2rem) * ${statusIndex / (STATUS_STEPS.length - 1)})` }}
              />
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === statusIndex;
                const isDone = i < statusIndex;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                    <motion.div
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-premium ${
                        isDone
                          ? "bg-ride-green text-white"
                          : isActive
                          ? "bg-ride-green/15 text-ride-green shadow-glow-green ring-2 ring-ride-green/30"
                          : "bg-foreground/5 text-muted-foreground"
                      }`}
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <StepIcon className="h-3.5 w-3.5" />
                    </motion.div>
                    <span className={`text-[9px] font-medium text-center leading-tight ${
                      isActive ? "text-ride-green" : isDone ? "text-ride-green/70" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-foreground/[0.03] p-2.5 text-center">
              <Clock className="mx-auto mb-1 h-4 w-4 text-ride-green" />
              <p className="text-base font-bold text-foreground">{remainingEta} min</p>
              <p className="text-[10px] text-muted-foreground">ETA</p>
            </div>
            <div className="rounded-xl bg-foreground/[0.03] p-2.5 text-center">
              <Route className="mx-auto mb-1 h-4 w-4 text-ride-green" />
              <p className="text-base font-bold text-foreground">
                {routeInfo.loading ? "…" : `${realDistance} km`}
              </p>
              <p className="text-[10px] text-muted-foreground">Distance</p>
            </div>
            <div className="rounded-xl bg-foreground/[0.03] p-2.5 text-center">
              <Shield className="mx-auto mb-1 h-4 w-4 text-ride-green" />
              <p className="text-base font-bold text-foreground">₹{activeRide.fare}</p>
              <p className="text-[10px] text-muted-foreground">Fare</p>
            </div>
          </div>

          {/* Actions */}
          <AnimatePresence mode="wait">
            {canCancel ? (
              <motion.button
                key="cancel"
                className="w-full rounded-2xl border border-destructive/30 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
                whileTap={{ scale: 0.97 }}
                onClick={handleCancel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Cancel Ride
              </motion.button>
            ) : statusIndex >= 4 ? (
              <motion.button
                key="complete"
                className="btn-premium gradient-primary w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-glow-green"
                whileTap={{ scale: 0.97 }}
                onClick={() => setCustomerView("ride-complete")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Ride Complete
              </motion.button>
            ) : (
              <motion.div
                key="riding"
                className="flex items-center justify-center gap-2 py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-ride-green"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-sm font-medium text-muted-foreground">Ride in progress...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}