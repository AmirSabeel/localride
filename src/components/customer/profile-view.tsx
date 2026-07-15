"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  ChevronRight, Bell, Moon, Shield, HelpCircle,
  Info, LogOut, MapPinHouse, CreditCard, Phone, Pencil, Mail,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/customer/bottom-nav";

interface SettingItem {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  color?: string;
  action?: () => void;
  right?: React.ReactNode;
}

export default function ProfileView() {
  const {
    userName, userPhone, logout, unreadCount,
    markAllNotificationsRead, setUserName, setUserPhone,
  } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(userName || "");
  const [editPhone, setEditPhone] = useState(userPhone || "");

  const isDark = theme === "dark";

  const handleSaveProfile = () => {
    if (!editName.trim()) { toast.error("Name cannot be empty"); return; }
    setUserName(editName.trim());
    setUserPhone(editPhone.trim());
    setEditing(false);
    toast.success("Profile updated");
  };

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully");
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Account",
      items: [
        {
          icon: MapPinHouse, label: "Saved Addresses",
          subtitle: "Home, Office, and more",
          action: () => toast.info("Saved addresses"),
        },
        {
          icon: CreditCard, label: "Payment Methods",
          subtitle: "Wallet, UPI, Cards",
          action: () => toast.info("Payment methods"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell, label: "Notifications",
          subtitle: "Ride updates and offers",
          right: (
            <Switch
              checked={notificationsOn}
              onCheckedChange={(checked) => {
                setNotificationsOn(checked);
                if (checked) toast.info("Notifications enabled");
              }}
            />
          ),
        },
        {
          icon: Moon, label: "Dark Mode",
          subtitle: isDark ? "On" : "Off",
          right: (
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          ),
        },
      ],
    },
    {
      title: "Safety & Support",
      items: [
        {
          icon: Phone, label: "Emergency Contacts",
          subtitle: "Add trusted contacts",
          action: () => toast.info("Emergency contacts"),
        },
        {
          icon: Shield, label: "Privacy & Security",
          action: () => toast.info("Privacy settings"),
        },
        {
          icon: HelpCircle, label: "Help & Support",
          action: () => toast.info("Help center"),
        },
        {
          icon: Info, label: "About LocalRide",
          subtitle: "Version 1.0.0",
          action: () => toast.info("LocalRide v1.0.0"),
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-dvh w-full bg-background">
      {/* Top Bar */}
      <motion.div
        className="safe-top glass fixed top-0 left-0 right-0 z-40 flex items-center justify-center px-4 py-3"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
      </motion.div>

      <div className="px-4 pt-20 pb-24">
        {/* Profile Header */}
        <motion.div
          className="mb-6 flex flex-col items-center text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <motion.div
            className="relative mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 18 }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white shadow-glow-green-strong">
              {(editing ? editName : userName)?.charAt(0).toUpperCase() || "U"}
            </div>
            <motion.button
              className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ride-green text-white shadow-premium"
              whileTap={{ scale: 0.9 }}
              onClick={() => { setEditing(true); setEditName(userName || ""); setEditPhone(userPhone || ""); }}
            >
              <Pencil className="h-3 w-3" />
            </motion.button>
          </motion.div>

          {editing ? (
            <motion.div
              className="w-full max-w-xs flex flex-col gap-2 mt-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="h-10 rounded-xl text-center text-sm bg-foreground/[0.04] border-foreground/10"
              />
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-10 rounded-xl text-center text-sm bg-foreground/[0.04] border-foreground/10"
              />
              <div className="flex gap-2">
                <motion.button
                  className="flex-1 rounded-xl py-2 text-xs font-semibold text-muted-foreground bg-foreground/[0.04] hover:bg-foreground/[0.08]"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(false)}
                >Cancel</motion.button>
                <motion.button
                  className="flex-1 rounded-xl py-2 text-xs font-semibold text-white gradient-primary shadow-glow-green"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                >Save</motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground">{userName || "User"}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{userPhone || "+91 XXXXX XXXXX"}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{userName?.toLowerCase().replace(" ", ".")}@localride.in</span>
              </div>
              <motion.button
                className="mt-3 flex items-center gap-1.5 rounded-full bg-foreground/[0.03] px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground/[0.06] transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => { setEditing(true); setEditName(userName || ""); setEditPhone(userPhone || ""); }}
              >
                <Pencil className="h-3 w-3" />
                Edit Profile
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, si) => (
          <motion.div
            key={section.title}
            className="mb-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + si * 0.1 }}
          >
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {section.title}
            </h3>
            <div className="glass shadow-premium overflow-hidden rounded-2xl">
              {section.items.map((item, ii) => {
                const Icon = item.icon;
                const isLast = ii === section.items.length - 1;
                return (
                  <motion.button
                    key={item.label}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.02] transition-colors ${
                      !isLast ? "border-b border-foreground/5" : ""
                    }`}
                    whileTap={{ scale: 0.99 }}
                    onClick={item.action}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ride-green/10">
                      <Icon className="h-4.5 w-4.5 text-ride-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                    {item.right || (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}