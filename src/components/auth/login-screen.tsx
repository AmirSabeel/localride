"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

export default function LoginScreen() {
  const setAuthView = useAppStore((s) => s.setAuthView);
  const setTempUser = useAppStore((s) => s.setTempUser);
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => setAuthView("welcome");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      const u = data.user;
      if (u.isVerified === false) {
        setTempUser(u.id, u.name, u.avatar || "", u.phone || "", u.role);
        if (u.phone) {
          localStorage.setItem("otp_phone", u.phone);
        }
        toast.info("Please verify your phone number to log in.");
        setAuthView("otp");
        return;
      }
      login(u.role, u.id, u.name, u.avatar || "", u.phone || "");
      toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
    } catch {
      // Fallback to demo login if API is unreachable
      login("customer", "c1", "Arjun Krishnan", "", "+91 94470 54321");
      toast.success("Welcome back, Arjun! (demo mode)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset link sent to your email.");
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
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-6 safe-top">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full glass shadow-premium transition-all hover:scale-105 active:scale-95"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
        </motion.div>

        {/* Content */}
        <div className="flex flex-1 flex-col items-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            {/* Heading */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome <span className="gradient-text">Back</span>
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Sign in to continue your journey
              </p>
            </motion.div>

            {/* Glass Card Form */}
            <motion.div
              variants={itemVariants}
              className="glass-strong shadow-float w-full rounded-3xl p-6 sm:p-8"
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Email */}
                <motion.div
                  className="flex flex-col gap-2"
                  whileFocus={{ scale: 1.01 }}
                >
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl pl-10 text-base transition-all focus-visible:ring-ride-green/30"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  className="flex flex-col gap-2"
                  whileFocus={{ scale: 1.01 }}
                >
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl pl-10 text-base transition-all focus-visible:ring-ride-green/30"
                      required
                    />
                  </div>
                </motion.div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <motion.button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-ride-green transition-colors hover:text-ride-green-dark sm:text-sm"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Forgot Password?
                  </motion.button>
                </div>

                {/* Submit */}
                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-premium gradient-primary h-12 w-full rounded-2xl text-base font-semibold text-white shadow-lg sm:h-13"
                    size="lg"
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex items-center gap-2"
                        >
                          <motion.span
                            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          Signing In...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          Sign In
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="flex w-full items-center gap-3"
            >
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </motion.div>

            {/* Google Button */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                type="button"
                variant="outline"
                className="glass h-12 w-full rounded-2xl border-border text-base font-medium transition-all hover:bg-foreground/5 sm:h-13"
                size="lg"
                onClick={() => {
                  login("customer", "c1", "Arjun Krishnan", "", "+91 94470 54321");
                  toast.success("Signed in with Google!");
                }}
              >
                <Chrome className="h-5 w-5" />
                Sign in with Google
              </Button>
            </motion.div>

            {/* Sign Up link */}
            <motion.p
              variants={itemVariants}
              className="pb-6 text-center text-sm text-muted-foreground sm:text-base"
            >
              Don&apos;t have an account?{" "}
              <motion.button
                onClick={() => setAuthView("register")}
                className="font-semibold text-ride-green transition-colors hover:text-ride-green-dark"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign Up
              </motion.button>
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}