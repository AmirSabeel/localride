import { create } from "zustand";
import { persist } from "zustand/middleware";

// ===== Types =====
export type UserRole = "customer" | "driver" | "admin";
export type AuthView = "welcome" | "login" | "register" | "otp" | "driver-verify" | "role-select";
export type CustomerView = "home" | "searching" | "ride-tracking" | "history" | "wallet" | "profile" | "notifications" | "ride-complete" | "promo";
export type DriverView = "home" | "ride-request" | "on-trip" | "earnings" | "history" | "profile" | "notifications" | "schedule";
export type AdminView = "dashboard" | "drivers" | "customers" | "rides" | "analytics" | "promos" | "settings";

export type VehicleType = "hatchback" | "sedan" | "suv" | "luxury" | "mini_van" | "auto" | "bike";
export type RideStatus = "searching" | "confirmed" | "driver_arriving" | "in_progress" | "completed" | "cancelled";
export type DriverStatus = "online" | "offline" | "busy" | "on_trip" | "break" | "invisible";
export type PaymentMethod = "cash" | "upi" | "card" | "wallet";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface NearbyDriver {
  id: string;
  name: string;
  avatar: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  rating: number;
  lat: number;
  lng: number;
  eta: number;
  fare: number;
}

export interface RideBooking {
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  fare: number;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

export interface ActiveRide {
  id: string;
  status: RideStatus;
  driverName: string;
  driverAvatar: string;
  driverPhone: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleColor: string;
  driverRating: number;
  pickup: Location;
  destination: Location;
  fare: number;
  distance: number;
  duration: number;
  driverLocation: { lat: number; lng: number };
  eta: number;
  paymentMethod: PaymentMethod;
}

export interface CompletedRide {
  id: string;
  from: string;
  to: string;
  fare: number;
  distance: number;
  duration: number;
  date: string;
  status: "completed" | "cancelled";
  rating: number;
  driverName: string;
  vehicleType: VehicleType;
  tip: number;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  date: string;
  icon: "ride" | "topup" | "refund" | "promo";
}

// ===== App Store =====
interface AppState {
  // Auth
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userId: string | null;
  userName: string | null;
  userAvatar: string | null;
  userPhone: string | null;
  authView: AuthView;
  otpPhone: string;

  // Views
  customerView: CustomerView;
  driverView: DriverView;
  adminView: AdminView;

