import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/rides/[id]/rate — submit a rating
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rideId } = await params;
    const body = await request.json();
    const { fromUser, toUser, score, review } = body;

    if (!fromUser || !toUser || !score) {
      return NextResponse.json(
        { error: "fromUser, toUser, and score are required" },
        { status: 400 }
      );
    }

    // Check if rating already exists
    const existing = await db.rating.findUnique({ where: { rideId } });
    if (existing) {
      return NextResponse.json({ error: "Rating already submitted" }, { status: 409 });
    }

    const rating = await db.rating.create({
      data: {
        rideId,
        fromUser,
        toUser,
        score: Math.min(5, Math.max(1, score)),
        review: review || null,
      },
    });

    // Update driver's average rating
    const driverRatings = await db.rating.findMany({
      where: { toUser },
      select: { score: true },
    });
    if (driverRatings.length > 0) {
      const avg = driverRatings.reduce((sum, r) => sum + r.score, 0) / driverRatings.length;
      await db.driverProfile.updateMany({
        where: { userId: toUser },
        data: { rating: Math.round(avg * 10) / 10 },
      });
    }

    return NextResponse.json({ rating }, { status: 201 });
  } catch (error: any) {
    console.error("[RATE]", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}
