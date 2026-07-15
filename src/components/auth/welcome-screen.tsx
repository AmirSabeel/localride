"use client";

import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

const floatingCars = [
  { top: "12%", left: "10%", size: 28, delay: 0, duration: 6, opacity: 0.08 },
  { top: "25%", right: "15%", size: 22, delay: 1.2, duration: 7, opacity: 0.06 },
  { bottom: "30%", left: "20%", size: 32, delay: 0.8, duration: 5.5, opacity: 0.07 },
  { bottom: "18%", right: "10%", size: 20, delay: 2, duration: 8, opacity: 0.05 },
  { top: "45%", left: "5%", size: 18, delay: 1.5, duration: 6.5, opacity: 0.06 },
  { top: "60%", right: "8%", size: 24, delay: 0.5, duration: 7.5, opacity: 0.07 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  },
};

export default function WelcomeScreen() {
  const setAuthView = useAppStore((s) => s.setAuthView);
  const setOtpPhone = useAppStore((s) => s.setOtpPhone);

  const handleGetStarted = () => {
    setOtpPhone("");
    setAuthView("otp");
  };

  const handleDriverClick = () => {
    setOtpPhone("");
    setAuthView("otp");
  };

  const handleSignIn = () => {
    setAuthView("login");
  };

  return (
    <motion.div
      className="relative min-h-dvh w-full overflow-hidden bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />
      <motion.div
        className="absolute inset-0 gradient-mesh opacity-60"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating car icons */}
      {floatingCars.map((car, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-ride-green"
          style={{ top: car.top, left: car.left, right: car.right, bottom: car.bottom }}
          animate={{
            y: [-8, 8, -8],
            x: [-4, 4, -4],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: car.duration,
            repeat: Infinity,
            delay: car.delay,
            ease: "easeInOut",
          }}
        >
          <Car size={car.size} style={{ opacity: car.opacity }} strokeWidth={1.5} />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col items-center gap-8">
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-5">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="gradient-primary rounded-3xl p-1 shadow-glow-green"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 200, 83, 0.15), 0 0 60px rgba(0, 200, 83, 0.08)",
                    "0 0 30px rgba(0, 200, 83, 0.25), 0 0 80px rgba(0, 200, 83, 0.12)",
                    "0 0 20px rgba(0, 200, 83, 0.15), 0 0 60px rgba(0, 200, 83, 0.08)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-[20px] bg-white/20 dark:bg-black/20 backdrop-blur-sm sm:h-28 sm:w-28">
                  <span className="text-5xl font-extrabold text-white drop-shadow-lg sm:text-6xl">
                    R
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl"
              variants={itemVariants}
            >
              LocalRide
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-center text-base font-medium text-muted-foreground sm:text-lg"
              variants={itemVariants}
            >
              Ride Anywhere in Your Local Area
            </motion.p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="flex w-full flex-col gap-3"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGetStarted}
                className="btn-premium gradient-primary h-13 w-full rounded-2xl text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] sm:h-14 sm:text-lg"
                size="lg"
              >
                Get Started
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleDriverClick}
                variant="outline"
                className="glass h-13 w-full rounded-2xl border-ride-green/30 text-base font-semibold text-foreground transition-all hover:border-ride-green/50 hover:bg-ride-green/5 sm:h-14 sm:text-lg"
                size="lg"
              >
                I&apos;m a Driver
              </Button>
            </motion.div>
          </motion.div>

          {/* Sign In link */}
          <motion.p
            className="text-sm text-muted-foreground sm:text-base"
            variants={itemVariants}
          >
            Already have an account?{" "}
            <motion.button
              onClick={handleSignIn}
              className="font-semibold text-ride-green transition-colors hover:text-ride-green-dark"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In
            </motion.button>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}