import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── Fallback seed data (used when DB is empty) ──────────────────────

const SEED_NEARBY_DRIVERS = [
  { id: "d1",  name: "Rahul K.",    avatar: "", vehicleType: "sedan",    vehiclePlate: "KL-14-A-1234", rating: 4.8, lat: 11.5250, lng: 75.6380, eta: 3, fare: 85  },
  { id: "d2",  name: "Priya M.",    avatar: "", vehicleType: "hatchback", vehiclePlate: "KL-14-B-5678", rating: 4.9, lat: 11.5980, lng: 75.5940, eta: 4, fare: 65  },
  { id: "d3",  name: "Arun S.",     avatar: "", vehicleType: "suv",       vehiclePlate: "KL-14-C-9012", rating: 4.7, lat: 11.4420, lng: 75.7050, eta: 6, fare: 120 },
  { id: "d4",  name: "Deepa N.",    avatar: "", vehicleType: "sedan",     vehiclePlate: "KL-14-D-3456", rating: 4.6, lat: 11.2650, lng: 75.7800, eta: 3, fare: 80  },
  { id: "d5",  name: "Vikram T.",   avatar: "", vehicleType: "auto",      vehiclePlate: "KL-14-E-7890", rating: 4.5, lat: 11.5580, lng: 75.6180, eta: 2, fare: 45  },
];

const SEED_RIDE_HISTORY = [
  { id: "r1", from: "Payyoli Town Centre", to: "Vadakara Bus Stand", fare: 85, distance: 9.8, duration: 22, date: "Today, 2:30 PM", status: "completed", rating: 5 },
  { id: "r2", from: "Payyoli Beach Road", to: "Iringal Junction", fare: 45, distance: 4.5, duration: 12, date: "Today, 11:00 AM", status: "completed", rating: 4 },
  { id: "r3", from: "Thikkodi Market", to: "Keezhariyur Temple", fare: 55, distance: 5.8, duration: 15, date: "Yesterday, 6:15 PM", status: "completed", rating: 5 },
  { id: "r4", from: "Muttil Junction", to: "Payyoli Railway Station", fare: 38, distance: 3.6, duration: 10, date: "Yesterday, 9:00 AM", status: "completed", rating: 4 },
  { id: "r5", from: "Orkkatteri Square", to: "Chorode Bridge", fare: 42, distance: 4.2, duration: 11, date: "Jul 11, 4:45 PM", status: "completed", rating: 5 },
  { id: "r6", from: "Nanminda Junction", to: "Payyoli Hospital", fare: 28, distance: 2.8, duration: 8, date: "Jul 11, 1:20 PM", status: "cancelled", rating: 0 },
];

const SEED_DRIVER_HISTORY = [
  { id: "dr1", customer: "Anita Krishnan", from: "Payyoli Town", to: "Vadakara", fare: 85, distance: 9.8, duration: 22, date: "Today, 2:30 PM", status: "completed", earning: 68, rating: 5 },
  { id: "dr2", customer: "Mohammed Fasil", from: "Iringal", to: "Thikkodi", fare: 45, distance: 4.5, duration: 12, date: "Today, 11:00 AM", status: "completed", earning: 36, rating: 4 },
  { id: "dr3", customer: "Sneha Nair", from: "Muttil", to: "Payyoli Beach", fare: 55, distance: 5.8, duration: 15, date: "Yesterday, 6:15 PM", status: "completed", earning: 44, rating: 5 },
  { id: "dr4", customer: "Kiran Menon", from: "Keezhariyur", to: "Vadakara", fare: 65, distance: 7.2, duration: 18, date: "Yesterday, 9:00 AM", status: "completed", earning: 52, rating: 4 },
];

const SEED_ADMIN_STATS = {
  totalCustomers: 4285, totalDrivers: 312, totalRides: 24580, totalRevenue: 6245000,
  todayRides: 187, todayRevenue: 48200, activeDrivers: 64, avgRating: 4.7, weeklyGrowth: 8.3,
  monthlyRevenue: 1920000,
  topAreas: [
    { name: "Payyoli Town", rides: 8450, revenue: 2145000 },
    { name: "Vadakara", rides: 5200, revenue: 1310000 },
    { name: "Iringal", rides: 3180, revenue: 802000 },
    { name: "Thikkodi", rides: 2890, revenue: 728000 },
    { name: "Muttil", rides: 2150, revenue: 542000 },
  ],
  revenueChart: [
    { month: "Jan", revenue: 820000 }, { month: "Feb", revenue: 940000 },
    { month: "Mar", revenue: 1100000 }, { month: "Apr", revenue: 1050000 },
    { month: "May", revenue: 1280000 }, { month: "Jun", revenue: 1560000 },
    { month: "Jul", revenue: 1920000 },
  ],
};

