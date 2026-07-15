"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Wallet, User, Star, Car, Route, SlidersHorizontal,
} from "lucide-react";
import { useAppStore, type CompletedRide } from "@/store/app-store";
import BottomNav from "@/components/customer/bottom-nav";

type FilterTab = "all" | "completed" | "cancelled";

interface RideItem {
  id: string;
  from: string;
  to: string;
  fare: number;
  distance: number;
  duration: number;
  date: string;
  status: string;
  rating: number;
  tip?: number;
  driverName?: string;
}

export default function RideHistory() {
  const { setCustomerView, rideHistory: storedRides } = useAppStore();
  const [apiRides, setApiRides] = useState<RideItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rides?type=ride-history")
      .then((r) => r.json())
      .then((data) => { setApiRides(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Merge: stored (real) rides first, then API seed — deduplicate by id
  const allRides: RideItem[] = [
    ...storedRides.map((r: CompletedRide): RideItem => ({
      id: r.id,
      from: r.from,
      to: r.to,
      fare: r.fare,
      distance: r.distance,
      duration: r.duration,
      date: r.date,
      status: r.status,
      rating: r.rating,
      tip: r.tip,
      driverName: r.driverName,
    })),
    ...apiRides.filter((ar) => !storedRides.some((sr: CompletedRide) => sr.id === ar.id)),
  ];

  const filteredRides = allRides.filter((r) => {
    if (activeFilter === "all") return true;
    return r.status === activeFilter;
  });

  const filters: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="relative min-h-dvh w-full bg-background">
      {/* Top Bar */}
      <motion.div
        className="safe-top glass fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-lg font-bold text-foreground">Ride History</h1>
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/5"
          whileTap={{ scale: 0.9 }}
          onClick={() => {}}
        >
          <SlidersHorizontal className="h-4.5 w-4.5 text-muted-foreground" />
        </motion.button>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        className="fixed top-[56px] left-0 right-0 z-30 glass-subtle px-4 py-2.5"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mx-auto flex max-w-md gap-2">
          {filters.map((f) => (
            <motion.button
              key={f.key}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-premium ${
                activeFilter === f.key
                  ? "bg-ride-green text-white shadow-glow-green"
                  : "bg-foreground/[0.03] text-muted-foreground"
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 pt-28 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
            ))}
          </div>
        ) : filteredRides.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/[0.03]">
              <Car className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No rides found</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Your ride history will appear here</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {filteredRides.map((ride, i) => (
                <motion.div
                  key={ride.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                  className="glass shadow-premium rounded-2xl p-4 cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Header */}
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{ride.date}</span>
                      {ride.driverName && (
                        <span className="text-[10px] text-muted-foreground">· {ride.driverName}</span>
                      )}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                      ride.status === "completed" ? "status-completed" : "status-cancelled"
                    }`}>
                      {ride.status}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="mb-3 flex items-start gap-2.5">
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <div className="h-2 w-2 rounded-full bg-ride-green" />
                      <div className="h-5 w-[1.5px] bg-foreground/10" />
                      <div className="h-2 w-2 rounded-full bg-ride-red" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium truncate">{ride.from}</p>
                      <p className="text-sm text-muted-foreground truncate">{ride.to}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-foreground/5 pt-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Route className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{ride.distance} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{ride.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ride.status === "completed" && ride.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: ride.rating }).map((_, si) => (
                            <Star key={si} className="h-3 w-3 fill-ride-amber text-ride-amber" />
                          ))}
                        </div>
                      )}
                      <div className="text-right">
                        <span className="text-sm font-bold text-ride-green">₹{ride.fare}</span>
                        {ride.tip != null && ride.tip > 0 && (
                          <p className="text-[10px] text-muted-foreground">+₹{ride.tip} tip</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}