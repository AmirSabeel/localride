import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/rides/[id] — get single ride
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ride = await db.ride.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        driver: { select: { id: true, name: true, phone: true, avatar: true } },
        rating: true,
        payment: true,
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json({ ride });
  } catch (error: any) {
    console.error("[RIDE_GET]", error);
    return NextResponse.json({ error: "Failed to fetch ride" }, { status: 500 });
  }
}

// PATCH /api/rides/[id] — update ride status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, driverId, cancelReason } = body;

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const updateData: any = { status };

    // Driver accepts ride
    if (status === "confirmed" && driverId) {
      updateData.driverId = driverId;
    }

    // Ride starts
    if (status === "in_progress") {
      updateData.startTime = new Date();
    }

    // Ride completes — create payment record
    if (status === "completed") {
      updateData.endTime = new Date();
      const ride = await db.ride.findUnique({ where: { id } });
      if (ride) {
        // Create payment
        await db.payment.create({
          data: {
            rideId: id,
            userId: ride.customerId,
            amount: ride.fare,
            method: ride.paymentMethod,
            status: "completed",
          },
        });

        // Update driver earnings
        if (ride.driverId) {
          await db.driverProfile.updateMany({
            where: { userId: ride.driverId },
            data: {
              totalTrips: { increment: 1 },
              totalEarnings: { increment: ride.fare * 0.8 },
            },
          });
        }
      }
    }

    // Ride cancelled
    if (status === "cancelled" && cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    const ride = await db.ride.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ride });
  } catch (error: any) {
    console.error("[RIDE_PATCH]", error);
    return NextResponse.json({ error: "Failed to update ride" }, { status: 500 });
  }
}
