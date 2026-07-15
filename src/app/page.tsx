"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/store/app-store";

// Auth
import WelcomeScreen from "@/components/auth/welcome-screen";
import LoginScreen from "@/components/auth/login-screen";
import RegisterScreen from "@/components/auth/register-screen";
import OTPScreen from "@/components/auth/otp-screen";
import RoleSelectScreen from "@/components/auth/role-select-screen";

// Customer
import CustomerHome from "@/components/customer/customer-home";
import RideTracking from "@/components/customer/ride-tracking";
import RideComplete from "@/components/customer/ride-complete";
import RideHistory from "@/components/customer/ride-history";
import WalletView from "@/components/customer/wallet-view";
import ProfileView from "@/components/customer/profile-view";
import NotificationsView from "@/components/customer/notifications-view";

// Driver
import DriverHome from "@/components/driver/driver-home";
import OnTripView from "@/components/driver/on-trip-view";
import EarningsView from "@/components/driver/earnings-view";
import DriverHistory from "@/components/driver/driver-history";
import DriverProfile from "@/components/driver/driver-profile";
import DriverNotifications from "@/components/driver/driver-notifications";
import ScheduleView from "@/components/driver/schedule-view";

// Admin
import AdminLayout from "@/components/admin/admin-layout";
import AdminDashboard from "@/components/admin/admin-dashboard";
import ManageDrivers from "@/components/admin/manage-drivers";
import ManageCustomers from "@/components/admin/manage-customers";
import RidesList from "@/components/admin/rides-list";
import AnalyticsView from "@/components/admin/analytics-view";
import PromoManagement from "@/components/admin/promo-management";
import AdminSettings from "@/components/admin/admin-settings";

const pageVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
};

const pageTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

function CustomerViews() {
  const { customerView } = useAppStore();
  switch (customerView) {
    case "home": return <CustomerHome />;
    case "ride-tracking": return <RideTracking />;
    case "ride-complete": return <RideComplete />;
    case "history": return <RideHistory />;
    case "wallet": return <WalletView />;
    case "profile": return <ProfileView />;
    case "notifications": return <NotificationsView />;
    case "searching": return <CustomerHome />;
    case "promo": return <CustomerHome />;
    default: return <CustomerHome />;
  }
}

function DriverViews() {
  const { driverView } = useAppStore();
  switch (driverView) {
    case "home": return <DriverHome />;
    case "ride-request": return <DriverHome />;
    case "on-trip": return <OnTripView />;
    case "earnings": return <EarningsView />;
    case "history": return <DriverHistory />;
    case "profile": return <DriverProfile />;
    case "notifications": return <DriverNotifications />;
    case "schedule": return <ScheduleView />;
    default: return <DriverHome />;
  }
}

function AdminViewRenderer() {
  const { adminView } = useAppStore();
  switch (adminView) {
    case "dashboard": return <AdminDashboard />;
    case "drivers": return <ManageDrivers />;
    case "customers": return <ManageCustomers />;
    case "rides": return <RidesList />;
    case "analytics": return <AnalyticsView />;
    case "promos": return <PromoManagement />;
    case "settings": return <AdminSettings />;
    default: return <AdminDashboard />;
  }
}

function AdminPanel() {
  return <AdminLayout><AdminViewRenderer /></AdminLayout>;
}

export default function Home() {
  const { isAuthenticated, authView, userRole } = useAppStore();

  return (
    <main className="relative w-full min-h-dvh overflow-hidden bg-background">
      <Toaster position="top-center" richColors closeButton />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key={`auth-${authView}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="mx-auto min-h-dvh w-full max-w-md sm:max-w-lg"
          >
            {authView === "welcome" && <WelcomeScreen />}
            {authView === "login" && <LoginScreen />}
            {authView === "register" && <RegisterScreen />}
            {authView === "otp" && <OTPScreen />}
            {authView === "role-select" && <RoleSelectScreen />}
            {authView === "driver-verify" && <OTPScreen />}
          </motion.div>
        ) : userRole === "admin" ? (
          <motion.div
            key="admin-panel"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-dvh"
          >
            <AdminPanel />
          </motion.div>
        ) : (
          <motion.div
            key={`${userRole}-main`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-dvh"
          >
            {userRole === "customer" ? <CustomerViews /> : <DriverViews />}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}