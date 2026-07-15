"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, Mail, Wallet, Route, Calendar, Eye, XCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FilterTab = "all" | "active" | "suspended";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRides: number;
  walletBalance: number;
  joinDate: string;
  status: "active" | "suspended";
  lastRide: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "C001", name: "Anita Sharma", phone: "+91 98765 00001", email: "anita.s@email.com", totalRides: 156, walletBalance: 1240, joinDate: "Jan 2024", status: "active", lastRide: "Today" },
  { id: "C002", name: "Rahul Verma", phone: "+91 98765 00002", email: "rahul.v@email.com", totalRides: 89, walletBalance: 320, joinDate: "Mar 2024", status: "active", lastRide: "Yesterday" },
  { id: "C003", name: "Sneha Patel", phone: "+91 98765 00003", email: "sneha.p@email.com", totalRides: 234, walletBalance: 890, joinDate: "Nov 2023", status: "active", lastRide: "2 days ago" },
  { id: "C004", name: "Kiran Rao", phone: "+91 98765 00004", email: "kiran.r@email.com", totalRides: 45, walletBalance: 0, joinDate: "Jun 2025", status: "active", lastRide: "5 days ago" },
  { id: "C005", name: "Meera Joshi", phone: "+91 98765 00005", email: "meera.j@email.com", totalRides: 312, walletBalance: 2450, joinDate: "Aug 2023", status: "active", lastRide: "Today" },
  { id: "C006", name: "Arun Kumar", phone: "+91 98765 00006", email: "arun.k@email.com", totalRides: 12, walletBalance: 50, joinDate: "Jun 2025", status: "suspended", lastRide: "2 weeks ago" },
  { id: "C007", name: "Divya Nair", phone: "+91 98765 00007", email: "divya.n@email.com", totalRides: 178, walletBalance: 670, joinDate: "Feb 2024", status: "active", lastRide: "3 days ago" },
  { id: "C008", name: "Rohit Singh", phone: "+91 98765 00008", email: "rohit.s@email.com", totalRides: 67, walletBalance: 120, joinDate: "Apr 2024", status: "active", lastRide: "1 week ago" },
  { id: "C009", name: "Priya Gupta", phone: "+91 98765 00009", email: "priya.g@email.com", totalRides: 8, walletBalance: 0, joinDate: "Jul 2025", status: "suspended", lastRide: "3 weeks ago" },
  { id: "C010", name: "Vikas Reddy", phone: "+91 98765 00010", email: "vikas.r@email.com", totalRides: 201, walletBalance: 1580, joinDate: "Dec 2023", status: "active", lastRide: "Today" },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
];

export default function ManageCustomers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSuspend = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (customer?.status === "suspended") {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: "active" as const } : c)));
      toast.success(`${customer.name} has been reactivated`);
    } else {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: "suspended" as const } : c)));
      toast.warning(`${customer?.name} has been suspended`);
    }
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl md:text-2xl font-bold">Manage Customers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{customers.length} total customers</p>
      </motion.div>

      {/* Search */}
      <motion.div className="relative" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
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
          const count = tab.key === "all" ? customers.length : customers.filter((c) => c.status === tab.key).length;
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
                  layoutId="customer-filter-active"
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

      {/* Customer List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((customer, idx) => {
            const initials = customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
            const isActive = customer.status === "active";
            return (
              <motion.div
                key={customer.id}
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
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-sm ${isActive ? "gradient-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold truncate">{customer.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-red-600 dark:text-red-400 bg-red-500/10"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 sm:gap-5 sm:min-w-[220px] sm:justify-end">
                    <div className="flex flex-col items-center sm:items-end">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Route className="h-3 w-3" />
                        Rides
                      </div>
                      <span className="text-sm font-semibold">{customer.totalRides}</span>
                    </div>
                    <div className="flex flex-col items-center sm:items-end">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        Wallet
                      </div>
                      <span className="text-sm font-semibold">₹{customer.walletBalance.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex flex-col items-center sm:items-end">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined
                      </div>
                      <span className="text-sm font-medium">{customer.joinDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:ml-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-xs rounded-lg"
                        onClick={() => toast.info(`Viewing ${customer.name}'s profile`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 px-3 text-xs rounded-lg ${isActive ? "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10" : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"}`}
                        onClick={() => handleSuspend(customer.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{isActive ? "Suspend" : "Reactivate"}</span>
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
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}