// ── GET — read rides / seed data ────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const userId = searchParams.get("userId");

  try {
    switch (type) {
      case "nearby-drivers":
        return NextResponse.json(SEED_NEARBY_DRIVERS);

      case "ride-history": {
        if (userId) {
          const rides = await db.ride.findMany({
            where: { customerId: userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { rating: true },
          });
          if (rides.length > 0) {
            return NextResponse.json(
              rides.map((r) => ({
                id: r.id,
                from: r.pickupLocation,
                to: r.dropLocation,
                fare: r.fare,
                distance: r.distance ?? 0,
                duration: r.duration ?? 0,
                date: r.createdAt.toLocaleString(),
                status: r.status,
                rating: r.rating?.score ?? 0,
              }))
            );
          }
        }
        return NextResponse.json(SEED_RIDE_HISTORY);
      }

      case "driver-history": {
        if (userId) {
          const rides = await db.ride.findMany({
            where: { driverId: userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { customer: { select: { name: true } }, rating: true },
          });
          if (rides.length > 0) {
            return NextResponse.json(
              rides.map((r) => ({
                id: r.id,
                customer: r.customer.name,
                from: r.pickupLocation,
                to: r.dropLocation,
                fare: r.fare,
                distance: r.distance ?? 0,
                duration: r.duration ?? 0,
                date: r.createdAt.toLocaleString(),
                status: r.status,
                earning: Math.round(r.fare * 0.8),
                rating: r.rating?.score ?? 0,
              }))
            );
          }
        }
        return NextResponse.json(SEED_DRIVER_HISTORY);
      }

      case "admin-stats": {
        try {
          const [totalCustomers, totalDrivers, totalRides, revenueAgg] = await Promise.all([
            db.user.count({ where: { role: "customer" } }),
            db.user.count({ where: { role: "driver" } }),
            db.ride.count(),
            db.ride.aggregate({ _sum: { fare: true }, where: { status: "completed" } }),
          ]);
          if (totalRides > 0) {
            return NextResponse.json({
              ...SEED_ADMIN_STATS,
              totalCustomers,
              totalDrivers,
              totalRides,
              totalRevenue: revenueAgg._sum.fare ?? 0,
            });
          }
        } catch {
          // Fall through to seed data
        }
        return NextResponse.json(SEED_ADMIN_STATS);
      }

      case "popular-places":
        return NextResponse.json([
          "Payyoli Town Centre", "Payyoli Beach", "Payyoli Railway Station",
          "Vadakara Bus Stand", "Iringal Junction", "Thikkodi Market",
          "Keezhariyur Temple", "Muttil Junction", "Orkkatteri Square",
        ]);

      case "favorite-locations":
        return NextResponse.json([
          { id: "f1", name: "Home", address: "Near Payyoli Beach Road, Payyoli", icon: "home" },
          { id: "f2", name: "Office", address: "Vadakara Court Road, Vadakara", icon: "briefcase" },
        ]);

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[RIDES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// ── POST — create a new ride (booking) ──────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId, pickupLocation, dropLocation,
      pickupCoords, dropCoords,
      fare, distance, duration,
      vehicleType, paymentMethod,
    } = body;

    if (!customerId || !pickupLocation || !dropLocation || !fare) {
      return NextResponse.json(
        { error: "customerId, pickupLocation, dropLocation, and fare are required" },
        { status: 400 }
      );
    }

    const ride = await db.ride.create({
      data: {
        customerId,
        pickupLocation,
        dropLocation,
        pickupCoords: pickupCoords ? JSON.stringify(pickupCoords) : null,
        dropCoords: dropCoords ? JSON.stringify(dropCoords) : null,
        fare,
        distance: distance ?? null,
        duration: duration ?? null,
        status: "searching",
        paymentMethod: paymentMethod ?? "cash",
      },
    });

    return NextResponse.json({ ride }, { status: 201 });
  } catch (error: any) {
    console.error("[RIDES_POST]", error);
    return NextResponse.json({ error: "Failed to create ride" }, { status: 500 });
  }
}