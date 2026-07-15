import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/driver/nearby?lat=x&lng=y
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");

  try {
    // Find drivers who are online and have approved vehicles
    const drivers = await db.user.findMany({
      where: {
        role: "driver",
        isOnline: true,
        driverProfile: { isApproved: true },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        driverProfile: {
          select: {
            rating: true,
            vehicle: {
              take: 1,
              select: { type: true, plateNumber: true },
            },
          },
        },
      },
    });

    // If no real drivers, return seed data
    if (drivers.length === 0) {
      return NextResponse.json([
        { id: "d1", name: "Rahul K.", avatar: "", vehicleType: "sedan", vehiclePlate: "KL-14-A-1234", rating: 4.8, lat: lat + 0.005, lng: lng - 0.004, eta: 3, fare: 85 },
        { id: "d2", name: "Priya M.", avatar: "", vehicleType: "hatchback", vehiclePlate: "KL-14-B-5678", rating: 4.9, lat: lat + 0.008, lng: lng - 0.005, eta: 4, fare: 65 },
        { id: "d3", name: "Arun S.", avatar: "", vehicleType: "suv", vehiclePlate: "KL-14-C-9012", rating: 4.7, lat: lat - 0.007, lng: lng + 0.006, eta: 6, fare: 120 },
        { id: "d4", name: "Vikram T.", avatar: "", vehicleType: "auto", vehiclePlate: "KL-14-E-7890", rating: 4.5, lat: lat + 0.003, lng: lng - 0.003, eta: 2, fare: 45 },
        { id: "d5", name: "Sujith R.", avatar: "", vehicleType: "bike", vehiclePlate: "KL-14-F-2345", rating: 4.8, lat: lat + 0.006, lng: lng - 0.004, eta: 2, fare: 35 },
      ]);
    }

    // Map real drivers — give them random positions near the customer
    const nearbyDrivers = drivers.map((d, i) => {
      const vehicle = d.driverProfile?.vehicle?.[0];
      const offset = () => (Math.random() - 0.5) * 0.02; // ~1km radius
      return {
        id: d.id,
        name: d.name,
        avatar: d.avatar ?? "",
        vehicleType: vehicle?.type ?? "sedan",
        vehiclePlate: vehicle?.plateNumber ?? "KL-XX-X-XXXX",
        rating: d.driverProfile?.rating ?? 4.5,
        lat: lat + offset(),
        lng: lng + offset(),
        eta: 2 + Math.floor(Math.random() * 6),
        fare: 50 + Math.floor(Math.random() * 100),
      };
    });

    return NextResponse.json(nearbyDrivers);
  } catch (error: any) {
    console.error("[NEARBY_DRIVERS]", error);
    return NextResponse.json([], { status: 500 });
  }
}
