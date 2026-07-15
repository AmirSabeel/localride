import { Server } from "socket.io";

const io = new Server(3003, {
  cors: { origin: "*" },
  path: "/",
});

const drivers = new Map<string, { lat: number; lng: number; status: string }>();
const customers = new Map<string, { lat: number; lng: number }>();
const rideSubscriptions = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on("register:driver", (data: { id: string; lat: number; lng: number; status: string }) => {
    drivers.set(data.id, { lat: data.lat, lng: data.lng, status: data.status });
    socket.data.role = "driver";
    socket.data.userId = data.id;
    socket.join(`driver:${data.id}`);
    console.log(`[Socket] Driver registered: ${data.id}`);
  });

  socket.on("register:customer", (data: { id: string; lat: number; lng: number }) => {
    customers.set(data.id, { lat: data.lat, lng: data.lng });
    socket.data.role = "customer";
    socket.data.userId = data.id;
    socket.join(`customer:${data.id}`);
    console.log(`[Socket] Customer registered: ${data.id}`);
  });

  socket.on("update:location", (data: { lat: number; lng: number }) => {
    if (socket.data.role === "driver" && socket.data.userId) {
      const driver = drivers.get(socket.data.userId);
      if (driver) {
        driver.lat = data.lat;
        driver.lng = data.lng;
      }
      // Notify customers tracking this driver
      socket.to(`tracking:${socket.data.userId}`).emit("driver:location", {
        driverId: socket.data.userId,
        lat: data.lat,
        lng: data.lng,
      });
    } else if (socket.data.role === "customer" && socket.data.userId) {
      const customer = customers.get(socket.data.userId);
      if (customer) {
        customer.lat = data.lat;
        customer.lng = data.lng;
      }
      // Notify driver if on a ride
      const rideSubs = rideSubscriptions.get(socket.data.userId);
      if (rideSubs) {
        rideSubs.forEach((driverId) => {
          socket.to(`driver:${driverId}`).emit("customer:location", {
            customerId: socket.data.userId,
            lat: data.lat,
            lng: data.lng,
          });
        });
      }
    }
  });

  socket.on("driver:status", (data: { status: string }) => {
    if (socket.data.role === "driver" && socket.data.userId) {
      const driver = drivers.get(socket.data.userId);
      if (driver) driver.status = data.status;
      io.emit("driver:status:update", { driverId: socket.data.userId, status: data.status });
      console.log(`[Socket] Driver ${socket.data.userId} status: ${data.status}`);
    }
  });

  socket.on("ride:request", (data: { rideId: string; customerId: string; pickup: any; destination: any; fare: number; vehicleType: string }) => {
    // Find nearby online drivers
    const nearbyDrivers: string[] = [];
    drivers.forEach((driver, id) => {
      if (driver.status === "online") {
        const dist = Math.sqrt(
          Math.pow(driver.lat - data.pickup.lat, 2) + Math.pow(driver.lng - data.pickup.lng, 2)
        );
        if (dist < 0.05) nearbyDrivers.push(id); // ~5km radius
      }
    });

    // Send ride request to nearby drivers
    nearbyDrivers.forEach((driverId) => {
      socket.to(`driver:${driverId}`).emit("ride:incoming", {
        rideId: data.rideId,
        customer: { id: data.customerId, lat: data.pickup.lat, lng: data.pickup.lng },
        pickup: data.pickup,
        destination: data.destination,
        fare: data.fare,
        vehicleType: data.vehicleType,
      });
    });

    // Simulate a driver accepting after 3 seconds
    if (nearbyDrivers.length > 0) {
      setTimeout(() => {
        const acceptingDriver = nearbyDrivers[0];
        socket.to(`customer:${data.customerId}`).emit("ride:accepted", {
          rideId: data.rideId,
          driverId: acceptingDriver,
          driverName: "Rajesh Kumar",
          driverAvatar: "",
          driverRating: 4.8,
          vehicleType: data.vehicleType,
          vehiclePlate: "KA-01-AB-1234",
          vehicleColor: "White",
          eta: 5,
        });
        console.log(`[Socket] Ride ${data.rideId} accepted by driver ${acceptingDriver}`);
      }, 3000);
    }
  });

  socket.on("ride:accept", (data: { rideId: string; driverId: string }) => {
    // Notify customer
    io.emit("ride:accepted", {
      rideId: data.rideId,
      driverId: data.driverId,
    });
  });

  socket.on("ride:track:driver", (data: { driverId: string }) => {
    if (socket.data.userId) {
      socket.join(`tracking:${data.driverId}`);
      rideSubscriptions.set(socket.data.userId, rideSubscriptions.get(socket.data.userId)?.add(data.driverId) || new Set([data.driverId]));
    }
  });

  socket.on("ride:untrack:driver", (data: { driverId: string }) => {
    if (socket.data.userId) {
      socket.leave(`tracking:${data.driverId}`);
      const subs = rideSubscriptions.get(socket.data.userId);
      if (subs) subs.delete(data.driverId);
    }
  });

  socket.on("ride:status", (data: { rideId: string; status: string; driverId: string; customerId: string }) => {
    io.emit("ride:status:update", data);
  });

  socket.on("disconnect", () => {
    if (socket.data.userId) {
      if (socket.data.role === "driver") drivers.delete(socket.data.userId);
      else customers.delete(socket.data.userId);
    }
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

console.log("[Socket.IO] Ride socket service running on port 3003");