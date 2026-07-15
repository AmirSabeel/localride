'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import {
  LayoutDashboard, TrendingUp, History, User,
} from 'lucide-react';

/**
 * Shared bottom navigation bar for all driver views.
 * Import this instead of duplicating the component in every driver file.
 */
export default function DriverBottomNav() {
  const { driverView, setDriverView } = useAppStore();
  const tabs = [
    { icon: LayoutDashboard, label: 'Home', view: 'home' as const },
    { icon: TrendingUp, label: 'Earnings', view: 'earnings' as const },
    { icon: History, label: 'History', view: 'history' as const },
    { icon: User, label: 'Profile', view: 'profile' as const },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md glass-strong border-t border-border/50 safe-bottom"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = driverView === tab.view;
          return (
            <motion.button
              key={tab.label}
              onClick={() => setDriverView(tab.view)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-premium ${
                isActive ? 'text-ride-green' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {isActive && (
                <motion.div
                  className="absolute -top-1 h-0.5 w-6 rounded-full gradient-primary"
                  layoutId="driver-bottom-nav-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
