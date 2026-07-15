'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type DriverStatus } from '@/store/app-store';
import { toast } from 'sonner';
import {
  Wifi, WifiOff, Clock, Navigation, Coffee, EyeOff,
  TrendingUp, CalendarDays, History,
  MapPin, Star, Route, IndianRupee, Timer,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import RideMap, { type RideMapMarker } from '@/components/ui/ride-map';
import { useLocationTracking } from '@/hooks/use-location';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import DriverBottomNav from '@/components/driver/driver-bottom-nav';

const STATUS_CYCLE: DriverStatus[] = ['offline', 'online', 'busy', 'break', 'invisible'];

const STATUS_CONFIG: Record<DriverStatus, { icon: typeof Wifi; label: string; colorClass: string; statusClass: string }> = {
  online: { icon: Wifi, label: "You're Online", colorClass: 'driver-status-online', statusClass: 'text-ride-green' },
  busy: { icon: Clock, label: 'Busy', colorClass: 'driver-status-busy', statusClass: 'text-ride-amber' },
  offline: { icon: WifiOff, label: "You're Offline", colorClass: 'driver-status-offline', statusClass: 'text-muted-foreground' },
  on_trip: { icon: Navigation, label: 'On Trip', colorClass: 'driver-status-online', statusClass: 'text-ride-green' },
  break: { icon: Coffee, label: 'On Break', colorClass: 'driver-status-break', statusClass: 'text-purple-500' },
  invisible: { icon: EyeOff, label: 'Invisible', colorClass: 'driver-status-invisible', statusClass: 'text-slate-500' },
};

const MOCK_INCOMING_RIDE = {
  id: 'ride-incoming-1',
  customer: 'Anita Krishnan',
  customerPhone: '+91 94470 12345',
  pickup: { address: 'Payyoli Beach Road, Payyoli' },
  destination: { address: 'Vadakara Bus Stand, Vadakara' },
  fare: 85,
  distance: 9.8,
  duration: 22,
};

function StatusToggle() {
  const { driverStatus, setDriverStatus } = useAppStore();
  const config = STATUS_CONFIG[driverStatus];
  const Icon = config.icon;

  const cycleStatus = useCallback(() => {
    const currentIndex = STATUS_CYCLE.indexOf(driverStatus);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];
    setDriverStatus(nextStatus);

    if (nextStatus === 'online') {
      toast.success('You are now online and visible to riders', { icon: '🟢' });
    } else if (nextStatus === 'busy') {
      toast('You are now busy — no new ride requests', { icon: '🟡' });
    } else if (nextStatus === 'offline') {
      toast('You are now offline', { icon: '⚪' });
    } else if (nextStatus === 'break') {
      toast('On break — ride requests paused', { icon: '☕' });
    } else if (nextStatus === 'invisible') {
      toast('Invisible mode — hidden from riders', { icon: '👁️' });
    }
  }, [driverStatus, setDriverStatus]);

  return (
    <motion.button
      onClick={cycleStatus}
      className={`relative flex items-center gap-3 rounded-full px-6 py-3.5 text-white shadow-lg transition-premium ${config.colorClass}`}
      whileTap={{ scale: 0.96 }}
      layout
    >
      <motion.div
        key={driverStatus}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
      <motion.span
        key={config.label}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-sm font-semibold"
      >
        {config.label}
      </motion.span>
    </motion.button>
  );
}

