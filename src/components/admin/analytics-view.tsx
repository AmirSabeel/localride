"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Star, IndianRupee, BarChart3, PieChart, Clock } from "lucide-react";
import { useAppStore } from "@/store/app-store";

interface AdminStats {
  totalRevenue: number;
  topAreas: { name: string; rides: number; revenue: number }[];
  revenueChart: { month: string; revenue: number }[];
}

const RIDES_BY_AREA = [
  { name: "Payyoli Town", rides: 8450, pct: 100 },
  { name: "Vadakara", rides: 5200, pct: 87 },
  { name: "Iringal", rides: 3180, pct: 79 },
  { name: "Thikkodi", rides: 2890, pct: 70 },
  { name: "Muttil", rides: 2150, pct: 61 },
  { name: "Keezhariyur", rides: 1890, pct: 53 },
  { name: "Orkkatteri", rides: 1560, pct: 44 },
  { name: "Chorode", rides: 1320, pct: 35 },
];

const PEAK_HOURS = [
  { hour: "8AM", rides: 320 },
  { hour: "9AM", rides: 580 },
  { hour: "10AM", rides: 450 },
  { hour: "11AM", rides: 380 },
  { hour: "12PM", rides: 520 },
  { hour: "1PM", rides: 410 },
  { hour: "2PM", rides: 350 },
  { hour: "3PM", rides: 390 },
  { hour: "4PM", rides: 440 },
  { hour: "5PM", rides: 620 },
  { hour: "6PM", rides: 780 },
  { hour: "7PM", rides: 850 },
  { hour: "8PM", rides: 720 },
  { hour: "9PM", rides: 560 },
  { hour: "10PM", rides: 420 },
  { hour: "11PM", rides: 280 },
];

const VEHICLE_DIST = [
  { type: "Hatchback", pct: 35, color: "#00C853" },
  { type: "Sedan", pct: 30, color: "#10B981" },
  { type: "SUV", pct: 20, color: "#14B8A6" },
  { type: "Auto", pct: 10, color: "#F59E0B" },
  { type: "Bike", pct: 5, color: "#6EE7B7" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function getIntensityColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio > 0.85) return "bg-emerald-600 dark:bg-emerald-500";
  if (ratio > 0.65) return "bg-emerald-500 dark:bg-emerald-400";
  if (ratio > 0.45) return "bg-emerald-400 dark:bg-emerald-300";
  if (ratio > 0.25) return "bg-emerald-300 dark:bg-emerald-200";
  return "bg-emerald-200 dark:bg-emerald-100/50";
}

export default function AnalyticsView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rides?type=admin-stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-28 rounded-2xl skeleton-shimmer" />
        <div className="h-72 rounded-2xl skeleton-shimmer" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl skeleton-shimmer" />
          <div className="h-64 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    );
  }

  const maxPeak = Math.max(...PEAK_HOURS.map((h) => h.rides));

  // Build conic-gradient for pie chart
  const conicStops = VEHICLE_DIST.reduce<{ stops: string[]; cum: number }>(
    (acc, v) => {
      const start = acc.cum;
      acc.cum += v.pct;
      acc.stops.push(`${v.color} ${start}% ${acc.cum}%`);
      return acc;
    },
    { stops: [], cum: 0 }
  ).stops.join(", ");

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl md:text-2xl font-bold">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Platform performance insights</p>
      </motion.div>

      {/* Revenue Overview */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base md:text-lg font-bold">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total platform revenue</p>
          </div>
          <span className="text-2xl md:text-3xl font-bold gradient-text">
            ₹{stats ? (stats.totalRevenue / 10000000).toFixed(2) : "0"}Cr
          </span>
        </div>
        {/* CSS Trend Line */}
        <div className="relative h-16 w-full">
          <svg
            viewBox="0 0 400 60"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C853" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="trend-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#69F0AE" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,50 L57,40 L114,32 L171,35 L228,28 L285,22 L342,15 L400,8"
              fill="none"
              stroke="url(#trend-stroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
            />
            <motion.path
              d="M0,50 L57,40 L114,32 L171,35 L228,28 L285,22 L342,15 L400,8 L400,60 L0,60 Z"
              fill="url(#trend-fill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
          </svg>
        </div>
        <div className="flex justify-between mt-2">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => (
            <span key={m} className="text-[10px] text-muted-foreground">{m}</span>
          ))}
        </div>
      </motion.div>

      {/* Growth KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Week-over-Week Growth", value: "+12.5%", icon: TrendingUp, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { label: "Customer Retention", value: "78%", icon: Users, tint: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
          { label: "Driver Satisfaction", value: "4.7/5", icon: Star, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              className="glass rounded-2xl shadow-premium p-4 md:p-5"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tint}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <span className="text-xs text-muted-foreground leading-tight">{kpi.label}</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Rides by Area + Vehicle Distribution */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Horizontal Bar Chart */}
        <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-base md:text-lg font-bold">Rides by Area</h3>
          </div>
          <div className="space-y-3">
            {RIDES_BY_AREA.map((area, idx) => (
              <div key={area.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{area.name}</span>
                  <span className="text-[11px] text-muted-foreground">{area.rides.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${area.pct}%` }}
                    transition={{ delay: 0.2 + idx * 0.07, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="h-4 w-4 text-primary" />
            <h3 className="text-base md:text-lg font-bold">Vehicle Type Distribution</h3>
          </div>
          <div className="flex flex-col items-center gap-5">
            <motion.div
              className="relative h-40 w-40 md:h-48 md:w-48 rounded-full"
              style={{ background: `conic-gradient(${conicStops})` }}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="absolute inset-4 md:inset-6 rounded-full bg-background flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg md:text-xl font-bold">5</p>
                  <p className="text-[10px] text-muted-foreground">Types</p>
                </div>
              </div>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {VEHICLE_DIST.map((v, idx) => (
                <motion.div
                  key={v.type}
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-xs font-medium">{v.type}</span>
                  <span className="text-[11px] text-muted-foreground">{v.pct}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Peak Hours Heatmap */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-base md:text-lg font-bold">Peak Hours</h3>
          <span className="text-xs text-muted-foreground ml-auto">Hourly ride distribution</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 md:gap-2">
          {PEAK_HOURS.map((h, idx) => (
            <motion.div
              key={h.hour}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.04, duration: 0.3 }}
            >
              <motion.div
                className={`w-full aspect-square rounded-xl ${getIntensityColor(h.rides, maxPeak)} flex items-center justify-center`}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-[11px] md:text-xs font-bold text-white">{h.rides}</span>
              </motion.div>
              <span className="text-[10px] text-muted-foreground font-medium">{h.hour}</span>
            </motion.div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-[10px] text-muted-foreground">Low</span>
          <div className="flex gap-0.5">
            {["bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600"].map((c, i) => (
              <div key={i} className={`h-2.5 w-6 rounded ${c} dark:bg-emerald-${200 + i * 100} ${i > 0 && i < 4 ? "dark:bg-emerald-" + (300 + (i-1) * 100) : ""}`} style={{ backgroundColor: `rgba(16,185,129,${0.2 + i * 0.2})` }} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">High</span>
        </div>
      </motion.div>
    </motion.div>
  );
}