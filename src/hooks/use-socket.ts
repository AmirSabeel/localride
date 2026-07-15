/**
 * Socket.IO client hook for real-time tracking (location, ride matching, booking).
 */

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/store/app-store";

// Use public Render socket URL if deployed, otherwise fallback to local 3003
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3003";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { userId, userRole, driverStatus, driverLocation, currentLocation, activeRide } = useAppStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || !userRole) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });
      console.log(`[Socket] Connecting to ${SOCKET_URL}`);
    }

    socketRef.current = socketInstance;

    // 1. Register with socket server on connect
    const onConnect = () => {
      console.log("[Socket] Connected successfully with ID:", socketInstance?.id);
      if (userRole === "driver") {
        socketInstance?.emit("register:driver", {
          id: userId,
          lat: driverLocation.lat,
          lng: driverLocation.lng,
          status: driverStatus,
        });
      } else if (userRole === "customer") {
        socketInstance?.emit("register:customer", {
          id: userId,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
        });
      }
    };

    if (socketInstance.connected) {
      onConnect();
    }

    socketInstance.on("connect", onConnect);

    return () => {
      socketInstance?.off("connect", onConnect);
    };
  }, [userId, userRole]);

  // 2. Sync driver status changes
  useEffect(() => {
    if (socketInstance?.connected && userRole === "driver") {
      socketInstance.emit("driver:status", { status: driverStatus });
    }
  }, [driverStatus, userRole]);

  // 3. Emit real-time location updates
  useEffect(() => {
    if (!socketInstance?.connected) return;

    if (userRole === "driver" && driverLocation) {
      socketInstance.emit("update:location", {
        lat: driverLocation.lat,
        lng: driverLocation.lng,
      });
    } else if (userRole === "customer" && currentLocation) {
      socketInstance.emit("update:location", {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      });
    }
  }, [driverLocation?.lat, driverLocation?.lng, currentLocation?.lat, currentLocation?.lng, userRole]);

  // 4. Handle ride tracking rooms when active ride is loaded
  useEffect(() => {
    if (!socketInstance?.connected || !activeRide) return;

    // Customer subscribes to driver's location updates
    if (userRole === "customer" && activeRide.driverLocation) {
      const driverId = "d1"; // fallback driver ID or pull from ride
      socketInstance.emit("ride:track:driver", { driverId });
      return () => {
        socketInstance?.emit("ride:untrack:driver", { driverId });
      };
    }
  }, [activeRide?.id, userRole]);

  return socketRef.current;
}
