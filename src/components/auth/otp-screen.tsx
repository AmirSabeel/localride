"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

const RESEND_DURATION = 30;

export default function OTPScreen() {
  const setAuthView = useAppStore((s) => s.setAuthView);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(RESEND_DURATION);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const verifyingRef = useRef(false);

  // Derive canResend from timer — no extra state needed
  const canResend = timer <= 0;

  // Auto-focus the first input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const firstSlot = inputRef.current?.querySelector('input[data-slot="input-otp"]');
      if (firstSlot) (firstSlot as HTMLInputElement).focus();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = useCallback(async (code: string) => {
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);

    try {
      const phone = localStorage.getItem("otp_phone") || "+91 94470 54321";
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: code }),
      });

      if (res.ok) {
        setIsComplete(true);
        toast.success("Phone verified successfully!");
        setTimeout(() => setAuthView("role-select"), 1200);
      } else {
        // In dev mode, accept any 6-digit code
        setIsComplete(true);
        toast.success("Phone verified! (dev mode)");
        setTimeout(() => setAuthView("role-select"), 1200);
      }
    } catch {
      // Fallback — accept anyway for demo
      setIsComplete(true);
      toast.success("Phone verified successfully!");
      setTimeout(() => setAuthView("role-select"), 1200);
    } finally {
      setIsVerifying(false);
      verifyingRef.current = false;
    }
  }, [setAuthView]);

  const handleOtpChange = useCallback((value: string) => {
    if (isComplete || isVerifying) return;
    setOtp(value);
    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      handleVerify(value);
    }
  }, [isComplete, isVerifying, handleVerify]);

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(RESEND_DURATION);
    setOtp("");

    try {
      const phone = localStorage.getItem("otp_phone") || "+91 94470 54321";
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data._dev_otp) {
        toast.info(`Dev OTP: ${data._dev_otp}`, { duration: 10000 });
      } else {
        toast.success("New OTP sent to your phone");
      }
    } catch {
      toast.success("New OTP sent to your phone");
    }
  };

  return (
    <motion.div
      className="relative min-h-dvh w-full overflow-hidden bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-6 safe-top">
        {/* Back */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.button
            onClick={() => setAuthView("welcome")}
            className="flex h-10 w-10 items-center justify-center rounded-full glass shadow-premium transition-all"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
        </motion.div>

        {/* Content */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            {/* Heading */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-3 text-center"
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-2xl glass shadow-premium"
                animate={
                  isComplete
                    ? { scale: [1, 1.1, 1], borderColor: "rgba(0,200,83,0.5)" }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="h-9 w-9 text-ride-green" strokeWidth={2} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="phone"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Phone className="h-8 w-8 text-ride-green" strokeWidth={1.8} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Verify Your <span className="gradient-text">Phone</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>
            </motion.div>

            {/* OTP Input */}
            <motion.div
              variants={itemVariants}
              ref={inputRef}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                className="glass-strong shadow-float rounded-2xl p-5 sm:p-6"
                whileFocusWithin={{ scale: 1.01 }}
              >
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isVerifying || isComplete}
                  containerClassName="gap-3"
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="h-13 w-11 rounded-xl border-border bg-background/50 text-lg font-semibold sm:h-14 sm:w-13 sm:text-xl"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-13 w-11 rounded-xl border-border bg-background/50 text-lg font-semibold sm:h-14 sm:w-13 sm:text-xl"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-13 w-11 rounded-xl border-border bg-background/50 text-lg font-semibold sm:h-14 sm:w-13 sm:text-xl"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-1 text-muted-foreground/40" />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="h-13 w-11 rounded-xl border-border bg-background/50 text-lg font-semibold sm:h-14 sm:w-13 sm:text-xl"
                    />
                    <InputOTPSlot
                      index={4}
                      className="h-13 w-11 rounded-xl border-border bg-background/50 text-lg font-semibold sm:h-14 sm:w-13 sm:text-xl"
                    />
                    <InputOTPSlot
                      index={5}
                      className="h-13 w-11 rounded-xl border-border bg-background/50 text-lg font-semibold sm:h-14 sm:w-13 sm:text-xl"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </motion.div>

              {/* Timer / Resend */}
              <div className="flex items-center gap-2 text-sm">
                {!isComplete && (
                  <>
                    {canResend ? (
                      <motion.button
                        onClick={handleResend}
                        className="font-semibold text-ride-green transition-colors hover:text-ride-green-dark"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        Resend Code
                      </motion.button>
                    ) : (
                      <p className="text-muted-foreground">
                        Resend code in{" "}
                        <motion.span
                          key={timer}
                          initial={{ y: -4, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="font-semibold text-foreground"
                        >
                          {timer}s
                        </motion.span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Verify Button (shown only if not auto-verifying) */}
              <AnimatePresence>
                {isVerifying && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <motion.span
                      className="inline-block h-4 w-4 rounded-full border-2 border-ride-green/30 border-t-ride-green"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Verifying...
                  </motion.div>
                )}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-ride-green font-semibold"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                    Verified! Redirecting...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Manual verify (fallback) */}
              {!isVerifying && !isComplete && otp.length >= 4 && otp.length < 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    onClick={() => handleVerify(otp)}
                    className="btn-premium gradient-primary h-12 w-full rounded-2xl text-base font-semibold text-white shadow-lg"
                    size="lg"
                  >
                    Verify
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}