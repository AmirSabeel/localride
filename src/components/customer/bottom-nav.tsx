"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Wallet, User } from "lucide-react";
import { useAppStore, type CustomerView } from "@/store/app-store";

const NAV_ITEMS = [
  { icon: MapPin,  label: "Home",     view: "home"    as CustomerView },
  { icon: Clock,   label: "Activity", view: "history" as CustomerView },
  { icon: Wallet,  label: "Wallet",   view: "wallet"  as CustomerView },
  { icon: User,    label: "Profile",  view: "profile" as CustomerView },
] as const;

export default function BottomNav() {
  const { customerView, setCustomerView, unreadCount } = useAppStore();

  return (
    <nav className="glass-strong safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-foreground/5">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {NAV_ITEMS.map(({ icon: Icon, label, view }) => {
          const isActive = customerView === view;
          const badge = view === "profile" ? unreadCount : 0;
          return (
            <motion.button
              key={view}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
              whileTap={{ scale: 0.9 }}
              onClick={() => setCustomerView(view)}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-premium ${isActive ? "text-ride-green" : "text-muted-foreground"}`} />
                {badge > 0 && (
                  <span className="notification-dot absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ride-green px-1 text-[9px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-premium ${isActive ? "text-ride-green" : "text-muted-foreground"}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1.5 h-0.5 w-5 rounded-full bg-ride-green"
                  layoutId="customer-nav-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
