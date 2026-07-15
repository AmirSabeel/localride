'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  Bell, BellOff, CheckCheck, Car, Wallet, Tag, Info, ChevronRight,
} from 'lucide-react';
import DriverBottomNav from '@/components/driver/driver-bottom-nav';

// Notification type icons and styles
const NOTIF_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  ride_request: { icon: Car, color: 'text-ride-green', bg: 'bg-ride-green/10' },
  payment:      { icon: Wallet, color: 'text-ride-amber', bg: 'bg-ride-amber/10' },
  promo:        { icon: Tag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  system:       { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ride_completed: { icon: Car, color: 'text-ride-green', bg: 'bg-ride-green/10' },
};

function getConfig(type: string) {
  return NOTIF_CONFIG[type] ?? { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted/50' };
}

// Default driver-specific notifications to show when none exist
const DRIVER_DEFAULT_NOTIFICATIONS = [
  {
    id: 'dn1',
    title: 'Earnings Credited',
    body: '₹68 from your last trip has been added to your wallet.',
    type: 'payment',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'dn2',
    title: 'New Surge Zone',
    body: '1.5× surge pricing active near Vadakara Bus Stand. Head there now!',
    type: 'system',
    time: '12 min ago',
    read: false,
  },
  {
    id: 'dn3',
    title: 'Ride Request Missed',
    body: 'You missed a ride request from Rahul Verma (₹120). Stay active!',
    type: 'ride_request',
    time: '35 min ago',
    read: true,
  },
  {
    id: 'dn4',
    title: 'Weekly Bonus',
    body: 'Complete 5 more trips this week to earn a ₹200 bonus!',
    type: 'promo',
    time: '1 hour ago',
    read: true,
  },
  {
    id: 'dn5',
    title: 'App Update Available',
    body: 'Update LocalRide Driver to get improved navigation and faster ride matching.',
    type: 'system',
    time: '3 hours ago',
    read: true,
  },
];

export default function DriverNotifications() {
  const { notifications, markAllNotificationsRead, unreadCount } = useAppStore();

  // Merge store notifications with driver-specific defaults (deduplicated by id)
  const storeIds = new Set(notifications.map((n: any) => n.id));
  const allNotifications = [
    ...notifications,
    ...DRIVER_DEFAULT_NOTIFICATIONS.filter((n) => !storeIds.has(n.id)),
  ];

  const hasUnread = unreadCount > 0 || allNotifications.some((n: any) => !n.read);

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="relative z-10 px-4 pt-6 pb-24 flex flex-col gap-4">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-xs text-muted-foreground">
              {hasUnread ? `${allNotifications.filter((n: any) => !n.read).length} unread` : 'All caught up'}
            </p>
          </div>
          {hasUnread && (
            <motion.button
              onClick={() => {
                markAllNotificationsRead();
                toast.success('All notifications marked as read');
              }}
              className="flex items-center gap-1.5 rounded-full bg-ride-green/10 px-3 py-1.5 text-xs font-semibold text-ride-green"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </motion.button>
          )}
        </motion.div>

        {/* Empty state */}
        {allNotifications.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BellOff className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </motion.div>
        )}

        {/* Notification cards */}
        <AnimatePresence>
          {allNotifications.map((notif: any, i: number) => {
            const config = getConfig(notif.type);
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                className={`glass-strong shadow-premium rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-premium relative overflow-hidden ${
                  !notif.read ? 'border border-ride-green/20' : ''
                }`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toast(notif.title, { description: notif.body })}
              >
                {/* Unread indicator strip */}
                {!notif.read && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl gradient-primary"
                    layoutId={`notif-indicator-${notif.id}`}
                  />
                )}

                {/* Icon */}
                <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!notif.read ? '' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <DriverBottomNav />
    </div>
  );
}
