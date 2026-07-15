"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, MapPin, Clock, Wallet, User, Car, CarFront, Truck, Crown, Bus, Bike,
  Star, ChevronRight, Home, Briefcase, Plus, Navigation, X,
  CircleDot, ChevronDown, ArrowRightLeft, Locate, Map, Flag,
} from "lucide-react";
import { useAppStore, type VehicleType, type NearbyDriver } from "@/store/app-store";
import { useLocationTracking } from "@/hooks/use-location";
import { useRouteInfo } from "@/hooks/use-route-info";
import { useNominatimSearch } from "@/hooks/use-nominatim-search";
import { Input } from "@/components/ui/input";
import RideMap from "@/components/ui/ride-map";
import BottomNav from "@/components/customer/bottom-nav";

type SearchField = "pickup" | "destination";

const VEHICLE_TYPES: {
  type: VehicleType; label: string; icon: React.ElementType; baseFare: number; perKm: number;
  /** multiplier on OSRM driving duration (1.0 = same as car, <1 = faster, >1 = slower) */
  etaFactor: number;
  /** arrival wait time in minutes before pickup */
  arrivalMin: number;
}[] = [
  { type: "hatchback", label: "Hatchback", icon: Car,     baseFare: 80,  perKm: 12, etaFactor: 1.0, arrivalMin: 3 },
  { type: "sedan",     label: "Sedan",     icon: CarFront, baseFare: 100, perKm: 14, etaFactor: 1.0, arrivalMin: 4 },
  { type: "suv",       label: "SUV",       icon: Truck,    baseFare: 150, perKm: 18, etaFactor: 1.05, arrivalMin: 6 },
  { type: "luxury",    label: "Luxury",    icon: Crown,    baseFare: 250, perKm: 28, etaFactor: 1.1, arrivalMin: 8 },
  { type: "mini_van",  label: "Mini Van",  icon: Bus,      baseFare: 180, perKm: 20, etaFactor: 1.08, arrivalMin: 7 },
  { type: "auto",      label: "Auto",      icon: Bike,     baseFare: 50,  perKm: 10, etaFactor: 1.15, arrivalMin: 2 },
  { type: "bike",      label: "Bike",      icon: Bike,     baseFare: 40,  perKm: 8,  etaFactor: 0.85, arrivalMin: 1 },
];

const POPULAR_PLACES = [
  // ── Payyoli & immediate area ──
  "Payyoli Town Centre, Payyoli",
  "Payyoli Beach, Payyoli",
  "Payyoli Railway Station, Payyoli",
  "Payyoli Bus Stand, Payyoli",
  "Payyoli Govt. Hospital, Payyoli",
  "Payyoli Post Office, Payyoli",
  "Payyoli KSRTC Stand, Payyoli",
  "Muttil Junction, Payyoli",
  "Orkkatteri Square, Payyoli",
  "Chorode Bridge, Chorode",
  "Nanminda Junction, Payyoli",
  "Keezhariyur Temple, Keezhariyur",
  "Atholi Junction, Atholi",
  "Meladi Road, Payyoli",
  "Kadalundi Bird Sanctuary, Kadalundi",
  "Chamravattam Bridge, Tirur",
  "Payyoli Indoor Stadium, Payyoli",
  "Payyoli Police Station, Payyoli",
  "Payyoli Market, Payyoli",
  "EKM Junction, Payyoli",
  // ── Vadakara (Badagara) ──
  "Vadakara Bus Stand, Vadakara",
  "Vadakara Railway Station, Vadakara",
  "Vadakara New Bus Stand, Vadakara",
  "Vadakara Court Road, Vadakara",
  "Vadakara Govt. Hospital, Vadakara",
  "Vadakara Town Hall, Vadakara",
  "Mooriyad Junction, Vadakara",
  "Ayanchery Junction, Vadakara",
  "Thiruvallur, Vadakara",
  "Iruvanipuzha Bridge, Vadakara",
  "Nadapuram Junction, Nadapuram",
  "Perambra Junction, Perambra",
  "Vadakara Beach, Vadakara",
  "Vadakara Arts College, Vadakara",
  "SN College Vadakara, Vadakara",
  "Vadakara Private Bus Stand, Vadakara",
  "Puthoor Junction, Vadakara",
  "Maruthonkara Junction, Vadakara",
  // ── Thikkodi / Iringal ──
  "Thikkodi Beach, Thikkodi",
  "Thikkodi Market, Thikkodi",
  "Thikkodi Junction, Thikkodi",
  "Iringal Junction, Iringal",
  "Sargalaya Craft Village, Iringal",
  "Ayyankara Hills Viewpoint, Ayyankara",
  "Kakkodi Junction, Kakkodi",
  "Cheruvannur Junction, Cheruvannur",
  // ── Koyilandy (Quilandy) ──
  "Koyilandy Railway Station, Koyilandy",
  "Koyilandy Bus Stand, Koyilandy",
  "Koyilandy Beach, Koyilandy",
  "Koyilandy Town Centre, Koyilandy",
  "Koyilandy Govt. Hospital, Koyilandy",
  "Quilandy Fish Market, Koyilandy",
  "Moodadi Junction, Moodadi",
  "Cheruvannur Bridge, Koyilandy",
  "Koyilandy Police Station, Koyilandy",
  // ── Elathur / Feroke ──
  "Elathur Junction, Elathur",
  "Elathur Railway Station, Elathur",
  "Feroke Railway Station, Feroke",
  "Feroke Town, Feroke",
  "Ramanattukara Junction, Kozhikode",
  // ── Kozhikode City ──
  "Kozhikode Railway Station, Kozhikode",
  "Kozhikode New Bus Stand, Kozhikode",
  "KSRTC Bus Stand Kozhikode, Kozhikode",
  "Kozhikode Medical College, Kozhikode",
  "Kozhikode Beach, Kozhikode",
  "Mananchira Square, Kozhikode",
  "Calicut University, Thenhipalam",
  "Kozhikode Airport, Calicut",
  "SM Street (Mittai Theruvu), Kozhikode",
  "Palayam Market, Kozhikode",
  "Eranhipalam Junction, Kozhikode",
  "Mavoor Road, Kozhikode",
  "Westhill Junction, Kozhikode",
  "Chevayur Junction, Kozhikode",
  "Pantheerankavu Junction, Kozhikode",
  "Kunnamangalam Junction, Kunnamangalam",
  "Malabar Mall, Kozhikode",
  "Focus Mall, Kozhikode",
  "Kozhikode District Hospital, Kozhikode",
  "MIMS Hospital, Kozhikode",
  "Baby Memorial Hospital, Kozhikode",
  "Aster MIMS, Kozhikode",
  "Kozhikode Corporation Office, Kozhikode",
  "Indira Gandhi Road, Kozhikode",
  "GH Road, Kozhikode",
  "Puthiyara Junction, Kozhikode",
  "Nadakkavu Junction, Kozhikode",
  "Govindapuram, Kozhikode",
  "Meenchanda Junction, Kozhikode",
  // ── Beypore / Kappad ──
  "Beypore Port, Beypore",
  "Beypore Beach, Beypore",
  "Kappad Beach, Kappad",
  "Chaliyam Junction, Chaliyam",
  // ── Mukkam / Kunnamangalam ──
  "Mukkam Junction, Mukkam",
  "Mukkam Town, Mukkam",
  "Balussery Junction, Balussery",
  // ── Thamarassery ──
  "Thamarassery Town, Thamarassery",
  "Thamarassery Bus Stand, Thamarassery",
  "Thamarassery Churam, Thamarassery",
];

