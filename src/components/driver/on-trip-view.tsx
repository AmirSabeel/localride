'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  Navigation, Phone, AlertTriangle, Star,
  IndianRupee, Route, Timer, CheckCircle2, Circle,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import RideMap, { type RideMapMarker } from '@/components/ui/ride-map';
import { useRouteInfo } from '@/hooks/use-route-info';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

type TripPhase = 'going_to_pickup' | 'at_pickup' | 'on_trip' | 'completed';

const PHASE_STEPS: { key: TripPhase; label: string }[] = [
  { key: 'going_to_pickup', label: 'Going to Pickup' },
  { key: 'at_pickup', label: 'At Pickup' },
  { key: 'on_trip', label: 'On Trip' },
  { key: 'completed', label: 'Completed' },
];

const TRIP_DATA = {
  customer: 'Anita Krishnan',
  pickup: 'Payyoli Beach Road, Payyoli',
  destination: 'Vadakara Bus Stand, Vadakara',
  fare: 85,
  earning: 68,
  distance: 9.8,
  duration: 22,
};

const ROUTE_WAYPOINTS = [
  { x: 50, y: 80 },
  { x: 48, y: 68 },
  { x: 45, y: 55 },
  { x: 42, y: 42 },
  { x: 46, y: 30 },
  { x: 55, y: 22 },
  { x: 62, y: 15 },
];

