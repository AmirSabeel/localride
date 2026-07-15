'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import type { CompletedRide } from '@/store/app-store';
import {
  LayoutDashboard, TrendingUp, History, User,
  MapPin, IndianRupee, Route, Star, Clock, Filter,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DriverBottomNav from '@/components/driver/driver-bottom-nav';

type FilterTab = 'all' | 'completed' | 'cancelled';

interface DriverRide {
  id: string;
  customer: string;
  from: string;
  to: string;
  fare: number;
  distance: number;
  duration: number;
  date: string;
  status: string;
  earning: number;
  rating: number;
}

function RideCard({ ride, index }: { ride: DriverRide; index: number }) {
  const isCompleted = ride.status === 'completed';

  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
            {ride.customer[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{ride.customer}</p>
            <p className="text-[11px] text-muted-foreground">{ride.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ride-green/10 px-2.5 py-1 text-[10px] font-semibold text-ride-green">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-ride-red/10 px-2.5 py-1 text-[10px] font-semibold text-ride-red">
              <XCircle className="h-3 w-3" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2">
          <div className="mt-1.5 h-2 w-2 rounded-full bg-ride-green flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{ride.from}</p>
        </div>
        <div className="ml-[3px] border-l border-dashed border-muted-foreground/30 h-2" />
        <div className="flex items-start gap-2">
          <div className="mt-1.5 h-2 w-2 rounded-sm bg-ride-red flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{ride.to}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Route className="h-3 w-3" />
            {ride.distance} km
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {ride.duration} min
          </div>
          {isCompleted && ride.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-ride-amber">
              <Star className="h-3 w-3 fill-ride-amber" />
              {ride.rating}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && (
            <div className="flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3 text-ride-green" />
              <span className="text-sm font-bold text-ride-green">{ride.earning}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5">
            <IndianRupee className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{ride.fare}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DriverHistory() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const { rideHistory: storedRides } = useAppStore();

  const { data: apiRides = [], isLoading } = useQuery<DriverRide[]>({
    queryKey: ['driver-history'],
    queryFn: async () => {
      const res = await fetch('/api/rides?type=driver-history');
      return res.json();
    },
  });

  // Convert stored customer rides into driver ride format and merge
  const storedAsDriverRides: DriverRide[] = storedRides.map((r: CompletedRide) => ({
    id: r.id,
    customer: "My Ride",
    from: r.from,
    to: r.to,
    fare: r.fare,
    distance: r.distance,
    duration: r.duration,
    date: r.date,
    status: r.status,
    earning: Math.round(r.fare * 0.8),
    rating: r.rating,
  }));

  const allRides: DriverRide[] = [
    ...storedAsDriverRides,
    ...apiRides.filter((ar) => !storedAsDriverRides.some((sr) => sr.id === ar.id)),
  ];

  const rides = filter === 'all' ? allRides : allRides.filter((r) => r.status === filter);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="relative z-10 px-4 pt-6 pb-24 flex flex-col gap-4">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl font-bold">Ride History</h1>
            <p className="text-xs text-muted-foreground">Your trip records</p>
          </div>
          <motion.div
            className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center"
            whileTap={{ scale: 0.92 }}
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="flex rounded-xl bg-muted/50 p-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative flex-1 h-9 rounded-lg text-xs font-semibold transition-premium ${
                filter === tab.key ? 'text-white' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {filter === tab.key && (
                <motion.div
                  className="absolute inset-0 rounded-lg gradient-primary"
                  layoutId="history-filter-active"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Rides List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-strong rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full skeleton-shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-24 rounded skeleton-shimmer" />
                    <div className="h-2.5 w-32 rounded skeleton-shimmer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full rounded skeleton-shimmer" />
                  <div className="h-2.5 w-3/4 rounded skeleton-shimmer" />
                </div>
              </div>
            ))
          ) : rides.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No rides found</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {rides.map((ride, i) => (
                <RideCard key={ride.id} ride={ride} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
}