  // Customer state
  currentLocation: Location;
  pickup: Location | null;
  destination: Location | null;
  selectedVehicleType: VehicleType;
  nearbyDrivers: NearbyDriver[];
  activeRide: ActiveRide | null;
  rideHistory: CompletedRide[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  notifications: any[];
  unreadCount: number;

  // Driver state
  driverStatus: DriverStatus;
  driverLocation: Location;
  driverCurrentCustomer: string | null; // name of the customer on the current accepted trip
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  todayTrips: number;
  weeklyTrips: number;
  driverRideHistory: any[];
  incomingRide: any | null;

  // UI
  isDarkMode: boolean;
  showSearchSheet: boolean;
  showVehicleSheet: boolean;
  showPaymentSheet: boolean;
  isSearchingDriver: boolean;

  // Actions
  setAuthView: (view: AuthView) => void;
  setOtpPhone: (phone: string) => void;
  login: (role: UserRole, id: string, name: string, avatar: string, phone: string) => void;
  logout: () => void;
  setCustomerView: (view: CustomerView) => void;
  setDriverView: (view: DriverView) => void;
  setAdminView: (view: AdminView) => void;
  setCurrentLocation: (loc: Location) => void;
  setDriverLocation: (loc: Location) => void;
  setPickup: (loc: Location) => void;
  setDestination: (loc: Location) => void;
  setSelectedVehicleType: (type: VehicleType) => void;
  setNearbyDrivers: (drivers: NearbyDriver[]) => void;
  setActiveRide: (ride: ActiveRide | null) => void;
  addCompletedRide: (ride: CompletedRide) => void;
  addWalletTransaction: (tx: WalletTransaction) => void;
  setUserName: (name: string) => void;
  setUserPhone: (phone: string) => void;
  setDriverStatus: (status: DriverStatus) => void;
  setDriverCurrentCustomer: (name: string | null) => void;
  setEarnings: (today: number, weekly: number, monthly: number) => void;
  addTripEarning: (fare: number) => void; // call after each completed trip
  setTripCounts: (today: number, weekly: number) => void;
  setWalletBalance: (balance: number) => void;
  addNotification: (notification: any) => void;
  markAllNotificationsRead: () => void;
  setIncomingRide: (ride: any | null) => void;
  toggleDarkMode: () => void;
  setShowSearchSheet: (show: boolean) => void;
  setShowVehicleSheet: (show: boolean) => void;
  setShowPaymentSheet: (show: boolean) => void;
  setIsSearchingDriver: (searching: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth defaults
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null,
      userAvatar: null,
      userPhone: null,
      authView: "welcome",
      otpPhone: "",

      // View defaults
      customerView: "home",
      driverView: "home",
      adminView: "dashboard",

      // Customer defaults
      currentLocation: { lat: 11.5194, lng: 75.6421, address: "Payyoli Town, Kozhikode, Kerala" },
      pickup: null,
      destination: null,
      selectedVehicleType: "sedan",
      nearbyDrivers: [],
      activeRide: null,
      rideHistory: [],
      walletBalance: 450.00,
      walletTransactions: [],
      notifications: [
        { id: "1", title: "Ride Completed", body: "Your trip to Vadakara has been completed.", type: "ride_completed", time: "2 min ago", read: false },
        { id: "2", title: "Payment Received", body: "₹156.00 has been credited to your wallet.", type: "payment", time: "15 min ago", read: false },
        { id: "3", title: "Promo Code", body: "Use FIRST50 for 50% off your next ride!", type: "promo", time: "1 hour ago", read: true },
        { id: "4", title: "New Driver Nearby", body: "A driver is now available in your area.", type: "system", time: "2 hours ago", read: true },
      ],
      unreadCount: 2,

      // Driver defaults
      driverStatus: "offline",
      driverLocation: { lat: 11.5064, lng: 75.7797, address: "Payyoli Town, Kozhikode, Kerala" },
      driverCurrentCustomer: null,
      todayEarnings: 1850,
      weeklyEarnings: 9200,
      monthlyEarnings: 36400,
      todayTrips: 6,
      weeklyTrips: 29,
      driverRideHistory: [],
      incomingRide: null,

      // UI defaults
      isDarkMode: false,
      showSearchSheet: false,
      showVehicleSheet: false,
      showPaymentSheet: false,
      isSearchingDriver: false,

      // Actions
      setAuthView: (view) => set({ authView: view }),
      setOtpPhone: (phone) => set({ otpPhone: phone }),
      login: (role, id, name, avatar, phone) => set({
        isAuthenticated: true,
        userRole: role,
        userId: id,
        userName: name,
        userAvatar: avatar,
        userPhone: phone,
        authView: "welcome",
      }),
      logout: () => set({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        userName: null,
        userAvatar: null,
        userPhone: null,
        authView: "welcome",
        customerView: "home",
        driverView: "home",
        adminView: "dashboard",
        activeRide: null,
        pickup: null,
        destination: null,
      }),
      setCustomerView: (view) => set({ customerView: view }),
      setDriverView: (view) => set({ driverView: view }),
      setAdminView: (view) => set({ adminView: view }),
      setCurrentLocation: (loc) => set({ currentLocation: loc }),
      setDriverLocation: (loc) => set({ driverLocation: loc }),
      setPickup: (loc) => set({ pickup: loc }),
      setDestination: (loc) => set({ destination: loc }),
      setSelectedVehicleType: (type) => set({ selectedVehicleType: type }),
      setNearbyDrivers: (drivers) => set({ nearbyDrivers: drivers }),
      setActiveRide: (ride) => set({ activeRide: ride }),
      addCompletedRide: (ride) => set((s) => ({ rideHistory: [ride, ...s.rideHistory] })),
      addWalletTransaction: (tx) => set((s) => ({ walletTransactions: [tx, ...s.walletTransactions] })),
      setUserName: (name) => set({ userName: name }),
      setUserPhone: (phone) => set({ userPhone: phone }),
      setDriverStatus: (status) => set({ driverStatus: status }),
      setDriverCurrentCustomer: (name) => set({ driverCurrentCustomer: name }),
      setEarnings: (today, weekly, monthly) => set({ todayEarnings: today, weeklyEarnings: weekly, monthlyEarnings: monthly }),
      addTripEarning: (fare) => set((s) => ({
        todayEarnings: s.todayEarnings + Math.round(fare * 0.8),
        weeklyEarnings: s.weeklyEarnings + Math.round(fare * 0.8),
        monthlyEarnings: s.monthlyEarnings + Math.round(fare * 0.8),
        todayTrips: s.todayTrips + 1,
        weeklyTrips: s.weeklyTrips + 1,
      })),
      setTripCounts: (today, weekly) => set({ todayTrips: today, weeklyTrips: weekly }),
      setWalletBalance: (balance) => set({ walletBalance: balance }),
      addNotification: (notification) => set((s) => ({
        notifications: [notification, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      })),
      markAllNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map((n: any) => ({ ...n, read: true })),
        unreadCount: 0,
      })),
      setIncomingRide: (ride) => set({ incomingRide: ride }),
      toggleDarkMode: () => set((s) => {
        const next = !s.isDarkMode;
        // Sync with next-themes by dispatching a custom DOM event
        if (typeof document !== 'undefined') {
          document.dispatchEvent(new CustomEvent('localride:toggle-theme', { detail: { dark: next } }));
        }
        return { isDarkMode: next };
      }),
      setShowSearchSheet: (show) => set({ showSearchSheet: show }),
      setShowVehicleSheet: (show) => set({ showVehicleSheet: show }),
      setShowPaymentSheet: (show) => set({ showPaymentSheet: show }),
      setIsSearchingDriver: (searching) => set({ isSearchingDriver: searching }),
    }),
    {
      name: "localride-store",
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        userId: state.userId,
        userName: state.userName,
        userAvatar: state.userAvatar,
        userPhone: state.userPhone,
        walletBalance: state.walletBalance,
        walletTransactions: state.walletTransactions,
        rideHistory: state.rideHistory,
        currentLocation: state.currentLocation,
        driverLocation: state.driverLocation,
      }),
    }
  )
);