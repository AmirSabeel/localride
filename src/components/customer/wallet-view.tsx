"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, ArrowDownLeft,
  CreditCard, Smartphone, Banknote, ShoppingBag,
} from "lucide-react";
import { useAppStore, type WalletTransaction } from "@/store/app-store";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/customer/bottom-nav";

const SEED_TRANSACTIONS: WalletTransaction[] = [
  { id: "t1", type: "debit",  description: "Ride to Vadakara",       amount: 85,  date: "Today, 2:30 PM",     icon: "ride"   },
  { id: "t2", type: "credit", description: "Wallet Top-up",          amount: 500, date: "Today, 10:00 AM",    icon: "topup"  },
  { id: "t3", type: "debit",  description: "Ride to Iringal",        amount: 45,  date: "Yesterday, 6:15 PM", icon: "ride"   },
  { id: "t4", type: "credit", description: "Refund - Cancelled Ride",amount: 42,  date: "Yesterday, 1:20 PM", icon: "refund" },
  { id: "t5", type: "debit",  description: "Ride to Thikkodi",       amount: 55,  date: "Jul 11, 4:45 PM",    icon: "ride"   },
  { id: "t6", type: "credit", description: "Promo Cashback",         amount: 25,  date: "Jul 10, 7:00 PM",    icon: "promo"  },
];

const QUICK_ADD = [100, 200, 500, 1000];

function getTransactionIcon(type: string) {
  switch (type) {
    case "ride": return ShoppingBag;
    case "topup": return CreditCard;
    case "refund": return ArrowDownLeft;
    case "promo": return Plus;
    default: return Wallet;
  }
}

export default function WalletView() {
  const { setCustomerView, walletBalance, setWalletBalance, walletTransactions, addWalletTransaction } = useAppStore();
  const [addAmount, setAddAmount] = useState("");
  const [displayBalance, setDisplayBalance] = useState(walletBalance);

  useEffect(() => {
    setDisplayBalance(walletBalance);
  }, [walletBalance]);

  // Merge real transactions (newest first) with seed data (deduplicated)
  const allTransactions: WalletTransaction[] = [
    ...walletTransactions,
    ...SEED_TRANSACTIONS.filter((s) => !walletTransactions.some((t) => t.id === s.id)),
  ];

  const handleAddMoney = (amount: number) => {
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    setAddAmount("");
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    addWalletTransaction({
      id: "tx-" + Date.now(),
      type: "credit",
      description: "Wallet Top-up",
      amount,
      date: `Today, ${timeStr}`,
      icon: "topup",
    });
    toast.success(`₹${amount} added to wallet`, { description: "New balance: ₹" + newBalance.toFixed(0) });
  };

  const handleCustomAdd = () => {
    const val = parseInt(addAmount);
    if (!val || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    handleAddMoney(val);
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
        <h1 className="text-lg font-bold text-foreground">Wallet</h1>
        <motion.button
          className="flex items-center gap-1.5 rounded-full bg-ride-green/10 px-3 py-1.5 text-xs font-semibold text-ride-green"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            handleAddMoney(200);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Money
        </motion.button>
      </motion.div>

      <div className="px-4 pt-20 pb-24">
        {/* Balance Card */}
        <motion.div
          className="mb-6 overflow-hidden rounded-3xl p-6 relative"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="absolute inset-0 gradient-premium opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-white/80">Available Balance</p>
            <motion.div
              className="flex items-baseline gap-1"
              key={displayBalance}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-4xl font-bold text-white">₹</span>
              <span className="text-4xl font-bold text-white">{displayBalance.toFixed(0)}</span>
            </motion.div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-6 items-center gap-1 rounded-full bg-white/20 px-2.5">
                <Smartphone className="h-3 w-3 text-white" />
                <span className="text-[10px] font-medium text-white">UPI</span>
              </div>
              <div className="flex h-6 items-center gap-1 rounded-full bg-white/20 px-2.5">
                <CreditCard className="h-3 w-3 text-white" />
                <span className="text-[10px] font-medium text-white">Card</span>
              </div>
              <div className="flex h-6 items-center gap-1 rounded-full bg-white/20 px-2.5">
                <Banknote className="h-3 w-3 text-white" />
                <span className="text-[10px] font-medium text-white">Cash</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Add */}
        <motion.div
          className="mb-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-2.5 text-sm font-semibold text-foreground">Quick Add</h3>
          <div className="flex gap-2.5">
            {QUICK_ADD.map((amt) => (
              <motion.button
                key={amt}
                className="flex-1 rounded-2xl bg-foreground/[0.03] py-3 text-sm font-bold text-foreground transition-premium hover:bg-foreground/[0.06]"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddMoney(amt)}
              >
                ₹{amt}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Custom Add */}
        <motion.div
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="h-11 pl-7 rounded-xl border-foreground/10 bg-foreground/[0.03] text-sm"
              />
            </div>
            <motion.button
              className="btn-premium gradient-primary px-6 rounded-xl text-sm font-bold text-white shadow-glow-green"
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomAdd}
            >
              Add
            </motion.button>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-3 text-sm font-semibold text-foreground">Transaction History</h3>
          <div className="flex flex-col gap-2">
            {allTransactions.map((tx, i) => {
              const TxIcon = getTransactionIcon(tx.icon);
              const isCredit = tx.type === "credit";
              return (
                <motion.div
                  key={tx.id}
                  className="glass shadow-premium flex items-center gap-3 rounded-xl p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isCredit ? "bg-ride-green/10" : "bg-destructive/10"
                  }`}>
                    <TxIcon className={`h-4.5 w-4.5 ${isCredit ? "text-ride-green" : "text-destructive"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-bold ${isCredit ? "text-ride-green" : "text-destructive"}`}>
                    {isCredit ? "+" : "-"}₹{tx.amount}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}