const LANDMARKS: {
  id: string; label: string; address: string; lat: number; lng: number;
}[] = [
  // Payyoli area
  { id: "lm1",  label: "Payyoli Centre",      address: "Payyoli Town Centre, Kozhikode, Kerala",           lat: 11.5194, lng: 75.6421 },
  { id: "lm2",  label: "Payyoli Beach",        address: "Payyoli Beach, Payyoli, Kerala",                   lat: 11.5150, lng: 75.6150 },
  { id: "lm3",  label: "Payyoli Rly Stn",      address: "Payyoli Railway Station, Payyoli, Kerala",         lat: 11.5230, lng: 75.6490 },
  { id: "lm4",  label: "Muttil Jn",            address: "Muttil Junction, Payyoli, Kerala",                 lat: 11.5260, lng: 75.6580 },
  { id: "lm5",  label: "Nanminda Jn",          address: "Nanminda Junction, Payyoli, Kerala",               lat: 11.5320, lng: 75.6700 },
  { id: "lm6",  label: "Chorode",              address: "Chorode Bridge, Chorode, Kerala",                  lat: 11.5100, lng: 75.6320 },
  { id: "lm7",  label: "Keezhariyur",          address: "Keezhariyur Temple Road, Kerala",                  lat: 11.5380, lng: 75.6200 },
  { id: "lm8",  label: "Atholi Jn",            address: "Atholi Junction, Atholi, Kerala",                  lat: 11.5050, lng: 75.6550 },
  // Vadakara
  { id: "lm9",  label: "Vadakara Bus Stand",   address: "Vadakara Bus Stand, Vadakara, Kerala",             lat: 11.6050, lng: 75.5900 },
  { id: "lm10", label: "Vadakara Rly Stn",     address: "Vadakara Railway Station, Vadakara, Kerala",       lat: 11.6080, lng: 75.5940 },
  { id: "lm11", label: "Nadapuram",            address: "Nadapuram Junction, Nadapuram, Kerala",            lat: 11.6320, lng: 75.6390 },
  { id: "lm12", label: "Perambra",             address: "Perambra Junction, Perambra, Kerala",              lat: 11.5910, lng: 75.6570 },
  { id: "lm13", label: "Mooriyad Jn",          address: "Mooriyad Junction, Vadakara, Kerala",              lat: 11.6100, lng: 75.6100 },
  // Thikkodi / Iringal
  { id: "lm14", label: "Thikkodi Beach",       address: "Thikkodi Beach, Kozhikode, Kerala",                lat: 11.5620, lng: 75.6100 },
  { id: "lm15", label: "Iringal / Sargalaya",  address: "Sargalaya Craft Village, Iringal, Kerala",         lat: 11.5810, lng: 75.6020 },
  { id: "lm16", label: "Ayyankara Hills",      address: "Ayyankara Hills Viewpoint, Kerala",                lat: 11.5750, lng: 75.6450 },
  { id: "lm17", label: "Kakkodi Jn",           address: "Kakkodi Junction, Kakkodi, Kerala",                lat: 11.5500, lng: 75.6800 },
  // Koyilandy
  { id: "lm18", label: "Koyilandy Town",       address: "Koyilandy Bus Stand, Koyilandy, Kerala",           lat: 11.4368, lng: 75.7050 },
  { id: "lm19", label: "Koyilandy Beach",      address: "Koyilandy Beach, Koyilandy, Kerala",               lat: 11.4280, lng: 75.6780 },
  { id: "lm20", label: "Moodadi Jn",           address: "Moodadi Junction, Moodadi, Kerala",                lat: 11.4500, lng: 75.7200 },
  { id: "lm21", label: "Elathur Jn",           address: "Elathur Junction, Elathur, Kerala",                lat: 11.3610, lng: 75.7510 },
  // Kozhikode City
  { id: "lm22", label: "Kozhikode Rly Stn",    address: "Kozhikode Railway Station, Kozhikode, Kerala",     lat: 11.2588, lng: 75.7804 },
  { id: "lm23", label: "Kozhikode Bus Stand",  address: "Kozhikode New Bus Stand, Kozhikode, Kerala",       lat: 11.2620, lng: 75.7820 },
  { id: "lm24", label: "Mananchira Sq",        address: "Mananchira Square, Kozhikode, Kerala",             lat: 11.2572, lng: 75.7800 },
  { id: "lm25", label: "Kozhikode Beach",      address: "Kozhikode Beach, Kozhikode, Kerala",               lat: 11.2630, lng: 75.7710 },
  { id: "lm26", label: "Medical College",      address: "Kozhikode Medical College, Kozhikode, Kerala",     lat: 11.2790, lng: 75.8010 },
  { id: "lm27", label: "Calicut Airport",      address: "Kozhikode Airport, Calicut, Kerala",               lat: 11.1367, lng: 75.9530 },
  { id: "lm28", label: "Calicut University",   address: "Calicut University, Thenhipalam, Kerala",          lat: 11.1790, lng: 75.9470 },
  { id: "lm29", label: "SM Street",            address: "SM Street (Mittai Theruvu), Kozhikode, Kerala",    lat: 11.2490, lng: 75.7760 },
  { id: "lm30", label: "Palayam Market",       address: "Palayam Market, Kozhikode, Kerala",                lat: 11.2530, lng: 75.7790 },
  { id: "lm31", label: "Westhill Jn",          address: "Westhill Junction, Kozhikode, Kerala",             lat: 11.2730, lng: 75.7680 },
  { id: "lm32", label: "Beypore Port",         address: "Beypore Port, Beypore, Kerala",                    lat: 11.1720, lng: 75.8120 },
  { id: "lm33", label: "Kappad Beach",         address: "Kappad Beach, Kappad, Kerala",                     lat: 11.3580, lng: 75.7300 },
  { id: "lm34", label: "Kunnamangalam",        address: "Kunnamangalam Junction, Kunnamangalam, Kerala",    lat: 11.2950, lng: 75.8380 },
  { id: "lm35", label: "Feroke",               address: "Feroke Railway Station, Feroke, Kerala",           lat: 11.1980, lng: 75.8180 },
  { id: "lm36", label: "Ramanattukara",        address: "Ramanattukara Junction, Kozhikode, Kerala",        lat: 11.2240, lng: 75.8250 },
];

