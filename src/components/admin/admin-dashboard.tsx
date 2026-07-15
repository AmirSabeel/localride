"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Route, IndianRupee, Car, Star, TrendingUp, UserPlus, CheckCircle2, CreditCard, AlertTriangle, Clock, Activity } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

interface AdminStats {
  totalRides: number;
  totalRevenue: number;
  activeDrivers: number;
  avgRating: number;
  weeklyGrowth: number;
  topAreas: { name: string; rides: number; revenue: number }[];
  revenueChart: { month: string; revenue: number }[];
}

const STATS = [
  { key: "totalRides" as const, label: "Total Rides", icon: Route, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500/5 to-emerald-500/0", format: (v: number) => v.toLocaleString("en-IN"), growth: 12.5 },
  { key: "totalRevenue" as const, label: "Total Revenue", icon: IndianRupee, tint: "bg-teal-500/10 text-teal-600 dark:text-teal-400", gradient: "from-teal-500/5 to-teal-500/0", format: (v: number) => `₹${(v / 10000000).toFixed(2)}Cr`, growth: 12.5 },
  { key: "activeDrivers" as const, label: "Active Drivers", icon: Car, tint: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500/5 to-cyan-500/0", format: (v: number) => v.toLocaleString("en-IN"), growth: 12.5 },
  { key: "avgRating" as const, label: "Avg Rating", icon: Star, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400", gradient: "from-amber-500/5 to-amber-500/0", format: (v: number) => `${v}★`, growth: 12.5 },
];

const RECENT_ACTIVITY = [
  { icon: UserPlus, text: "New driver registered — Vikram T.", time: "2 min ago", color: "text-emerald-500" },
  { icon: CheckCircle2, text: "Ride #R89234 completed successfully", time: "5 min ago", color: "text-teal-500" },
  { icon: CreditCard, text: "Payment ₹456 processed for ride #R89231", time: "12 min ago", color: "text-cyan-500" },
  { icon: AlertTriangle, text: "Surge pricing activated in Vadakara", time: "25 min ago", color: "text-amber-500" },
  { icon: Activity, text: "System health check — All services running", time: "1 hour ago", color: "text-emerald-500" },
];

function AnimatedCounter({ target, format, duration = 1200 }: { target: number; format: (v: number) => string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <>{format(Math.round(display))}</>;
}

import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AdminDashboard() {
  const { setAdminView } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rides?type=admin-stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load stats");
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-2xl skeleton-shimmer" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-72 rounded-2xl skeleton-shimmer" />
          <div className="h-72 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.revenueChart.map((d) => d.revenue));
  const maxAreaRides = Math.max(...stats.topAreas.map((a) => a.rides));

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const value = stats[stat.key];
          return (
            <motion.div
              key={stat.key}
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl glass shadow-premium p-4 md:p-5"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tint}`}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +{stat.growth}%
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  <AnimatedCounter target={value} format={stat.format} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base md:text-lg font-bold">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue trend</p>
          </div>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{(stats.revenueChart[stats.revenueChart.length - 1].revenue / 10000000).toFixed(1)}Cr</span>
        </div>
        <div className="flex items-end justify-between gap-2 md:gap-4 h-44 md:h-52">
          {stats.revenueChart.map((item, idx) => {
            const height = (item.revenue / maxRevenue) * 100;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <motion.span
                  className="text-[10px] md:text-xs font-semibold text-muted-foreground"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                >
                  {`₹${(item.revenue / 10000000).toFixed(1)}Cr`}
                </motion.span>
                <div className="w-full flex justify-center" style={{ height: "80%" }}>
                  <motion.div
                    className="w-full max-w-[48px] rounded-t-xl gradient-primary relative overflow-hidden"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.2 + idx * 0.08, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
                <span className="text-[11px] md:text-xs font-medium text-muted-foreground">{item.month}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Top Areas */}
        <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base md:text-lg font-bold">Top Areas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">By ride count</p>
            </div>
            <motion.button
              onClick={() => setAdminView("analytics")}
              className="text-xs font-semibold text-primary hover:underline"
              whileHover={{ x: 2 }}
            >
              View All
            </motion.button>
          </div>
          <div className="space-y-3.5">
            {stats.topAreas.map((area, idx) => (
              <motion.div
                key={area.name}
                className="space-y-1.5"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08, duration: 0.35 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium">{area.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{area.rides.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">rides</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(area.rides / maxAreaRides) * 100}%` }}
                      transition={{ delay: 0.5 + idx * 0.08, duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    ₹{(area.revenue / 100000).toFixed(1)}L
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base md:text-lg font-bold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest platform events</p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            {RECENT_ACTIVITY.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-accent/30 transition-premium cursor-default"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.07, duration: 0.35 }}
                  whileHover={{ x: 4 }}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 ${activity.color}`}>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{activity.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}