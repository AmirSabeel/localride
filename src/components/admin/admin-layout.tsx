"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  BarChart3,
  Tag,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { useAppStore, type AdminView } from "@/store/app-store";
import { toast } from "sonner";

const NAV_ITEMS: { view: AdminView; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "drivers", label: "Drivers", icon: Car },
  { view: "customers", label: "Customers", icon: Users },
  { view: "rides", label: "Rides", icon: Route },
  { view: "analytics", label: "Analytics", icon: BarChart3 },
  { view: "promos", label: "Promos", icon: Tag },
  { view: "settings", label: "Settings", icon: Settings },
];

const MOBILE_TABS: { view: AdminView; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "drivers", label: "Drivers", icon: Car },
  { view: "analytics", label: "Analytics", icon: BarChart3 },
  { view: "settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminView, setAdminView, logout, userName } = useAppStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      {/* Desktop Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 z-30 hidden h-full w-60 flex-col glass-strong shadow-float border-r border-border/50 md:flex"
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border/30">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-green"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Car className="h-5 w-5 text-white" strokeWidth={2} />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text">LocalRide</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = adminView === item.view;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.view}
                  onClick={() => setAdminView(item.view)}
                  className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-premium ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative z-10 h-[18px] w-[18px] ${isActive ? "text-ride-green" : ""}`} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/30 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {userName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userName || "Admin"}</p>
              <p className="text-[11px] text-muted-foreground truncate">Super Admin</p>
            </div>
            <motion.button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-premium"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="relative z-10 md:ml-60 min-h-dvh flex flex-col">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 glass-strong border-b border-border/30 md:hidden safe-top">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Car className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-base font-bold gradient-text">LocalRide Admin</h1>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              className="relative rounded-xl p-2 text-muted-foreground hover:bg-accent/50 transition-premium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info("3 new notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-ride-red notification-dot" />
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-premium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-20 items-center justify-between px-6 py-3.5 glass-strong border-b border-border/30">
          <div>
            <h2 className="text-lg font-bold text-foreground capitalize">
              {NAV_ITEMS.find((i) => i.view === adminView)?.label || "Dashboard"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your ride-hailing platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              className="relative rounded-xl p-2 text-muted-foreground hover:bg-accent/50 transition-premium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info("3 new notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-ride-red notification-dot" />
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-premium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={adminView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-border/30 safe-bottom md:hidden">
          <div className="flex items-center justify-around px-2 py-1.5">
            {MOBILE_TABS.map((tab) => {
              const isActive = adminView === tab.view;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.view}
                  onClick={() => setAdminView(tab.view)}
                  className="relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-premium"
                  whileTap={{ scale: 0.92 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-tab-active"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative h-5 w-5 transition-premium ${
                      isActive ? "text-ride-green" : "text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className={`relative text-[10px] font-medium transition-premium ${
                      isActive ? "text-ride-green" : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
            <div className="w-px h-8 bg-border/50 mx-1 self-center" />
            <motion.button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-muted-foreground hover:text-destructive transition-premium"
              whileTap={{ scale: 0.92 }}
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Logout</span>
            </motion.button>
          </div>
        </nav>
      </div>
    </div>
  );
}