function TodaySummaryCard() {
  const { todayEarnings, todayTrips } = useAppStore();
  const animatedEarnings = useAnimatedCounter(todayEarnings);

  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Today&apos;s Earnings</p>
      <div className="flex items-baseline gap-1 mb-3">
        <IndianRupee className="h-5 w-5 text-ride-green" />
        <motion.span
          className="text-3xl font-bold tracking-tight gradient-text"
          key={todayEarnings}
        >
          {animatedEarnings.toLocaleString('en-IN')}
        </motion.span>
      </div>
      <div className="flex gap-3">
        {[
          { icon: Route, label: 'Trips', value: todayTrips },
          { icon: Timer, label: 'Hours', value: '5.2h' },
          { icon: Star, label: 'Rating', value: '4.8★' },
        ].map((chip) => (
          <div
            key={chip.label}
            className="flex flex-1 items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2"
          >
            <chip.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{chip.label}</span>
              <span className="text-sm font-semibold">{chip.value}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MapArea() {
  const { driverLocation } = useAppStore();
  const driverMarker: RideMapMarker = {
    lat: driverLocation?.lat ?? 11.5200,
    lng: driverLocation?.lng ?? 75.6420,
    type: 'car',
  };
  const rideMarkers: RideMapMarker[] = [
    { lat: 11.5810, lng: 75.6020, type: 'driver', label: '₹85' },
    { lat: 11.4360, lng: 75.6950, type: 'driver', label: '₹45' },
    { lat: 11.5620, lng: 75.6210, type: 'driver', label: '₹65' },
  ];

  return (
    <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-premium">
      <RideMap
        center={{ lat: driverLocation?.lat ?? 11.5200, lng: driverLocation?.lng ?? 75.6420 }}
        zoom={14}
        markers={[driverMarker, ...rideMarkers]}
        interactive={false}
        className="w-full h-full"
      />
    </div>
  );
}

function QuickActions() {
  const { setDriverView } = useAppStore();

  const actions = [
    { icon: TrendingUp, label: 'Earnings', view: 'earnings' as const, color: 'text-ride-green', bg: 'bg-ride-green/10' },
    { icon: CalendarDays, label: 'Schedule', view: 'schedule' as const, color: 'text-ride-amber', bg: 'bg-ride-amber/10' },
    { icon: History, label: 'History', view: 'history' as const, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          onClick={() => setDriverView(action.view)}
          className="flex flex-col items-center gap-2 rounded-2xl glass-strong shadow-premium px-5 py-4 min-w-[100px] flex-shrink-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className={`h-10 w-10 rounded-xl ${action.bg} flex items-center justify-center`}>
            <action.icon className={`h-5 w-5 ${action.color}`} />
          </div>
          <span className="text-xs font-semibold">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function IncomingRideOverlay({ onDeclined }: { onDeclined: () => void }) {
  const { incomingRide, setIncomingRide, setDriverStatus, setDriverView, setDriverCurrentCustomer } = useAppStore();
  const [tick, setTick] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef(15);
  const rideIdRef = useRef<string | null>(null);

  const countdown = incomingRide ? tick : 15;

  useEffect(() => {
    if (!incomingRide) return;
    const rideId = incomingRide.id;
    rideIdRef.current = rideId;
    countdownRef.current = 15;
    setTick(15);
    timerRef.current = setInterval(() => {
      countdownRef.current -= 1;
      if (countdownRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIncomingRide(null);
        toast('Ride request expired');
        onDeclined(); // allow re-simulation
      }
      if (rideIdRef.current === rideId) {
        setTick(Math.max(0, countdownRef.current));
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [incomingRide, setIncomingRide, onDeclined]);

  if (!incomingRide) return null;

  const handleAccept = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Store the customer name so OnTripView can display it correctly
    setDriverCurrentCustomer(incomingRide.customer ?? 'Passenger');
    setDriverStatus('on_trip');
    setDriverView('on-trip');
    setIncomingRide(null);
    toast.success('Ride accepted! Navigating to pickup...', { icon: '🎉' });
  };

  const handleDecline = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIncomingRide(null);
    toast('Ride declined');
    onDeclined(); // Bug fix: allow a new simulated ride after a delay
  };

  const countdownPct = (countdown / 15) * 100;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleDecline}
      />
      <motion.div
        className="relative w-full max-w-md mx-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="glass-strong shadow-float rounded-t-3xl p-6 safe-bottom">
          {/* Countdown bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-3xl overflow-hidden">
            <motion.div
              className="h-full gradient-primary"
              animate={{ width: `${countdownPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full gradient-primary animate-pulse" />
              <span className="text-sm font-semibold text-ride-green">New Ride Request</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {countdown}s remaining
            </span>
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
              {incomingRide.customer?.[0] || 'R'}
            </div>
            <div>
              <p className="font-semibold text-sm">{incomingRide.customer}</p>
              <p className="text-xs text-muted-foreground">{incomingRide.distance} km · {incomingRide.duration} min</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold gradient-text">₹{incomingRide.fare}</p>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-2 mb-5 rounded-xl bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-ride-green flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{incomingRide.pickup?.address || 'Payyoli Town Centre'}</p>
            </div>
            <div className="ml-1 border-l-2 border-dashed border-muted-foreground/30 h-3" />
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2.5 w-2.5 rounded-sm bg-ride-red flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{incomingRide.destination?.address || 'Vadakara Bus Stand'}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleDecline}
              className="flex-1 h-14 rounded-2xl bg-muted text-muted-foreground font-semibold text-sm transition-premium"
              whileTap={{ scale: 0.96 }}
            >
              Decline
            </motion.button>
            <motion.button
              onClick={handleAccept}
              className="relative flex-1 h-14 rounded-2xl gradient-primary text-white font-semibold text-sm shadow-glow-green transition-premium"
              whileTap={{ scale: 0.96 }}
            >
              <span className="absolute inset-0 rounded-2xl border-2 border-ride-green/50 animate-pulse" />
              <span className="relative z-10">Accept Ride</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DriverHome() {
  const { driverStatus, setIncomingRide, setDriverLocation } = useAppStore();
  // Bug fix: use a ref for "has simulated" so we can reset it after decline/expiry
  const simulatedRef = useRef(false);

  // Live GPS tracking for driver
  useLocationTracking({
    onUpdate: (loc) => setDriverLocation(loc),
    onError: () => {},
    watch: true,
  });

  useEffect(() => {
    if (driverStatus !== 'online' || simulatedRef.current) return;
    const timer = setTimeout(() => {
      simulatedRef.current = true;
      setIncomingRide(MOCK_INCOMING_RIDE);
      toast('New ride request nearby!', { icon: '🔔' });
    }, 5000);
    return () => clearTimeout(timer);
  }, [driverStatus, setIncomingRide]);

  // Called when a ride is declined or expires — allow re-triggering after 8s
  const handleRideDeclined = useCallback(() => {
    setTimeout(() => {
      simulatedRef.current = false;
    }, 8000);
  }, []);

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="relative z-10 px-4 pt-6 pb-24 flex flex-col gap-5">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl font-bold">LocalRide</h1>
            <p className="text-xs text-muted-foreground">Driver Dashboard</p>
          </div>
          <motion.div
            className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center"
            whileTap={{ scale: 0.92 }}
          >
            <Navigation className="h-4 w-4 text-white" />
          </motion.div>
        </motion.div>

        {/* Status Toggle */}
        <StatusToggle />

        {/* Map */}
        <MapArea />

        {/* Today's Summary */}
        <TodaySummaryCard />

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Incoming Ride Overlay */}
      <AnimatePresence>
        <IncomingRideOverlay onDeclined={handleRideDeclined} />
      </AnimatePresence>

      {/* Bottom Nav */}
      <DriverBottomNav />
    </div>
  );
}