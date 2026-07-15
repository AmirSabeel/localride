"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Car, Phone, Star, Eye, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DriverStatus = "active" | "pending" | "suspended";
type FilterTab = "all" | "pending" | "active" | "suspended";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleColor: string;
  status: DriverStatus;
  rating: number;
  totalRides: number;
  joinedDate: string;
}

const MOCK_DRIVERS: Driver[] = [
  { id: "D001", name: "Rahul Krishnan", phone: "+91 94470 12345", vehicleType: "Sedan", vehiclePlate: "KL-14-A-1234", vehicleColor: "White", status: "active", rating: 4.8, totalRides: 1420, joinedDate: "Jan 2024" },
  { id: "D002", name: "Priya Murali", phone: "+91 94460 54321", vehicleType: "Hatchback", vehiclePlate: "KL-14-B-5678", vehicleColor: "Silver", status: "active", rating: 4.9, totalRides: 1190, joinedDate: "Mar 2024" },
  { id: "D003", name: "Arun Sharma", phone: "+91 94560 21098", vehicleType: "SUV", vehiclePlate: "KL-14-C-9012", vehicleColor: "Black", status: "pending", rating: 0, totalRides: 0, joinedDate: "Jul 2025" },
  { id: "D004", name: "Deepa Nair", phone: "+91 99470 10987", vehicleType: "Sedan", vehiclePlate: "KL-14-D-3456", vehicleColor: "Blue", status: "active", rating: 4.6, totalRides: 867, joinedDate: "Jun 2024" },
  { id: "D005", name: "Vikram Thakur", phone: "+91 94000 09876", vehicleType: "Luxury", vehiclePlate: "KL-14-E-7890", vehicleColor: "Black", status: "suspended", rating: 3.2, totalRides: 390, joinedDate: "Feb 2024" },
  { id: "D006", name: "Sujith Raja", phone: "+91 97460 98765", vehicleType: "Auto", vehiclePlate: "KL-14-F-2345", vehicleColor: "Green", status: "active", rating: 4.5, totalRides: 2670, joinedDate: "Nov 2023" },
  { id: "D007", name: "Suresh Babu", phone: "+91 94430 87654", vehicleType: "Sedan", vehiclePlate: "KL-14-G-6789", vehicleColor: "Red", status: "pending", rating: 0, totalRides: 0, joinedDate: "Jul 2025" },
  { id: "D008", name: "Meena Krishnan", phone: "+91 99440 76543", vehicleType: "Hatchback", vehiclePlate: "KL-14-H-0123", vehicleColor: "Grey", status: "active", rating: 4.7, totalRides: 1034, joinedDate: "Apr 2024" },
  { id: "D009", name: "Karthik Rao", phone: "+91 94870 65432", vehicleType: "SUV", vehiclePlate: "KL-14-J-4567", vehicleColor: "White", status: "pending", rating: 0, totalRides: 0, joinedDate: "Jul 2025" },
  { id: "D010", name: "Anjali Das", phone: "+91 99880 76655", vehicleType: "Sedan", vehiclePlate: "KL-14-K-8901", vehicleColor: "Silver", status: "active", rating: 4.8, totalRides: 1802, joinedDate: "Sep 2023" },
];

const STATUS_CONFIG: Record<DriverStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  pending: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  suspended: { label: "Suspended", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending Approval" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
];

export default function ManageDrivers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);

  const filtered = drivers.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search);
    const matchFilter = filter === "all" || d.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAction = (id: string, action: "approve" | "suspend") => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          if (action === "approve") {
            toast.success(`${d.name} has been approved`);
            return { ...d, status: "active" as DriverStatus, rating: 4.5 };
          } else {
            toast.warning(`${d.name} has been suspended`);
            return { ...d, status: "suspended" as DriverStatus };
          }
        }
        return d;
      })
    );
  };

  const renderStars = (rating: number) => {
    if (rating === 0) return <span className="text-xs text-muted-foreground">No rating</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className="text-xs font-medium text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

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
          <h2 className="text-xl md:text-2xl font-bold">Manage Drivers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{drivers.length} total drivers</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => toast.info("Add driver form coming soon")}
            className="btn-premium gradient-primary text-white border-0 rounded-xl h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            Add Driver
          </Button>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, plate, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl h-11 bg-transparent border-border/50 glass"
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {FILTER_TABS.map((tab) => {
          const count = tab.key === "all" ? drivers.length : drivers.filter((d) => d.status === tab.key).length;
          return (
            <motion.button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-premium ${
                filter === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {filter === tab.key && (
                <motion.div
                  layoutId="driver-filter-active"
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

      {/* Driver List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((driver, idx) => {
            const statusCfg = STATUS_CONFIG[driver.status];
            const initials = driver.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
            return (
              <motion.div
                key={driver.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="glass rounded-2xl shadow-premium p-4 hover:shadow-float transition-premium"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-primary text-white font-bold text-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold truncate">{driver.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCfg.color} ${statusCfg.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${driver.status === "active" ? "bg-emerald-500" : driver.status === "pending" ? "bg-amber-500" : "bg-red-500"}`} />
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {driver.phone}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{driver.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle + Rating */}
                  <div className="flex flex-col sm:items-end gap-1.5 sm:min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Car className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{driver.vehicleType}</span>
                      <span className="text-xs text-muted-foreground">{driver.vehicleColor}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{driver.vehiclePlate}</p>
                    {renderStars(driver.rating)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:ml-2">
                    {driver.status === "pending" && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handleAction(driver.id, "approve")}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      </motion.div>
                    )}
                    {driver.status === "active" && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs rounded-lg border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleAction(driver.id, "suspend")}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Suspend
                        </Button>
                      </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-xs rounded-lg"
                        onClick={() => toast.info(`Viewing ${driver.name}'s profile`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </motion.div>
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
            <Car className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No drivers found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}