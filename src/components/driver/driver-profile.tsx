'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  Car, FileText, CreditCard, IndianRupee,
  Star, Bell, Moon, Sun, HelpCircle, Info, ChevronRight,
  CheckCircle2, Upload, Pencil, LogOut, Shield, Building,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import DriverBottomNav from '@/components/driver/driver-bottom-nav';

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action && (
        <motion.button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-medium text-ride-green"
          whileTap={{ scale: 0.95 }}
        >
          {action}
          <ChevronRight className="h-3 w-3" />
        </motion.button>
      )}
    </div>
  );
}

function ProfileCard() {
  const { userName, userPhone, todayEarnings, weeklyEarnings, monthlyEarnings, todayTrips, weeklyTrips } = useAppStore();

  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-glow-green"
          whileHover={{ scale: 1.05 }}
        >
          {userName?.[0] || 'D'}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{userName || 'Driver'}</h2>
          <p className="text-sm text-muted-foreground">{userPhone || '+91 XXXXX XXXXX'}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3.5 w-3.5 text-ride-amber fill-ride-amber" />
            <span className="text-xs font-semibold">4.8</span>
            <span className="text-xs text-muted-foreground">rating</span>
          </div>
        </div>
        <motion.button
          className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          onClick={() => toast.info('Edit profile coming soon!')}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Today', earnings: todayEarnings, trips: todayTrips },
          { label: 'This Week', earnings: weeklyEarnings, trips: weeklyTrips },
          { label: 'This Month', earnings: monthlyEarnings, trips: 38 },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="rounded-xl bg-muted/50 p-3 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <p className="text-[10px] text-muted-foreground mb-0.5">{item.label}</p>
            <div className="flex items-center justify-center gap-0.5">
              <IndianRupee className="h-3 w-3 text-ride-green" />
              <span className="text-sm font-bold">{(item.earnings / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{item.trips} trips</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function VehicleInfo() {
  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <SectionHeader title="Vehicle Info" />
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-ride-green/10 flex items-center justify-center">
          <Car className="h-6 w-6 text-ride-green" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Maruti Suzuki Swift</p>
          <p className="text-xs text-muted-foreground">KL-14-A-1234 · White</p>
        </div>
      </div>
    </motion.div>
  );
}

function Documents() {
  const docs = [
    { name: 'Driving License', status: 'verified' },
    { name: 'RC Book', status: 'verified' },
    { name: 'Insurance', status: 'pending' },
  ];

  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <SectionHeader
        title="Documents"
        action="Upload"
        onAction={() => toast.info('Document upload coming soon!')}
      />
      <div className="space-y-2.5">
        {docs.map((doc, i) => (
          <motion.div
            key={doc.name}
            className="flex items-center justify-between py-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.06 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{doc.name}</span>
            </div>
            {doc.status === 'verified' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ride-green/10 px-2 py-0.5 text-[10px] font-semibold text-ride-green">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <motion.button
                className="inline-flex items-center gap-1 rounded-full bg-ride-amber/10 px-2 py-0.5 text-[10px] font-semibold text-ride-amber"
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.info('Upload feature coming soon!')}
              >
                <Upload className="h-3 w-3" />
                Upload
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function BankDetails() {
  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <SectionHeader title="Bank Details" />
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Bank Account</span>
          </div>
          <span className="text-sm text-muted-foreground">****1234</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">UPI</span>
          </div>
          <span className="text-sm text-muted-foreground">rajesh@upi</span>
        </div>
      </div>
    </motion.div>
  );
}

function Settings() {
  const { logout } = useAppStore();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const settingsItems = [
    { icon: Bell, label: 'Notifications', action: () => toast.info('Notification settings coming soon!') },
    { icon: Shield, label: 'Privacy & Security', action: () => toast.info('Privacy settings coming soon!') },
    { icon: HelpCircle, label: 'Help & Support', action: () => toast.info('Help center coming soon!') },
    { icon: Info, label: 'About', action: () => toast.info('LocalRide v1.0.0 — Premium Ride Hailing') },
  ];

  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <SectionHeader title="Settings" />
      <div className="space-y-1">
        {/* Dark Mode toggle — real implementation */}
        <motion.button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex items-center justify-between w-full py-2.5 px-1 rounded-xl hover:bg-muted/50 transition-premium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              {isDark ? <Sun className="h-4 w-4 text-ride-amber" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className={`w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-ride-green' : 'bg-muted'} flex items-center px-0.5`}>
            <motion.div
              className="w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ x: isDark ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </motion.button>

        {settingsItems.map((item, i) => (
          <motion.button
            key={item.label}
            onClick={item.action}
            className="flex items-center justify-between w-full py-2.5 px-1 rounded-xl hover:bg-muted/50 transition-premium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </motion.button>
        ))}
      </div>

      {/* Sign Out */}
      <motion.button
        onClick={logout}
        className="flex items-center justify-center gap-2 w-full mt-3 h-11 rounded-xl bg-ride-red/10 text-ride-red font-semibold text-sm transition-premium hover:bg-ride-red/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </motion.button>
    </motion.div>
  );
}

export default function DriverProfile() {
  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="relative z-10 px-4 pt-6 pb-24 flex flex-col gap-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="text-xs text-muted-foreground">Your driver profile</p>
        </motion.div>

        <ProfileCard />
        <VehicleInfo />
        <Documents />
        <BankDetails />
        <Settings />
      </div>

      <DriverBottomNav />
    </div>
  );
}