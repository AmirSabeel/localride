"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2, Star, Clock, Route, Wallet, Heart,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import type { CompletedRide } from "@/store/app-store";import { Textarea } from "@/components/ui/textarea";

const CONFETTI_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 300,
  y: -(Math.random() * 300 + 100),
  rotate: Math.random() * 720 - 360,
  color: ["#00C853", "#00E676", "#69F0AE", "#F59E0B", "#14B8A6", "#10B981"][i % 6],
  size: Math.random() * 6 + 3,
}));

export default function RideComplete() {
  const { activeRide, setActiveRide, setCustomerView, setWalletBalance, walletBalance, addCompletedRide, addWalletTransaction } = useAppStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  if (!activeRide) return null;

  const tips = [20, 50, 100];

  const handleDone = () => {
    if (rating === 0) {
      toast.error("Please rate your ride");
      return;
    }
    const tipAmount = selectedTip || 0;
    const totalDeducted = activeRide.fare + tipAmount;
    setWalletBalance(walletBalance - totalDeducted);

    // Format date as "Today, H:MM AM/PM"
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = `Today, ${timeStr}`;

    const completed: CompletedRide = {
      id: activeRide.id,
      from: activeRide.pickup.address,
      to: activeRide.destination.address,
      fare: activeRide.fare,
      distance: activeRide.distance,
      duration: activeRide.duration,
      date: dateStr,
      status: "completed",
      rating,
      driverName: activeRide.driverName,
      vehicleType: activeRide.vehicleType,
      tip: tipAmount,
    };
    addCompletedRide(completed);

    // Single wallet debit for fare + tip combined
    addWalletTransaction({
      id: "tx-" + activeRide.id,
      type: "debit",
      description: tipAmount > 0
        ? `Ride to ${activeRide.destination.address.split(",")[0]} + tip`
        : `Ride to ${activeRide.destination.address.split(",")[0]}`,
      amount: totalDeducted,
      date: dateStr,
      icon: "ride",
    });

    setActiveRide(null);
    setCustomerView("home");
    toast.success("Thank you for riding with LocalRide! 🎉");
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Confetti */}
      {CONFETTI_PARTICLES.map((p, i) => (
        <motion.div
          key={p.id}
          className="absolute top-1/3 left-1/2 rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0 }}
          transition={{ delay: 0.5 + i * 0.05, duration: 2, ease: "easeOut" }}
        />
      ))}

      {/* Card */}
      <motion.div
        className="glass-strong shadow-float relative z-10 w-full max-w-sm rounded-3xl p-6"
        initial={{ y: 60, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* Green Checkmark */}
        <motion.div
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-ride-green/10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 18 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 15 }}
          >
            <CheckCircle2 className="h-12 w-12 text-ride-green" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="mb-1 text-center text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Ride Completed!
        </motion.h2>
        <motion.p
          className="mb-5 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Thanks for riding with LocalRide
        </motion.p>

        {/* Trip Summary */}
        <motion.div
          className="mb-5 space-y-3 rounded-2xl bg-foreground/[0.03] p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className="h-2 w-2 rounded-full bg-ride-green" />
              <div className="h-5 w-[1.5px] bg-foreground/10" />
              <div className="h-2 w-2 rounded-full bg-ride-red" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-muted-foreground truncate">{activeRide.pickup.address}</p>
              <p className="text-xs text-foreground font-medium truncate">{activeRide.destination.address}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-foreground/5 pt-3">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <Route className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activeRide.distance} km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activeRide.duration} min</span>
              </div>
            </div>
            <span className="text-lg font-bold gradient-text">₹{activeRide.fare}</span>
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div
          className="mb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="mb-2 text-sm font-medium text-foreground">How was your ride?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-ride-amber text-ride-amber"
                      : "text-muted-foreground/30"
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Review */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Textarea
            placeholder="Leave a review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[60px] resize-none rounded-xl border-foreground/10 bg-foreground/[0.03] text-sm"
          />
        </motion.div>

        {/* Payment Method */}
        <motion.div
          className="mb-4 flex items-center justify-between rounded-xl bg-foreground/[0.03] p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-ride-green" />
            <span className="text-sm font-medium">LocalRide Wallet</span>
          </div>
          <span className="text-sm font-bold text-foreground">₹{activeRide.fare}</span>
        </motion.div>

        {/* Tip Section */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="mb-2 text-sm font-medium text-foreground flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-ride-red" />
            Tip your driver
          </p>
          <div className="flex gap-2">
            {tips.map((tip) => (
              <motion.button
                key={tip}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-premium ${
                  selectedTip === tip
                    ? "bg-ride-green/10 border-2 border-ride-green text-ride-green shadow-glow-green"
                    : "bg-foreground/[0.03] border-2 border-transparent text-foreground hover:bg-foreground/[0.06]"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTip(selectedTip === tip ? null : tip)}
              >
                ₹{tip}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Done Button */}
        <motion.button
          className="btn-premium gradient-primary w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-glow-green"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDone}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          Done
        </motion.button>
      </motion.div>
    </div>
  );
}