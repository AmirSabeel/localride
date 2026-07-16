"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Car,
  UserCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore, type UserRole } from "@/store/app-store";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
};

const roles: {
  value: UserRole;
  label: string;
  icon: typeof Car;
  description: string;
}[] = [
  { value: "customer", label: "Customer", icon: UserCircle, description: "Book rides" },
  { value: "driver", label: "Driver", icon: Car, description: "Drive & earn" },
  { value: "admin", label: "Admin", icon: Shield, description: "Manage all" },
];

export default function RegisterScreen() {
  const setAuthView = useAppStore((s) => s.setAuthView);
  const login = useAppStore((s) => s.login);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => setAuthView("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      // 1. Register user in DB
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // 2. Send OTP if phone provided
      // 2. Send real SMS OTP via Firebase Phone Auth
      if (phone) {
        if (!auth) {
          throw new Error("Phone verification service is currently unavailable. Please verify your Firebase configuration.");
        }
        // Setup invisible recaptcha verifier
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {},
          });
        }
        
        const confirmationResult = await signInWithPhoneNumber(auth, phone, (window as any).recaptchaVerifier);
        (window as any).confirmationResult = confirmationResult;
        localStorage.setItem("otp_phone", phone);
        toast.success("Verification SMS sent! check your phone.");
      }

      const u = data.user;
      login(selectedRole, u.id, u.name, u.avatar || "", u.phone || phone || "");
      setAuthView("otp"); // Navigate to OTP code screen
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger phone verification");
    } finally {
      setIsLoading(false);
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
        {/* Hidden recaptcha element for Firebase Phone verification */}
        <div id="recaptcha-container"></div>

        {/* Back */}
        <motion.div variants={itemVariants} className="mb-4">
          <motion.button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full glass shadow-premium transition-all"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
        </motion.div>

        {/* Scrollable content */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto scrollbar-hide pb-8">
          <div className="flex w-full max-w-sm flex-col items-center gap-5">
            {/* Heading */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Create <span className="gradient-text">Account</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Join LocalRide and get started
              </p>
            </motion.div>

            {/* Glass Card Form */}
            <motion.div
              variants={itemVariants}
              className="glass-strong shadow-float w-full rounded-3xl p-6 sm:p-8"
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      placeholder="Arjun Krishnan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-xl pl-10 text-sm transition-all focus-visible:ring-ride-green/30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl pl-10 text-sm transition-all focus-visible:ring-ride-green/30"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+91 94470 54321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 rounded-xl pl-10 text-sm transition-all focus-visible:ring-ride-green/30"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl pl-10 pr-10 text-sm transition-all focus-visible:ring-ride-green/30"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-confirm" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 rounded-xl pl-10 pr-10 text-sm transition-all focus-visible:ring-ride-green/30"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="flex flex-col gap-2 pt-1">
                  <Label className="text-sm font-medium">I want to be a</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.value;
                      return (
                        <motion.button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-colors ${
                            isSelected
                              ? "border-ride-green bg-ride-green/5 shadow-glow-green dark:bg-ride-green/10"
                              : "border-border bg-background/50 hover:border-ride-green/30"
                          }`}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <motion.div
                            animate={{
                              scale: isSelected ? 1.1 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Icon
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                isSelected ? "text-ride-green" : "text-muted-foreground"
                              }`}
                              strokeWidth={isSelected ? 2.5 : 1.8}
                            />
                          </motion.div>
                          <span
                            className={`text-xs font-semibold sm:text-sm ${
                              isSelected ? "text-ride-green" : "text-muted-foreground"
                            }`}
                          >
                            {role.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground sm:text-xs">
                            {role.description}
                          </span>
                          {isSelected && (
                            <motion.div
                              layoutId="role-indicator"
                              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full gradient-primary"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <motion.svg
                                className="h-3 w-3 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <motion.path
                                  d="M5 13l4 4L19 7"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.3, delay: 0.1 }}
                                />
                              </motion.svg>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-1"
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-premium gradient-primary h-12 w-full rounded-2xl text-base font-semibold text-white shadow-lg"
                    size="lg"
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <motion.span
                            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          Creating...
                        </motion.span>
                      ) : (
                        <motion.span key="text">Create Account</motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Sign In link */}
            <motion.p
              variants={itemVariants}
              className="pb-4 text-center text-sm text-muted-foreground"
            >
              Already have an account?{" "}
              <motion.button
                onClick={() => setAuthView("login")}
                className="font-semibold text-ride-green transition-colors hover:text-ride-green-dark"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}