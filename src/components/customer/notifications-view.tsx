"use client";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Car, IndianRupee, Tag, Bell, CheckCheck,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import BottomNav from "@/components/customer/bottom-nav";

function getNotifIcon(type: string) {
  switch (type) {
    case "ride_completed": return Car;
    case "payment": return IndianRupee;
    case "promo": return Tag;
    default: return Bell;
  }
}

function getNotifColor(type: string) {
  switch (type) {
    case "ride_completed": return "text-ride-green bg-ride-green/10";
    case "payment": return "text-ride-green bg-ride-green/10";
    case "promo": return "text-ride-amber bg-ride-amber/10";
    default: return "text-muted-foreground bg-foreground/5";
  }
}

export default function NotificationsView() {
  const {
    notifications, unreadCount,
    markAllNotificationsRead,
  } = useAppStore();

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast.success("All notifications marked as read");
  };

  return (
    <div className="relative min-h-dvh w-full bg-background">
      {/* Top Bar */}
      <motion.div
        className="safe-top glass fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-lg font-bold text-foreground">Notifications</h1>
        {unreadCount > 0 && (
          <motion.button
            className="flex items-center gap-1.5 text-xs font-semibold text-ride-green"
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllRead}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </motion.button>
        )}
      </motion.div>

      <div className="px-4 pt-20 pb-24">
        {notifications.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/[0.03]">
              <Bell className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="mt-1 text-xs text-muted-foreground/60">You&apos;re all caught up!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col gap-2">
              {notifications.map((notif: any, i: number) => {
                const Icon = getNotifIcon(notif.type);
                const colorClass = getNotifColor(notif.type);
                const isUnread = !notif.read;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                    className={`glass shadow-premium relative rounded-xl p-3.5 ${
                      isUnread ? "border-l-[3px] border-l-ride-green" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm ${isUnread ? "font-bold" : "font-medium"} text-foreground`}>
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <div className="notification-dot h-2 w-2 shrink-0 rounded-full bg-ride-green" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {notif.body}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/60">{notif.time}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}