const KOZHIKODE_AREA_CENTER = { lat: 11.44, lng: 75.70 };



export default function CustomerHome() {
  const {
    customerView, setCustomerView, currentLocation, setCurrentLocation, pickup, destination,
    setPickup, setDestination, selectedVehicleType, setSelectedVehicleType,
    nearbyDrivers, setNearbyDrivers, activeRide, setActiveRide, walletBalance,
    showSearchSheet, setShowSearchSheet, showVehicleSheet, setShowVehicleSheet,
    isSearchingDriver, setIsSearchingDriver, userName, userPhone, unreadCount,
    setIncomingRide,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<NearbyDriver | null>(null);
  const [activeSearchField, setActiveSearchField] = useState<SearchField>("destination");

  const { results: nominatimResults, isLoading: nominatimLoading } = useNominatimSearch(searchQuery);

  // Map Selection States
  const [mapSelectionMode, setMapSelectionMode] = useState<"none" | "pickup" | "destination">("none");
  const [tempMapCoords, setTempMapCoords] = useState<{ lat: number; lng: number }>({ lat: 11.5064, lng: 75.7797 });
  const [tempMapAddress, setTempMapAddress] = useState<string>("");

  const PICKUP_LOCATIONS = useMemo(() => [
    currentLocation.address,
    // Payyoli area
    "Payyoli Town Centre, Payyoli",
    "Payyoli Bus Stand, Payyoli",
    "Payyoli Railway Station, Payyoli",
    "Payyoli Beach, Payyoli",
    "Payyoli Govt. Hospital, Payyoli",
    "Muttil Junction, Payyoli",
    "Orkkatteri Square, Payyoli",
    "Chorode Bridge, Chorode",
    "Nanminda Junction, Payyoli",
    "Keezhariyur Temple, Keezhariyur",
    "Atholi Junction, Atholi",
    "Iringal Junction, Iringal",
    "Thikkodi Beach, Thikkodi",
    "Thikkodi Junction, Thikkodi",
    "Ayyankara Hills Viewpoint, Ayyankara",
    "Kakkodi Junction, Kakkodi",
    "Sargalaya Craft Village, Iringal",
    // Vadakara
    "Vadakara Bus Stand, Vadakara",
    "Vadakara Railway Station, Vadakara",
    "Vadakara Govt. Hospital, Vadakara",
    "Nadapuram Junction, Nadapuram",
    "Perambra Junction, Perambra",
    "Mooriyad Junction, Vadakara",
    // Koyilandy
    "Koyilandy Bus Stand, Koyilandy",
    "Koyilandy Beach, Koyilandy",
    "Koyilandy Railway Station, Koyilandy",
    "Moodadi Junction, Moodadi",
    // Elathur / Feroke
    "Elathur Junction, Elathur",
    "Elathur Railway Station, Elathur",
    "Feroke Railway Station, Feroke",
    "Ramanattukara Junction, Kozhikode",
    // Kozhikode City
    "Kozhikode Railway Station, Kozhikode",
    "Kozhikode New Bus Stand, Kozhikode",
    "Mananchira Square, Kozhikode",
    "Kozhikode Beach, Kozhikode",
    "Kozhikode Medical College, Kozhikode",
    "Kozhikode Airport, Calicut",
    "Calicut University, Thenhipalam",
    "SM Street (Mittai Theruvu), Kozhikode",
    "Palayam Market, Kozhikode",
    "Westhill Junction, Kozhikode",
    "Beypore Port, Beypore",
    "Kappad Beach, Kappad",
    "Mukkam Junction, Mukkam",
    "Kunnamangalam Junction, Kunnamangalam",
    "Malabar Mall, Kozhikode",
  ], [currentLocation.address]);

  useEffect(() => {
    fetch("/api/rides?type=nearby-drivers")
      .then((r) => r.json())
      .then((data) => setNearbyDrivers(data))
      .catch(() => {});
  }, [setNearbyDrivers]);

  // Live GPS tracking via the shared hook (watch mode + reverse geocoding)
  const { permissionState } = useLocationTracking({
    onUpdate: (loc) => setCurrentLocation(loc),
    onError: (msg) => toast.error(msg, { id: "location-error" }),
    watch: true,
  });

  const [isLocating, setIsLocating] = useState(false);

  // One-shot locate button — gets GPS, updates currentLocation, centers map
  const locateCustomer = useCallback((onResolved?: (lat: number, lng: number) => void) => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    if (permissionState === "denied") {
      toast.error("Location permission denied — enable it in browser settings.", { id: "loc-err" });
      return;
    }

    setIsLocating(true);
    toast.loading("Getting your location…", { id: "locating" });

    // Hard safety timeout — always resets spinner even if GPS callback never fires
    const safetyTimeout = setTimeout(() => {
      setIsLocating(false);
      toast.error("Location timed out. Try again or check GPS.", { id: "locating" });
    }, 9_000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(safetyTimeout);
        const { latitude: lat, longitude: lng } = pos.coords;
        setCurrentLocation({ lat, lng, address: "Locating…" });
        onResolved?.(lat, lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`,
            { headers: { "Accept-Language": "en" }, signal: AbortSignal.timeout(5000) }
          );
          const data = await res.json() as { address?: Record<string, string>; display_name?: string };
          const a = data.address ?? {};
          const addr = [
            a.road ?? a.pedestrian ?? a.footway,
            a.suburb ?? a.neighbourhood ?? a.village ?? a.town,
            a.city ?? a.town ?? a.county,
          ].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 2).join(", ") || "Current location";
          setCurrentLocation({ lat, lng, address: addr });
          toast.success("Location found", { id: "locating" });
        } catch {
          setCurrentLocation({ lat, lng, address: "Current location" });
          toast.success("Location updated", { id: "locating" });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        clearTimeout(safetyTimeout);
        setIsLocating(false);
        const msgs: Record<number, string> = {
          1: "Location permission denied. Enable in browser settings.",
          2: "GPS unavailable. Check signal.",
          3: "Location timed out. Move to open area.",
        };
        toast.error(msgs[err.code] ?? "Unable to get location.", { id: "locating" });
      },
      { enableHighAccuracy: true, timeout: 8_000, maximumAge: 0 },
    );
  }, [permissionState, setCurrentLocation]);

  // Real road distance + duration via OSRM (haversine fallback while loading)
  const routeInfo = useRouteInfo(
    pickup ?? currentLocation,
    destination ?? null,
  );
  const estimatedDistance = routeInfo.distance;
  const estimatedDuration = routeInfo.duration;

  const estimatedFare = useMemo(() => {
    if (!pickup || !destination || !estimatedDistance) return 0;
    const vt = VEHICLE_TYPES.find((v) => v.type === selectedVehicleType);
    return vt ? Math.round(vt.baseFare + vt.perKm * estimatedDistance) : 0;
  }, [pickup, destination, selectedVehicleType, estimatedDistance]);

  const top3Drivers = useMemo(() => nearbyDrivers.slice(0, 3), [nearbyDrivers]);

  const handleSelectDestination = (place: string, lat?: number, lng?: number) => {
    // Use provided coords, then try landmarks, then fallback to random offset
    const lm = !lat ? LANDMARKS.find((l) => l.address.includes(place) || l.label.includes(place) || place.includes(l.label)) : null;
    setDestination({
      lat: lat ?? (lm ? lm.lat : 11.5064 + (Math.random() - 0.5) * 0.06),
      lng: lng ?? (lm ? lm.lng : 75.6797 + (Math.random() - 0.5) * 0.06),
      address: place,
    });
    if (!pickup) {
      setPickup(currentLocation);
    }
    setShowSearchSheet(false);
    setShowVehicleSheet(true);
  };

  const handleSelectPickup = (place: string, lat?: number, lng?: number) => {
    const lm = !lat ? LANDMARKS.find((l) => l.address.includes(place) || l.label.includes(place) || place.includes(l.label)) : null;
    setPickup({
      lat: lat ?? (lm ? lm.lat : currentLocation.lat + (Math.random() - 0.5) * 0.03),
      lng: lng ?? (lm ? lm.lng : currentLocation.lng + (Math.random() - 0.5) * 0.03),
      address: place,
    });
    setShowSearchSheet(false);
  };

  const openSearchSheet = (field: SearchField) => {
    setActiveSearchField(field);
    setSearchQuery("");
    setShowSearchSheet(true);
  };

  const handleBookRide = async () => {
    if (!pickup || !destination) {
      toast.error("Please select a destination");
      return;
    }
    setIsSearchingDriver(true);

    // 1. Persist the ride in DB
    try {
      await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: userId || "demo-customer",
          pickupLocation: pickup.address,
          dropLocation: destination.address,
          pickupCoords: { lat: pickup.lat, lng: pickup.lng },
          dropCoords: { lat: destination.lat, lng: destination.lng },
          fare: estimatedFare || 85,
          distance: estimatedDistance,
          duration: estimatedDuration || Math.max(2, Math.round(estimatedDistance * 2.2)),
          vehicleType: selectedVehicleType,
          paymentMethod: "wallet",
        }),
      });
    } catch {
      // Non-blocking — ride still works in demo mode
    }

    // 2. Mock driver matching (real-time matching via socket.io will come later)
    setTimeout(() => {
      const driver = selectedDriver || nearbyDrivers[0] || {
        id: "d-mock", name: "Rahul K.", avatar: "", vehicleType: "sedan" as VehicleType,
        vehiclePlate: "KL-14-A-1234", rating: 4.8, lat: 11.5100, lng: 75.7830, eta: 3, fare: 85,
      };
      const mockRide = {
        id: "ride-" + Date.now(),
        status: "confirmed" as const,
        driverName: driver.name,
        driverAvatar: driver.avatar,
        driverPhone: "+91 98765 43210",
        vehicleType: selectedVehicleType,
        vehiclePlate: driver.vehiclePlate,
        vehicleColor: "White",
        driverRating: driver.rating,
        pickup,
        destination,
        fare: estimatedFare || driver.fare,
        distance: estimatedDistance,
        duration: estimatedDuration || Math.max(2, Math.round(estimatedDistance * 2.2)),
        driverLocation: { lat: driver.lat, lng: driver.lng },
        eta: driver.eta,
        paymentMethod: "wallet" as const,
      };
      setActiveRide(mockRide);
      setIsSearchingDriver(false);
      setShowVehicleSheet(false);
      setCustomerView("ride-tracking");
      toast.success("Driver found! 🎉", { description: `${driver.name} is on the way` });

      // Notify driver side with the real booked ride data
      setIncomingRide({
        id: mockRide.id,
        customer: userName || "Rider",
        pickup: { address: pickup!.address, lat: pickup!.lat, lng: pickup!.lng },
        destination: { address: destination!.address, lat: destination!.lat, lng: destination!.lng },
        fare: mockRide.fare,
        distance: mockRide.distance,
        duration: mockRide.duration,
      });
    }, 3000);
  };

  // Build map markers
  const mapMarkers = useMemo(() => {
    const ms: import("@/components/ui/ride-map").RideMapMarker[] = [];

    // Always show current location as a blue "car" dot
    ms.push({ lat: currentLocation.lat, lng: currentLocation.lng, type: "car" });

    // Nearby drivers (only when not in selection mode)
    if (mapSelectionMode === "none") {
      nearbyDrivers.forEach((d) => ms.push({ lat: d.lat, lng: d.lng, type: "driver", label: `₹${d.fare}` }));
    }

    // Landmark pins (only when no route set)
    if (!destination) {
      LANDMARKS.forEach((lm) => ms.push({ lat: lm.lat, lng: lm.lng, type: "pin", label: lm.label }));
    }

    // Pickup marker (green dot)
    if (pickup) {
      ms.push({ lat: pickup.lat, lng: pickup.lng, type: "pickup" });
    }

    // Destination marker (black square pin)
    if (destination) {
      ms.push({ lat: destination.lat, lng: destination.lng, type: "destination" });
    }

    return ms;
  }, [currentLocation, nearbyDrivers, pickup, destination, mapSelectionMode]);

  const mapRoute = useMemo(() =>
    pickup && destination
      ? { from: { lat: pickup.lat, lng: pickup.lng }, to: { lat: destination.lat, lng: destination.lng }, progress: 0 }
      : undefined,
    [pickup, destination]
  );

  // Center: route midpoint when route set, otherwise current GPS location
  const mapCenter = useMemo(() => {
    if (pickup && destination) {
      return {
        lat: (pickup.lat + destination.lat) / 2,
        lng: (pickup.lng + destination.lng) / 2,
      };
    }
    if (pickup) return { lat: pickup.lat, lng: pickup.lng };
    return { lat: currentLocation.lat, lng: currentLocation.lng };
  }, [currentLocation.lat, currentLocation.lng, pickup, destination]);

  const handleLeafletClick = useCallback((lat: number, lng: number) => {
    if (mapSelectionMode === "none") return;
    setTempMapCoords({ lat, lng });
    // Optimistic address from nearest landmark while reverse-geocode loads
    let nearest = LANDMARKS[0];
    let minDist = Infinity;
    LANDMARKS.forEach((lm) => {
      const d = Math.sqrt((lat - lm.lat) ** 2 + (lng - lm.lng) ** 2);
      if (d < minDist) { minDist = d; nearest = lm; }
    });
    const optimistic = minDist < 0.05 ? `Near ${nearest.label}` : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setTempMapAddress(optimistic);

    // Real reverse geocode in background
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((d) => { if (d?.display_name) setTempMapAddress(d.display_name); })
      .catch(() => {});
  }, [mapSelectionMode]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* Real Leaflet Map */}
      <RideMap
        center={mapCenter}
        zoom={pickup && destination ? 12 : 15}
        markers={mapMarkers}
        route={mapRoute}
        onClick={handleLeafletClick}
        interactive={true}
        className="absolute inset-0 z-0 h-full w-full"
      />

      <button
        type="button"
        onClick={() => {
          if (isLocating) return;
          locateCustomer((lat, lng) => {
            if (!pickup) setPickup({ lat, lng, address: "Current location" });
          });
        }}
        disabled={isLocating}
        className={`absolute right-4 top-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-2xl shadow-premium ring-1 transition-all active:scale-95 ${
          isLocating
            ? "bg-background opacity-80 cursor-not-allowed ring-foreground/10"
            : permissionState === "denied"
            ? "bg-destructive/10 ring-destructive/30 text-destructive hover:bg-destructive/20"
            : "bg-background ring-foreground/10 text-foreground hover:bg-foreground/5 hover:scale-105"
        }`}
        aria-label="Center on current location"
        title={permissionState === "denied" ? "Location permission denied" : "Use my location"}
      >
        {isLocating ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ride-green border-t-transparent" />
        ) : (
          <Locate className="h-5 w-5" />
        )}
      </button>

      {/* Bouncing center pin overlay for map selection mode */}
      {mapSelectionMode !== "none" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none flex flex-col items-center">
          <motion.div
            className="glass-strong shadow-float mb-2 rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold text-foreground border border-foreground/10 max-w-[200px] truncate"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={tempMapAddress}
          >
            {tempMapAddress || "Tap map to drop pin"}
          </motion.div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <MapPin className={`h-10 w-10 drop-shadow-lg ${mapSelectionMode === "pickup" ? "text-foreground" : "text-ride-red"}`} />
          </motion.div>
          <div className="h-1 w-4 rounded-full bg-foreground/20 blur-[1px] mt-0.5" />
        </div>
      )}

      {/* Current Location Address Card */}
      {mapSelectionMode === "none" && (
        <motion.div
          className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="glass-strong shadow-premium flex items-center gap-2 rounded-2xl px-4 py-2.5">
            <div className="relative h-2.5 w-2.5">
              <div className="absolute inset-0 rounded-full bg-ride-green" />
              <div className="absolute inset-0 rounded-full bg-ride-green animate-ping opacity-40" />
            </div>
            <span className="max-w-[220px] truncate text-sm font-medium text-foreground">
              {pickup ? pickup.address : currentLocation.address}
            </span>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {mapSelectionMode !== "none" && (
          <motion.div
            className="absolute bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="glass-strong shadow-premium rounded-2xl p-4 border border-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ride-green/10 text-ride-green">
                  <Map className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground capitalize">
                  Set your {mapSelectionMode}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {tempMapAddress || "Tap anywhere on the map to set coordinates"}
              </p>

              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-semibold py-3 text-foreground transition-colors"
                  onClick={() => setMapSelectionMode("none")}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 btn-premium gradient-primary text-xs font-bold py-3 text-white rounded-xl shadow-glow-green-strong"
                  onClick={() => {
                    const locationObj = {
                      lat: tempMapCoords.lat,
                      lng: tempMapCoords.lng,
                      address: tempMapAddress || `${mapSelectionMode === "pickup" ? "Pickup" : "Destination"} Pin Location`,
                    };
                    if (mapSelectionMode === "pickup") {
                      setPickup(locationObj);
                      toast.success("Pickup set to pin");
                    } else {
                      setDestination(locationObj);
                      if (!pickup) {
                        setPickup(currentLocation);
                      }
                      toast.success("Destination set to pin");
                      setShowVehicleSheet(true);
                    }
                    setMapSelectionMode("none");
                  }}
                  disabled={!tempMapAddress}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-Field Search Card (overlaid on map bottom) - hidden in mapSelectionMode */}
      {mapSelectionMode === "none" && !showVehicleSheet && (
        <motion.div
          className="absolute top-[53%] left-0 right-0 z-30 px-4"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="glass-strong shadow-premium rounded-2xl overflow-hidden">
            {/* Route Header Bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan your ride
              </span>
              {/* Swap pickup & destination */}
              <motion.button
                className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
                whileTap={{ scale: 0.85, rotate: 180 }}
                onClick={() => {
                  if (pickup && destination) {
                    const tmp = pickup;
                    setPickup(destination);
                    setDestination(tmp);
                    toast.success("Route swapped");
                  }
                }}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Fields */}
            <div className="relative px-3 pb-3">
              {/* Dotted line connecting the two dots */}
              <div className="absolute left-[23px] top-[46px] bottom-[46px] w-[2px]">
                <div className="h-full w-full" style={{
                  backgroundImage: "repeating-linear-gradient(to bottom, var(--color-ride-green) 0px, var(--color-ride-green) 3px, transparent 3px, transparent 7px)",
                  opacity: 0.4,
                }} />
              </div>

              {/* Pickup Field */}
              <div
                className="relative flex items-center gap-3 rounded-xl px-2 py-2.5 cursor-pointer hover:bg-foreground/[0.03] transition-colors"
                onClick={() => openSearchSheet("pickup")}
              >
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
                  <CircleDot className="h-4 w-4 text-ride-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                    Your Location
                  </p>
                  <p className={`text-sm truncate ${pickup ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {pickup ? pickup.address : currentLocation.address}
                  </p>
                </div>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/5">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Destination Field */}
              <div
                className="relative flex items-center gap-3 rounded-xl px-2 py-2.5 cursor-pointer hover:bg-foreground/[0.03] transition-colors"
                onClick={() => openSearchSheet("destination")}
              >
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
                  <MapPin className="h-4 w-4 text-ride-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                    Choose Destination
                  </p>
                  <p className={`text-sm truncate ${destination ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {destination ? destination.address : "Where are you going?"}
                  </p>
                </div>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/5">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            {pickup && destination && (
              <motion.div
                className="border-t border-foreground/5 px-4 py-2.5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <button
                  className="btn-premium gradient-primary w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-glow-green-strong flex items-center justify-center gap-2"
                  onClick={() => setShowVehicleSheet(true)}
                >
                  <Navigation className="h-4 w-4" />
                  Choose Vehicle — {routeInfo.loading ? "…" : `${estimatedDistance} km · ${estimatedDuration} min`}
                </button>
              </motion.div>
            )}

          {/* Quick Access Row (visible when no destination is set) */}
          {!destination && (
            <motion.div
              className="border-t border-foreground/5 px-3 py-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">Quick destinations</p>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {[
                  { label: "Payyoli", place: "Payyoli Town Centre, Payyoli" },
                  { label: "Vadakara", place: "Vadakara Bus Stand, Vadakara" },
                  { label: "Kozhikode", place: "Kozhikode Railway Station, Kozhikode" },
                  { label: "Koyilandy", place: "Koyilandy Bus Stand, Koyilandy" },
                  { label: "Thikkodi", place: "Thikkodi Beach, Thikkodi" },
                  { label: "Airport", place: "Kozhikode Airport, Calicut" },
                  { label: "Nadapuram", place: "Nadapuram Junction, Nadapuram" },
                  { label: "Perambra", place: "Perambra Junction, Perambra" },
                  { label: "Beach", place: "Payyoli Beach, Payyoli" },
                ].map(({ label, place }) => (
                  <motion.button
                    key={label}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/[0.1] transition-colors"
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleSelectDestination(place)}
                  >
                    <MapPin className="h-2.5 w-2.5 text-ride-green" />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      )}

      {/* Bottom Sheet: Vehicle Selection */}
      <AnimatePresence>
        {showVehicleSheet && pickup && destination && (
          <motion.div
            className="absolute bottom-16 left-0 right-0 z-40 px-4"
            initial={{ y: 500 }}
            animate={{ y: 0 }}
            exit={{ y: 500 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="glass-strong shadow-float max-h-[42vh] overflow-y-auto scrollbar-thin rounded-t-3xl rounded-b-2xl p-4">
              {/* Handle */}
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/15" />

              {/* Route Info */}
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-ride-green" />
                <span className="truncate max-w-[140px]">{pickup.address}</span>
                <Navigation className="h-3 w-3" />
                <span className="truncate max-w-[140px]">{destination.address}</span>
              </div>

              {/* Vehicle Types */}
              <div className="mb-4">
                <h3 className="mb-2.5 text-sm font-semibold text-foreground">Choose Vehicle</h3>
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                  {VEHICLE_TYPES.map((vt) => {
                    const Icon = vt.icon;
                    const isSelected = selectedVehicleType === vt.type;
                    const fare = Math.round(vt.baseFare + vt.perKm * estimatedDistance);
                    const tripMin = estimatedDuration > 0
                      ? Math.max(1, Math.round(estimatedDuration * vt.etaFactor))
                      : null;
                    const etaLabel = tripMin
                      ? `${tripMin} min`
                      : `~${vt.arrivalMin} min`;
                    return (
                      <motion.button
                        key={vt.type}
                        className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl p-3 transition-premium min-w-[90px] ${
                          isSelected
                            ? "bg-ride-green/10 border-2 border-ride-green shadow-glow-green"
                            : "bg-foreground/5 border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedVehicleType(vt.type)}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? "text-ride-green" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-semibold ${isSelected ? "text-ride-green" : "text-foreground"}`}>
                          {vt.label}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {routeInfo.loading ? "…" : `₹${fare}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {routeInfo.loading ? "…" : etaLabel}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Nearby Drivers */}
              <div className="mb-4">
                <h3 className="mb-2.5 text-sm font-semibold text-foreground">Nearby Drivers</h3>
                <div className="flex flex-col gap-2">
                {top3Drivers.map((driver) => {
                    const driverFare = estimatedDistance
                      ? Math.round((VEHICLE_TYPES.find((v) => v.type === selectedVehicleType)?.baseFare ?? 80) +
                          (VEHICLE_TYPES.find((v) => v.type === selectedVehicleType)?.perKm ?? 12) * estimatedDistance)
                      : driver.fare;
                    return (
                    <motion.div
                      key={driver.id}
                      className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition-premium ${
                        selectedDriver?.id === driver.id
                          ? "bg-ride-green/10 border border-ride-green/30"
                          : "bg-foreground/[0.03] border border-transparent hover:bg-foreground/[0.06]"
                      }`}
                      onClick={() => setSelectedDriver(driver)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ride-green/10 text-ride-green text-sm font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold truncate">{driver.name}</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-ride-amber text-ride-amber" />
                            <span className="text-xs font-medium">{driver.rating}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{driver.vehiclePlate}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {routeInfo.loading ? "…" : `₹${driverFare}`}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{driver.eta} min away</p>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Row */}
              <div className="mb-3 flex items-center justify-between rounded-xl bg-foreground/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-ride-green" />
                  <span className="text-sm font-medium">LocalRide Wallet</span>
                  <span className="text-xs text-muted-foreground">₹{walletBalance.toFixed(0)}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Promo Code */}
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="h-10 rounded-xl bg-foreground/[0.03] border-foreground/10 text-sm"
                />
                {promoCode && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-10 items-center justify-center rounded-xl bg-ride-green/10 px-3 text-xs font-semibold text-ride-green"
                    onClick={() => { setPromoCode(""); toast.success("Promo code applied!"); }}
                  >
                    Apply
                  </motion.button>
                )}
              </div>

              {/* Book Ride Button */}
              <motion.button
                className="btn-premium gradient-primary w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-glow-green-strong"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBookRide}
              >
                Book Ride — {routeInfo.loading ? "Calculating…" : `₹${estimatedFare || "—"}`}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Searching State Overlay */}
      <AnimatePresence>
        {isSearchingDriver && (
          <motion.div
            className="absolute bottom-16 left-0 right-0 z-50 flex flex-col items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="glass-strong shadow-float w-full rounded-t-3xl rounded-b-2xl p-8 flex flex-col items-center gap-6">
              {/* Pulsing Circles */}
              <div className="relative flex h-32 w-32 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-ride-green/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border-2 border-ride-green/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                />
                <motion.div
                  className="absolute inset-6 rounded-full border-2 border-ride-green/50"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                />
                <motion.div
                  className="gradient-primary flex h-16 w-16 items-center justify-center rounded-full shadow-glow-green"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Navigation className="h-7 w-7 text-white" />
                </motion.div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground">Finding your driver</h3>
                <motion.p
                  className="mt-1 text-sm text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Looking for the best driver nearby...
                </motion.p>
              </div>

              <motion.button
                className="rounded-xl border border-destructive/30 px-8 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => { setIsSearchingDriver(false); toast.info("Search cancelled"); }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Sheet — supports both pickup & destination editing */}
      <AnimatePresence>
        {showSearchSheet && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col bg-background"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Mini route header showing both fields */}
            <div className="safe-top border-b border-foreground/5 px-4 pt-3 pb-3">
              <div className="relative">
                {/* Dotted line */}
                <div className="absolute left-[11px] top-[30px] bottom-[16px] w-[2px]" style={{
                  backgroundImage: "repeating-linear-gradient(to bottom, var(--color-ride-green) 0px, var(--color-ride-green) 3px, transparent 3px, transparent 7px)",
                  opacity: 0.35,
                }} />

                {/* Pickup mini-field */}
                <div
                  className={`relative flex items-center gap-3 rounded-xl px-2.5 py-2 mb-1.5 cursor-pointer transition-colors ${
                    activeSearchField === "pickup" ? "bg-ride-green/5 ring-1 ring-ride-green/20" : "hover:bg-foreground/[0.03]"
                  }`}
                  onClick={() => {
                    setActiveSearchField("pickup");
                    setSearchQuery("");
                  }}
                >
                  <CircleDot className={`h-3.5 w-3.5 shrink-0 ${activeSearchField === "pickup" ? "text-ride-green" : "text-muted-foreground"}`} />
                  <span className={`text-sm truncate flex-1 ${pickup ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {pickup ? pickup.address : currentLocation.address}
                  </span>
                </div>

                {/* Destination mini-field */}
                <div
                  className={`relative flex items-center gap-3 rounded-xl px-2.5 py-2 cursor-pointer transition-colors ${
                    activeSearchField === "destination" ? "bg-ride-green/5 ring-1 ring-ride-green/20" : "hover:bg-foreground/[0.03]"
                  }`}
                  onClick={() => {
                    setActiveSearchField("destination");
                    setSearchQuery("");
                  }}
                >
                  <MapPin className={`h-3.5 w-3.5 shrink-0 ${activeSearchField === "destination" ? "text-ride-green" : "text-muted-foreground"}`} />
                  <span className={`text-sm truncate flex-1 ${destination ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {destination ? destination.address : "Choose destination"}
                  </span>
                </div>
              </div>

              {/* Search Input */}
              <div className="mt-3 flex items-center gap-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder={activeSearchField === "pickup" ? "Search pickup location..." : "Search destination..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="h-9 border-0 bg-foreground/[0.04] rounded-xl text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ride-green/20"
                />
                <motion.button
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-foreground/5"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSearchSheet(false)}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
              {activeSearchField === "pickup" ? (
                <>
                  {/* Current Location Chip */}
                  <div className="mb-5">
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Location</h3>
                    <div className="flex flex-col gap-2">
                      <motion.button
                        className="flex w-full items-center gap-3 rounded-xl bg-ride-green/5 border border-ride-green/15 p-3 text-left"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (currentLocation.address === "Current location" || currentLocation.address === "Locating…") {
                            // GPS not resolved yet — fetch fresh and set pickup when it arrives
                            locateCustomer((lat, lng) => {
                              setPickup({ lat, lng, address: "Current location" });
                              setShowSearchSheet(false);
                            });
                          } else {
                            setPickup(currentLocation);
                            setShowSearchSheet(false);
                            toast.success("Pickup set to your location");
                          }
                        }}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ride-green/10 text-ride-green">
                          <Navigation className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Use current location</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {currentLocation.address === "Locating…" ? "Fetching your location…" : currentLocation.address}
                          </p>
                        </div>
                      </motion.button>

                      <motion.button
                        className="flex w-full items-center gap-3 rounded-xl bg-foreground/[0.03] border border-foreground/5 p-3 text-left hover:bg-foreground/[0.06] transition-colors"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setMapSelectionMode("pickup");
                          const startLoc = pickup || currentLocation;
                          setTempMapCoords({ lat: startLoc.lat, lng: startLoc.lng });
                          setTempMapAddress(startLoc.address || "Select position on map");
                          setShowSearchSheet(false);
                        }}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                          <Map className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Choose on Map</p>
                          <p className="text-xs text-muted-foreground truncate">Drag and drop pin on map</p>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Pickup Suggestions */}
                  <div>
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchQuery.trim().length >= 3 ? (nominatimLoading ? "Searching…" : "Results") : "Nearby Pickup Points"}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {searchQuery.trim().length >= 3 ? (
                        nominatimLoading ? (
                          <div className="flex items-center gap-3 p-3 text-sm text-muted-foreground">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ride-green border-t-transparent shrink-0" />
                            Looking up places…
                          </div>
                        ) : nominatimResults.length === 0 ? (
                          <p className="p-3 text-sm text-muted-foreground">No places found</p>
                        ) : (
                          nominatimResults.map((r, i) => (
                            <motion.button
                              key={r.place_id}
                              className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-foreground/[0.03] transition-colors"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectPickup(r.display_name, parseFloat(r.lat), parseFloat(r.lon))}
                            >
                              <MapPin className="h-4 w-4 shrink-0 text-ride-green" />
                              <span className="text-sm line-clamp-2">{r.display_name}</span>
                            </motion.button>
                          ))
                        )
                      ) : (
                        // Group pickup locations by area
                        (() => {
                          const pickupGroups: { area: string; filter: (p: string) => boolean }[] = [
                            { area: "Payyoli Area", filter: (p) => p.includes("Payyoli") || p.includes("Chorode") || p.includes("Nanminda") || p.includes("Keezhariyur") || p.includes("Atholi") || p.includes("Muttil") || p.includes("Iringal") || p.includes("Thikkodi") || p.includes("Ayyankara") || p.includes("Kakkodi") || p.includes("Sargalaya") },
                            { area: "Vadakara Area", filter: (p) => p.includes("Vadakara") || p.includes("Nadapuram") || p.includes("Perambra") || p.includes("Mooriyad") },
                            { area: "Koyilandy Area", filter: (p) => p.includes("Koyilandy") || p.includes("Moodadi") },
                            { area: "Elathur & Feroke", filter: (p) => p.includes("Elathur") || p.includes("Feroke") || p.includes("Ramanattukara") },
                            { area: "Kozhikode City", filter: (p) => p.includes("Kozhikode") || p.includes("Calicut") || p.includes("Mananchira") || p.includes("Palayam") || p.includes("Beypore") || p.includes("Kappad") || p.includes("Mukkam") || p.includes("Kunnamangalam") || p.includes("Westhill") || p.includes("SM Street") || p.includes("Malabar Mall") },
                          ];

                          const allFiltered = PICKUP_LOCATIONS.filter((p) =>
                            !searchQuery || p.toLowerCase().includes(searchQuery.toLowerCase())
                          );

                          // Skip grouping when filtering — just flat list
                          if (searchQuery) {
                            return allFiltered.map((place, i) => (
                              <motion.button
                                key={place}
                                className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-foreground/[0.03] transition-colors"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectPickup(place)}
                              >
                                <MapPin className="h-4 w-4 shrink-0 text-ride-green" />
                                <span className="text-sm">{place}</span>
                              </motion.button>
                            ));
                          }

                          return pickupGroups.map((group) => {
                            const places = PICKUP_LOCATIONS.filter(group.filter);
                            if (!places.length) return null;
                            return (
                              <div key={group.area} className="mb-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-ride-green/80 px-3 mb-1 mt-2">{group.area}</p>
                                {places.map((place, i) => (
                                  <motion.button
                                    key={place}
                                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-foreground/[0.03] transition-colors"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectPickup(place)}
                                  >
                                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="text-sm">{place}</span>
                                  </motion.button>
                                ))}
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Choose on Map shortcut */}
                  <div className="mb-5">
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location Pin</h3>
                    <motion.button
                      className="flex w-full items-center gap-3 rounded-xl bg-foreground/[0.03] border border-foreground/5 p-3 text-left hover:bg-foreground/[0.06] transition-colors"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setMapSelectionMode("destination");
                        const startLoc = destination || { lat: 11.5064 + 0.005, lng: 75.7797 + 0.005, address: "" };
                        setTempMapCoords({ lat: startLoc.lat, lng: startLoc.lng });
                        setTempMapAddress(startLoc.address || "Select destination on map");
                        setShowSearchSheet(false);
                      }}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                        <Map className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Choose on Map</p>
                        <p className="text-xs text-muted-foreground truncate">Set destination visually by dropping a pin</p>
                      </div>
                    </motion.button>
                  </div>

                  {/* Favorite Locations */}
                  <div className="mb-5">
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved Places</h3>
                    <div className="flex gap-2">
                      <motion.button
                        className="flex items-center gap-2 rounded-xl bg-foreground/[0.03] px-3.5 py-2.5"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectDestination("Near Payyoli Beach Road, Payyoli")}
                      >
                        <Home className="h-4 w-4 text-ride-green" />
                        <span className="text-sm font-medium">Home</span>
                      </motion.button>
                      <motion.button
                        className="flex items-center gap-2 rounded-xl bg-foreground/[0.03] px-3.5 py-2.5"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectDestination("Vadakara Court Road, Vadakara")}
                      >
                        <Briefcase className="h-4 w-4 text-ride-green" />
                        <span className="text-sm font-medium">Office</span>
                      </motion.button>
                      <motion.button
                        className="flex items-center gap-2 rounded-xl bg-foreground/[0.03] px-3.5 py-2.5"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast.info("Add your favorite places")}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Add</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Popular Places */}
                  <div>
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchQuery.trim().length >= 3 ? (nominatimLoading ? "Searching…" : "Results") : "Popular Places"}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {searchQuery.trim().length >= 3 ? (
                        nominatimLoading ? (
                          <div className="flex items-center gap-3 p-3 text-sm text-muted-foreground">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ride-green border-t-transparent shrink-0" />
                            Looking up places…
                          </div>
                        ) : nominatimResults.length === 0 ? (
                          <p className="p-3 text-sm text-muted-foreground">No places found</p>
                        ) : (
                          nominatimResults.map((r, i) => (
                            <motion.button
                              key={r.place_id}
                              className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-foreground/[0.03] transition-colors"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectDestination(r.display_name, parseFloat(r.lat), parseFloat(r.lon))}
                            >
                              <MapPin className="h-4 w-4 shrink-0 text-ride-green" />
                              <span className="text-sm line-clamp-2">{r.display_name}</span>
                            </motion.button>
                          ))
                        )
                      ) : (
                        // Grouped area sections when no search query
                        (() => {
                          const areaGroups: { area: string; places: string[] }[] = [
                            {
                              area: "Payyoli Area",
                              places: POPULAR_PLACES.filter((p) => p.includes("Payyoli") || p.includes("Chorode") || p.includes("Nanminda") || p.includes("Keezhariyur") || p.includes("Atholi") || p.includes("Kadalundi") || p.includes("Muttil") || p.includes("Orkkatteri")),
                            },
                            {
                              area: "Vadakara Area",
                              places: POPULAR_PLACES.filter((p) => p.includes("Vadakara") || p.includes("Nadapuram") || p.includes("Perambra") || p.includes("Mooriyad") || p.includes("Ayanchery") || p.includes("Thiruvallur") || p.includes("Iruvanipuzha") || p.includes("Puthoor") || p.includes("Maruthonkara")),
                            },
                            {
                              area: "Thikkodi & Iringal",
                              places: POPULAR_PLACES.filter((p) => p.includes("Thikkodi") || p.includes("Iringal") || p.includes("Sargalaya") || p.includes("Ayyankara") || p.includes("Kakkodi") || p.includes("Cheruvannur")),
                            },
                            {
                              area: "Koyilandy Area",
                              places: POPULAR_PLACES.filter((p) => p.includes("Koyilandy") || p.includes("Quilandy") || p.includes("Moodadi") || p.includes("Elathur") || p.includes("Feroke") || p.includes("Ramanattukara")),
                            },
                            {
                              area: "Kozhikode City",
                              places: POPULAR_PLACES.filter((p) => p.includes("Kozhikode") || p.includes("Calicut") || p.includes("Mananchira") || p.includes("Palayam") || p.includes("Beypore") || p.includes("Kappad") || p.includes("Mukkam") || p.includes("Kunnamangalam") || p.includes("Malabar Mall") || p.includes("Westhill") || p.includes("Nadakkavu") || p.includes("SM Street") || p.includes("Puthiyara") || p.includes("Meenchanda") || p.includes("Eranhipalam") || p.includes("Govindapuram") || p.includes("Thamarassery") || p.includes("Balussery") || p.includes("GH Road") || p.includes("Mavoor") || p.includes("Pantheer") || p.includes("Chevayur")),
                            },
                          ];

                          const filteredGroups = areaGroups.map((g) => ({
                            ...g,
                            places: g.places.filter((p) =>
                              !searchQuery || p.toLowerCase().includes(searchQuery.toLowerCase())
                            ),
                          })).filter((g) => g.places.length > 0);

                          return filteredGroups.map((group) => (
                            <div key={group.area} className="mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-ride-green/80 px-3 mb-1 mt-2">{group.area}</p>
                              {group.places.map((place, i) => (
                                <motion.button
                                  key={place}
                                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-foreground/[0.03] transition-colors"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleSelectDestination(place)}
                                >
                                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="text-sm">{place}</span>
                                </motion.button>
                              ))}
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
