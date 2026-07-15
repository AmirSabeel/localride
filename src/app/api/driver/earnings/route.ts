import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/driver/earnings?driverId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json({ error: "driverId is required" }, { status: 400 });
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRides, weekRides, monthRides, profile] = await Promise.all([
      db.ride.findMany({
        where: { driverId, status: "completed", endTime: { gte: startOfDay } },
        select: { fare: true },
      }),
      db.ride.findMany({
        where: { driverId, status: "completed", endTime: { gte: startOfWeek } },
        select: { fare: true },
      }),
      db.ride.findMany({
        where: { driverId, status: "completed", endTime: { gte: startOfMonth } },
        select: { fare: true },
      }),
      db.driverProfile.findUnique({
        where: { userId: driverId },
        select: { totalTrips: true, totalEarnings: true, rating: true },
      }),
    ]);

    const driverCut = 0.8; // 80% goes to driver

    return NextResponse.json({
      today: {
        earnings: Math.round(todayRides.reduce((s, r) => s + r.fare, 0) * driverCut),
        trips: todayRides.length,
      },
      week: {
        earnings: Math.round(weekRides.reduce((s, r) => s + r.fare, 0) * driverCut),
        trips: weekRides.length,
      },
      month: {
        earnings: Math.round(monthRides.reduce((s, r) => s + r.fare, 0) * driverCut),
        trips: monthRides.length,
      },
      total: {
        trips: profile?.totalTrips ?? 0,
        earnings: profile?.totalEarnings ?? 0,
        rating: profile?.rating ?? 0,
      },
    });
  } catch (error: any) {
    console.error("[DRIVER_EARNINGS]", error);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}
