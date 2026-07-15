"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Building2, DollarSign, Bell, Shield, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

interface PlatformSettings {
  appName: string;
  contactEmail: string;
  supportPhone: string;
}

interface FareConfig {
  baseFare: string;
  perKmRate: string;
  surgePricing: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface SecuritySettings {
  twoFactor: boolean;
  sessionTimeout: string;
}

export default function AdminSettings() {
  const [platform, setPlatform] = useState<PlatformSettings>({
    appName: "LocalRide",
    contactEmail: "admin@localride.in",
    supportPhone: "+91 1800 123 4567",
  });

  const [fare, setFare] = useState<FareConfig>({
    baseFare: "50",
    perKmRate: "14",
    surgePricing: true,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: true,
    push: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: false,
    sessionTimeout: "30",
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your platform</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSave}
            className="btn-premium gradient-primary text-white border-0 rounded-xl h-10 px-5"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>
      </motion.div>

      {/* Platform Settings */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <Building2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold">Platform Settings</h3>
            <p className="text-[11px] text-muted-foreground">General platform configuration</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">App Name</label>
            <Input
              value={platform.appName}
              onChange={(e) => setPlatform((p) => ({ ...p, appName: e.target.value }))}
              className="rounded-xl h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Contact Email</label>
            <Input
              type="email"
              value={platform.contactEmail}
              onChange={(e) => setPlatform((p) => ({ ...p, contactEmail: e.target.value }))}
              className="rounded-xl h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Support Phone</label>
            <Input
              value={platform.supportPhone}
              onChange={(e) => setPlatform((p) => ({ ...p, supportPhone: e.target.value }))}
              className="rounded-xl h-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Fare Configuration */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10">
            <DollarSign className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-base font-bold">Fare Configuration</h3>
            <p className="text-[11px] text-muted-foreground">Pricing and surge settings</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Base Fare (₹)</label>
            <Input
              type="number"
              value={fare.baseFare}
              onChange={(e) => setFare((f) => ({ ...f, baseFare: e.target.value }))}
              className="rounded-xl h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Per KM Rate (₹)</label>
            <Input
              type="number"
              value={fare.perKmRate}
              onChange={(e) => setFare((f) => ({ ...f, perKmRate: e.target.value }))}
              className="rounded-xl h-10"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
            <div>
              <p className="text-sm font-medium">Surge Pricing</p>
              <p className="text-[11px] text-muted-foreground">Enable dynamic pricing</p>
            </div>
            <Switch
              checked={fare.surgePricing}
              onCheckedChange={(checked) => setFare((f) => ({ ...f, surgePricing: checked }))}
            />
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
            <Bell className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold">Notification Settings</h3>
            <p className="text-[11px] text-muted-foreground">Manage notification channels</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { key: "email" as const, label: "Email Notifications", desc: "Send alerts via email" },
            { key: "sms" as const, label: "SMS Notifications", desc: "Send alerts via SMS" },
            { key: "push" as const, label: "Push Notifications", desc: "Send push alerts" },
          ].map((item) => (
            <motion.div
              key={item.key}
              className="flex items-center justify-between rounded-xl border border-border/50 p-3.5"
              whileHover={{ borderColor: "rgba(0,200,83,0.3)" }}
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) =>
                  setNotifications((n) => ({ ...n, [item.key]: checked }))
                }
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div variants={itemVariants} className="glass rounded-2xl shadow-premium p-4 md:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
            <Shield className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold">Security</h3>
            <p className="text-[11px] text-muted-foreground">Authentication & session settings</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-border/50 p-3.5 sm:col-span-1">
            <div>
              <p className="text-sm font-medium">Two-Factor Auth</p>
              <p className="text-[11px] text-muted-foreground">Require 2FA for admin login</p>
            </div>
            <Switch
              checked={security.twoFactor}
              onCheckedChange={(checked) => setSecurity((s) => ({ ...s, twoFactor: checked }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Session Timeout (mins)</label>
            <Input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
              className="rounded-xl h-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Bottom Save (mobile) */}
      <motion.div variants={itemVariants} className="md:hidden">
        <Button
          onClick={handleSave}
          className="btn-premium gradient-primary text-white border-0 rounded-xl h-12 w-full text-base"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  );
}