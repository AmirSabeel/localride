'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  TrendingUp, IndianRupee, ArrowUpRight, Wallet, CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import DriverBottomNav from '@/components/driver/driver-bottom-nav';

type Period = 'today' | 'week' | 'month';

function BalanceCard() {
  const { monthlyEarnings } = useAppStore();
  const animatedBalance = useAnimatedCounter(monthlyEarnings, 1200);

  return (
    <motion.div
      className="relative rounded-2xl p-5 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl gradient-primary opacity-20" />
      <div className="absolute inset-[1.5px] rounded-[14px] glass-strong" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p>
          <motion.button
            className="flex items-center gap-1 text-xs font-semibold text-ride-green"
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.info('Withdrawal request initiated!', { icon: '🏦' })}
          >
            Withdraw
            <ArrowUpRight className="h-3 w-3" />
          </motion.button>
        </div>
        <div className="flex items-baseline gap-1.5 mb-4">
          <IndianRupee className="h-6 w-6 text-ride-green" />
          <span className="text-4xl font-bold tracking-tight gradient-text">
            {animatedBalance.toLocaleString('en-IN')}
          </span>
        </div>
        <motion.button
          className="w-full h-11 rounded-xl bg-ride-green/10 text-ride-green font-semibold text-sm flex items-center justify-center gap-2 transition-premium hover:bg-ride-green/20"
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.info('Withdrawal request initiated!', { icon: '🏦' })}
        >
          <Wallet className="h-4 w-4" />
          Withdraw to Bank
        </motion.button>
      </div>
    </motion.div>
  );
}

function PeriodTabs({ period, setPeriod }: { period: Period; setPeriod: (p: Period) => void }) {
  const tabs: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <div className="flex rounded-xl bg-muted/50 p-1">
      {tabs.map((tab) => (
        <motion.button
          key={tab.key}
          onClick={() => setPeriod(tab.key)}
          className={`relative flex-1 h-9 rounded-lg text-xs font-semibold transition-premium ${
            period === tab.key ? 'text-white' : 'text-muted-foreground'
          }`}
          whileTap={{ scale: 0.96 }}
        >
          {period === tab.key && (
            <motion.div
              className="absolute inset-0 rounded-lg gradient-primary"
              layoutId="period-tab-active"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function PeriodStats({ period }: { period: Period }) {
  const { todayEarnings, weeklyEarnings, monthlyEarnings, todayTrips, weeklyTrips } = useAppStore();

  const earnings = period === 'today' ? todayEarnings : period === 'week' ? weeklyEarnings : monthlyEarnings;
  const trips = period === 'today' ? todayTrips : period === 'week' ? weeklyTrips : 38;
  const avgPerTrip = trips > 0 ? Math.round(earnings / trips) : 0;

  const animatedEarnings = useAnimatedCounter(earnings, 600);
  const animatedAvg = useAnimatedCounter(avgPerTrip, 600);

  return (
    <motion.div
      key={period}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Earnings + Trips */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          className="glass-strong shadow-premium rounded-2xl p-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
          <div className="flex items-baseline gap-0.5">
            <IndianRupee className="h-4 w-4 text-ride-green" />
            <span className="text-2xl font-bold">{animatedEarnings.toLocaleString('en-IN')}</span>
          </div>
        </motion.div>
        <motion.div
          className="glass-strong shadow-premium rounded-2xl p-4"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Trips</p>
            <p className="text-xs text-muted-foreground">Avg/Trip</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{trips}</span>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-3 w-3 text-ride-green" />
              <span className="text-sm font-semibold">{animatedAvg}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart — shown for all periods */}
      <EarningsBarChart period={period} />
    </motion.div>
  );
}

function EarningsBarChart({ period }: { period: Period }) {
  const { todayEarnings, weeklyEarnings, monthlyEarnings } = useAppStore();
  const today = new Date().getDay(); // 0=Sun…6=Sat
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  let chartData: { label: string; amount: number; highlight: boolean }[];
  let title: string;

  if (period === 'today') {
    // Hourly breakdown for today (8 AM – 10 PM)
    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    const seeds = [0.08, 0.12, 0.18, 0.22, 0.15, 0.14, 0.08, 0.03];
    const nowHour = new Date().getHours();
    chartData = hours.map((h, i) => ({
      label: h > 12 ? `${h - 12}pm` : `${h}am`,
      amount: Math.round(todayEarnings * seeds[i]),
      highlight: h <= nowHour,
    }));
    title = 'Hourly Breakdown';
  } else if (period === 'week') {
    const remaining = Math.max(0, weeklyEarnings - todayEarnings);
    const seeds = [0.18, 0.22, 0.14, 0.19, 0.13, 0.14];
    const todayIdx = today === 0 ? 6 : today - 1;
    chartData = days.map((day, i) => ({
      label: day,
      amount: i === today ? todayEarnings : Math.round(remaining * seeds[i % seeds.length]),
      highlight: i === today,
    }));
    title = 'Daily Earnings';
  } else {
    // Monthly: show last 6 months
    const monthlySeed = [0.06, 0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.09, 0.08, 0.09, 0.10, 0.13];
    chartData = Array.from({ length: 6 }, (_, i) => {
      const monthIdx = (currentMonth - 5 + i + 12) % 12;
      return {
        label: months[monthIdx],
        amount: Math.round(monthlyEarnings * monthlySeed[monthIdx] * 2),
        highlight: monthIdx === currentMonth,
      };
    });
    title = 'Monthly Earnings';
  }

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

  return (
    <motion.div
      className="glass-strong shadow-premium rounded-2xl p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p className="text-sm font-semibold mb-4">{title}</p>
      <div className="flex items-end justify-between gap-2 h-36">
        {chartData.map((item, i) => {
          const heightPct = (item.amount / maxAmount) * 100;
          return (
            <div key={item.label} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[9px] font-medium text-muted-foreground">
                {item.amount >= 1000 ? `₹${(item.amount / 1000).toFixed(1)}k` : item.amount > 0 ? `₹${item.amount}` : ''}
              </span>
              <div className="w-full relative h-28 rounded-lg bg-muted/30 overflow-hidden">
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 rounded-lg ${item.highlight ? 'gradient-primary' : 'bg-ride-green/60'}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.6, type: 'spring', stiffness: 120, damping: 15 }}
                />
              </div>
              <span className={`text-[9px] font-medium ${item.highlight ? 'text-ride-green' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function EarningsView() {
  const [period, setPeriod] = useState<Period>('week');

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="relative z-10 px-4 pt-6 pb-24 flex flex-col gap-5">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl font-bold">Earnings</h1>
            <p className="text-xs text-muted-foreground">Your earnings overview</p>
          </div>
          <motion.button
            className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center"
            whileTap={{ scale: 0.92 }}
            onClick={() => toast.info('Withdrawal request initiated!', { icon: '🏦' })}
          >
            <CreditCard className="h-4 w-4 text-white" />
          </motion.button>
        </motion.div>

        {/* Balance Card */}
        <BalanceCard />

        {/* Period Tabs */}
        <PeriodTabs period={period} setPeriod={setPeriod} />

        {/* Period Stats */}
        <PeriodStats period={period} />
      </div>

      <DriverBottomNav />
    </div>
  );
}