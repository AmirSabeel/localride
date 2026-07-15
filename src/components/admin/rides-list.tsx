"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Route, Calendar, ArrowRight, Eye, IndianRupee, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type RideStatus = "in_progress" | "completed" | "cancelled";
type FilterTab = "all" | "in_progress" | "completed" | "cancelled";

interface Ride {
  id: string;
  customerName: string;
  driverName: string;
  from: string;
  to: string;
  fare: number;
  status: RideStatus;
  date: string;
  vehicleType: string;
  distance: number;
}

const MOCK_RIDES: Ride[] = [
  { id: "R89234", customerName: "Anita Krishnan", driverName: "Rahul K.", from: "Payyoli Town", to: "Vadakara Bus Stand", fare: 85, status: "in_progress", date: "Today, 2:30 PM", vehicleType: "Sedan", distance: 9.8 },
  { id: "R89233", customerName: "Mohammed Fasil", driverName: "Priya M.", from: "Iringal Junction", to: "Thikkodi Market", fare: 45, status: "completed", date: "Today, 1:15 PM", vehicleType: "Hatchback", distance: 4.5 },
  { id: "R89232", customerName: "Sneha Nair", driverName: "Arun S.", from: "Muttil Junction", to: "Payyoli Beach", fare: 55, status: "completed", date: "Today, 11:00 AM", vehicleType: "SUV", distance: 5.8 },
  { id: "R89231", customerName: "Kiran Menon", driverName: "Deepa R.", from: "Keezhariyur", to: "Vadakara", fare: 65, status: "cancelled", date: "Today, 9:45 AM", vehicleType: "Sedan", distance: 7.2 },
  { id: "R89230", customerName: "Meera Das", driverName: "Vikram T.", from: "Orkkatteri", to: "Payyoli Town", fare: 42, status: "completed", date: "Yesterday, 6:15 PM", vehicleType: "Auto", distance: 4.2 },
  { id: "R89229", customerName: "Divya Nair", driverName: "Sujith R.", from: "Nanminda", to: "Chorode Bridge", fare: 35, status: "completed", date: "Yesterday, 4:30 PM", vehicleType: "Sedan", distance: 3.4 },
  { id: "R89228", customerName: "Rohith Kumar", driverName: "Rahul K.", from: "Payyoli Hospital", to: "Payyoli Railway Stn", fare: 28, status: "cancelled", date: "Yesterday, 2:00 PM", vehicleType: "Hatchback", distance: 2.1 },
  { id: "R89227", customerName: "Vishnu Reddy", driverName: "Anjali D.", from: "Thikkodi", to: "Iringal Junction", fare: 48, status: "completed", date: "Yesterday, 10:30 AM", vehicleType: "Sedan", distance: 5.2 },
  { id: "R89226", customerName: "Aswathy Mohan", driverName: "Priya M.", from: "Vadakara New Stand", to: "Payyoli Beach", fare: 78, status: "completed", date: "Jul 11, 7:00 PM", vehicleType: "Sedan", distance: 8.5 },
  { id: "R89225", customerName: "Arun Kumar", driverName: "Suresh B.", from: "Payyoli KSRTC Stand", to: "Muttil Junction", fare: 38, status: "in_progress", date: "Jul 11, 5:45 PM", vehicleType: "SUV", distance: 4.8 },
];

const STATUS_CONFIG: Record<RideStatus, { label: string; color: string; bg: string; dot: string }> = {
  in_progress: { label: "In Progress", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-500" },
  completed: { label: "Completed", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", dot: "bg-red-500" },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function RidesList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = MOCK_RIDES.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      r.from.toLowerCase().includes(search.toLowerCase()) ||
      r.to.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold">All Rides</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{MOCK_RIDES.length} total rides</p>
        </div>
      </motion.div>

      {/* Search + Date */}
      <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11 bg-transparent border-border/50 glass"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            className="pl-10 rounded-xl h-11 bg-transparent border-border/50 glass"
          />
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {FILTER_TABS.map((tab) => {
          const count = tab.key === "all" ? MOCK_RIDES.length : MOCK_RIDES.filter((r) => r.status === tab.key).length;
          return (
            <motion.button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-premium ${
                filter === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {filter === tab.key && (
                <motion.div
                  layoutId="ride-filter-active"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
              <span className={`relative text-[11px] px-1.5 py-0.5 rounded-md ${filter === tab.key ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Rides List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((ride, idx) => {
            const statusCfg = STATUS_CONFIG[ride.status];
            return (
              <motion.div
                key={ride.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="glass rounded-2xl shadow-premium p-4 hover:shadow-float transition-premium"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-muted-foreground">{ride.id}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCfg.color} ${statusCfg.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot} ${ride.status === "in_progress" ? "animate-pulse" : ""}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{ride.date}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toast.info(`Viewing ride ${ride.id}`)}
                      className="rounded-lg p-1.5 hover:bg-accent/50 transition-premium text-muted-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex flex-col items-center gap-0.5 pt-0.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="w-px h-6 bg-border" />
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-medium truncate">{ride.from}</p>
                    <p className="text-sm font-medium truncate">{ride.to}</p>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 text-[10px] font-bold">
                        {ride.customerName.charAt(0)}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[80px] sm:max-w-none">{ride.customerName}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-white text-[10px] font-bold">
                        {ride.driverName.charAt(0)}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[80px] sm:max-w-none">{ride.driverName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">{ride.distance} km</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {ride.fare}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-muted-foreground"
          >
            <Route className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No rides found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}