export default function OnTripView() {
  const { setDriverView, setDriverStatus, driverLocation, activeRide, driverCurrentCustomer, addTripEarning } = useAppStore();
  const [phase, setPhase] = useState<TripPhase>('going_to_pickup');
  const [routeProgress, setRouteProgress] = useState(0);
  const routePointsRef = useRef<[number, number][]>([]);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [customerRating, setCustomerRating] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const tripPickup = activeRide
    ? { lat: activeRide.pickup.lat, lng: activeRide.pickup.lng, address: activeRide.pickup.address }
    : { lat: 11.5194, lng: 75.6421, address: TRIP_DATA.pickup };
  const tripDest = activeRide
    ? { lat: activeRide.destination.lat, lng: activeRide.destination.lng, address: activeRide.destination.address }
    : { lat: 11.6050, lng: 75.5900, address: TRIP_DATA.destination };
  const tripFare = activeRide?.fare ?? TRIP_DATA.fare;
  const tripEarning = Math.round((activeRide?.fare ?? TRIP_DATA.fare) * 0.8);
  // Bug fix: read customer name from driverCurrentCustomer, NOT activeRide.driverName
  const tripCustomer = driverCurrentCustomer ?? TRIP_DATA.customer;

  const animatedEarning = useAnimatedCounter(showCompletion ? tripEarning : 0, 1200);

  // Real road distance + duration from OSRM
  const routeInfo = useRouteInfo(tripPickup, tripDest);
  const realDistance = routeInfo.distance || TRIP_DATA.distance;
  const realDuration = routeInfo.duration || TRIP_DATA.duration;

  // Simulate trip progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('at_pickup'), 3000));
    timers.push(setTimeout(() => setPhase('on_trip'), 5000));
    timers.push(setTimeout(() => { setPhase('completed'); setShowCompletion(true); }, 12000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Animate driver along real route geometry once on_trip
  useEffect(() => {
    if (phase !== 'on_trip') { if (phase !== 'completed') setRouteProgress(0); return; }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    const STEPS = 100;
    let step = 0;
    progressTimerRef.current = setInterval(() => {
      step++;
      setRouteProgress(Math.min(step / STEPS, 1));
      if (step >= STEPS) clearInterval(progressTimerRef.current!);
    }, 80);
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [phase]);

  function interpolateRoute(pts: [number, number][], progress: number) {
    if (!pts.length) return { lat: tripPickup.lat, lng: tripPickup.lng, heading: 0 };
    if (progress <= 0) return { lat: pts[0][0], lng: pts[0][1], heading: 0 };
    if (progress >= 1) { const n = pts.length; return { lat: pts[n-1][0], lng: pts[n-1][1], heading: 0 }; }
    const idx = progress * (pts.length - 1);
    const lo = Math.floor(idx), hi = Math.min(lo + 1, pts.length - 1);
    const frac = idx - lo;
    return {
      lat: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * frac,
      lng: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * frac,
      heading: Math.atan2(pts[hi][1] - pts[lo][1], pts[hi][0] - pts[lo][0]) * (180 / Math.PI),
    };
  }

  const mapMarkers = useMemo((): RideMapMarker[] => {
    const ms: RideMapMarker[] = [
      { lat: tripPickup.lat, lng: tripPickup.lng, type: 'pickup' },
      { lat: tripDest.lat,   lng: tripDest.lng,   type: 'destination' },
    ];
    const pts = routePointsRef.current;
    if (driverLocation) {
      ms.push({ lat: driverLocation.lat, lng: driverLocation.lng, type: 'car' });
    } else if (pts.length > 1 && phase === 'on_trip') {
      const { lat, lng, heading } = interpolateRoute(pts, routeProgress);
      ms.push({ lat, lng, type: 'driver', routeProgress: heading / 360 });
    } else {
      ms.push({ lat: tripPickup.lat, lng: tripPickup.lng, type: 'car' });
    }
    return ms;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverLocation, phase, routeProgress, tripPickup, tripDest]);

  const mapRoute = useMemo(() => ({
    from: { lat: tripPickup.lat, lng: tripPickup.lng },
    to:   { lat: tripDest.lat,   lng: tripDest.lng },
    progress: phase === 'on_trip' ? routeProgress : 0,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tripPickup.lat, tripPickup.lng, tripDest.lat, tripDest.lng, phase, routeProgress]);

  const handleComplete = () => {
    addTripEarning(tripFare); // live earnings update
    setDriverView('home');
    setDriverStatus('online');
    toast.success('Trip completed! Earnings updated.', { icon: '💰' });
  };

  const phaseIndex = PHASE_STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Real Leaflet Map */}
      <RideMap
        center={{ lat: driverLocation?.lat ?? tripPickup.lat, lng: driverLocation?.lng ?? tripPickup.lng }}
        zoom={15}
        markers={mapMarkers}
        route={mapRoute}
        onRouteReady={(pts) => { routePointsRef.current = pts; }}
        interactive={false}
        className="absolute inset-0 w-full h-full"
      />

      {/* Top Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 safe-top"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-strong shadow-premium rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-ride-green animate-pulse" />
            <span className="text-sm font-semibold">On Trip</span>
            <span className="text-xs text-muted-foreground">· {tripCustomer}</span>
          </div>
          <div className="flex gap-2">
            <motion.button
              className="h-9 w-9 rounded-xl bg-ride-green/10 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <Phone className="h-4 w-4 text-ride-green" />
            </motion.button>
            <motion.button
              className="h-9 w-9 rounded-xl bg-ride-red/10 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => toast.error('SOS alert sent! Emergency contacts notified.')}
            >
              <AlertTriangle className="h-4 w-4 text-ride-red" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Panel */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30"
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 28, stiffness: 250 }}
      >
        <div className="glass-strong rounded-t-3xl shadow-float p-5 safe-bottom max-h-[55vh]">
          {/* Route Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex flex-col items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-ride-green flex-shrink-0" />
                <div className="w-0.5 h-6 bg-muted-foreground/20 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium truncate">{tripPickup.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex flex-col items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-sm bg-ride-red flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium truncate">{tripDest.address}</p>
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="flex items-center gap-1 mb-4">
            {PHASE_STEPS.map((step, i) => {
              const isComplete = i < phaseIndex;
              const isCurrent = i === phaseIndex;
              return (
                <div key={step.key} className="flex items-center gap-1 flex-1">
                  <motion.div
                    className="flex items-center gap-1.5 flex-1 min-w-0"
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-ride-green flex-shrink-0" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Circle className="h-4 w-4 text-ride-green fill-ride-green/30 flex-shrink-0" />
                      </motion.div>
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span
                      className={`text-[10px] font-medium truncate ${
                        isComplete ? 'text-ride-green' : isCurrent ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}
                    >
                      {step.label}
                    </span>
                  </motion.div>
                  {i < PHASE_STEPS.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Timer, label: 'ETA', value: phase === 'completed' ? '0 min' : `${Math.max(1, Math.round(realDuration * (1 - routeProgress)))} min` },
              { icon: Route, label: 'Distance', value: routeInfo.loading ? '…' : `${realDistance} km` },
              { icon: IndianRupee, label: 'Fare', value: `₹${tripFare}` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl bg-muted/50 py-2.5 px-2">
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                <span className="text-sm font-bold">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-md mx-auto glass-strong shadow-float rounded-3xl p-6 px-4"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            >
              {/* Success Icon */}
              <motion.div
                className="mx-auto mb-4 h-16 w-16 rounded-full gradient-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
              >
                <CheckCircle2 className="h-8 w-8 text-white" />
              </motion.div>

              <h2 className="text-xl font-bold text-center mb-1">Trip Completed</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">You&apos;ve earned from this trip</p>

              {/* Earnings */}
              <div className="flex items-center justify-center gap-1 mb-6">
                <IndianRupee className="h-6 w-6 text-ride-green" />
              <span className="text-4xl font-bold gradient-text">{animatedEarning}</span>
                <span className="text-sm text-muted-foreground ml-1">earned</span>
              </div>

              {/* Rate Customer */}
              <div className="text-center mb-5">
                <p className="text-sm font-medium mb-2">Rate Customer</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => setCustomerRating(star)}
                      whileTap={{ scale: 0.85 }}
                    >
                      <motion.div
                        animate={customerRating >= star ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            customerRating >= star ? 'text-ride-amber fill-ride-amber' : 'text-muted-foreground/30'
                          }`}
                        />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Complete Button */}
              <motion.button
                onClick={handleComplete}
                className="w-full h-12 rounded-2xl gradient-primary text-white font-semibold text-sm shadow-glow-green btn-premium"
                whileTap={{ scale: 0.97 }}
              >
                Complete
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}