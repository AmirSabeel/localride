"use client";

import { motion } from "framer-motion";
import { MapPin, Car, BarChart3, ChevronRight, Sparkles } from "lucide-react";
import { useAppStore, type UserRole } from "@/store/app-store";
import { toast } from "sonner";

const roles: {
  value: UserRole;
  label: string;
  description: string;
  icon: typeof MapPin;
  gradient: string;
  iconColor: string;
  mockLogin: { role: UserRole; id: string; name: string; avatar: string; phone: string };
}[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Book rides and travel comfortably",
    icon: MapPin,
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    iconColor: "text-emerald-500",
    mockLogin: {
      role: "customer",
      id: "c1",
      name: "Arjun Krishnan",
      avatar: "",
      phone: "+91 94470 54321",
    },
  },
  {
    value: "driver",
    label: "Driver",
    description: "Earn money by driving",
    icon: Car,
    gradient: "from-teal-500/10 via-cyan-500/5 to-transparent",
    iconColor: "text-teal-500",
    mockLogin: {
      role: "driver",
      id: "d1",
      name: "Rahul Krishnan",
      avatar: "",
      phone: "+91 94470 12345",
    },
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage the platform",
    icon: BarChart3,
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    iconColor: "text-amber-500",
    mockLogin: {
      role: "admin",
      id: "a1",
      name: "Admin User",
      avatar: "",
      phone: "+91 11111 11111",
    },
  },
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
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
};

const cardHover = {
  scale: 1.03,
  y: -4,
  transition: { type: "spring", stiffness: 400, damping: 25 },
};

const cardTap = {
  scale: 0.98,
  transition: { type: "spring", stiffness: 500, damping: 30 },
};

export default function RoleSelectScreen() {
  const login = useAppStore((s) => s.login);
  const userId = useAppStore((s) => s.userId);
  const userName = useAppStore((s) => s.userName);
  const userPhone = useAppStore((s) => s.userPhone);
  const userAvatar = useAppStore((s) => s.userAvatar);

  const handleSelect = (roleData: (typeof roles)[number]["mockLogin"], label: string) => {
    if (userId && userName) {
      login(roleData.role, userId, userName, userAvatar || "", userPhone || "");
      toast.success(`Welcome, ${userName}! (${label})`);
    } else {
      login(roleData.role, roleData.id, roleData.name, roleData.avatar, roleData.phone);
      toast.success(`Welcome, ${roleData.name}! (${label}) (demo mode)`);
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
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <motion.div
        className="absolute inset-0 gradient-mesh opacity-30"
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 safe-top">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            {/* Heading */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-3 text-center"
            >
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow-green"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 200, 83, 0.15), 0 0 60px rgba(0, 200, 83, 0.08)",
                    "0 0 30px rgba(0, 200, 83, 0.25), 0 0 80px rgba(0, 200, 83, 0.12)",
                    "0 0 20px rgba(0, 200, 83, 0.15), 0 0 60px rgba(0, 200, 83, 0.08)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-7 w-7 text-white" strokeWidth={2} />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Choose Your <span className="gradient-text">Role</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  How would you like to use LocalRide?
                </p>
              </div>
            </motion.div>

            {/* Role Cards */}
            <div className="flex w-full flex-col gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.div
                    key={role.value}
                    variants={itemVariants}
                    whileHover={cardHover}
                    whileTap={cardTap}
                    onClick={() => handleSelect(role.mockLogin, role.label)}
                    className="group cursor-pointer"
                  >
                    <motion.div
                      className={`relative overflow-hidden rounded-3xl border border-border/60 glass-strong shadow-premium p-5 transition-shadow duration-300 sm:p-6`}
                      whileHover={{
                        boxShadow:
                          "0 0 0 1px rgba(0,200,83,0.1), 0 4px 8px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.1)",
                      }}
                    >
                      {/* Gradient overlay on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />

                      <div className="relative flex items-center gap-4">
                        {/* Icon */}
                        <motion.div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} border border-border/40 sm:h-16 sm:w-16`}
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                        >
                          <Icon
                            className={`h-7 w-7 ${role.iconColor} sm:h-8 sm:w-8`}
                            strokeWidth={1.8}
                          />
                        </motion.div>

                        {/* Text */}
                        <div className="flex flex-1 flex-col gap-0.5">
                          <h3 className="text-lg font-bold text-foreground sm:text-xl">
                            {role.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>

                        {/* Chevron */}
                        <motion.div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 dark:bg-foreground/10"
                          whileHover={{ x: 2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-ride-green" />
                        </motion.div>
                      </div>

                      {/* Bottom accent line */}
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 gradient-primary`}
                        initial={{ scaleX: 0, originX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ width: "100%" }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer hint */}
            <motion.p
              variants={itemVariants}
              className="pt-2 text-center text-xs text-muted-foreground"
            >
              You can always change this later in settings
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}