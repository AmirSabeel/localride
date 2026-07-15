import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/promo/validate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, fare } = body;

    if (!code || !fare) {
      return NextResponse.json({ error: "code and fare are required" }, { status: 400 });
    }

    const promo = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" }, { status: 404 });
    }

    const now = new Date();
    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: "This promo code is no longer active" });
    }
    if (now < promo.validFrom || now > promo.validUntil) {
      return NextResponse.json({ valid: false, error: "This promo code has expired" });
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit" });
    }
    if (promo.minFare && fare < promo.minFare) {
      return NextResponse.json({ valid: false, error: `Minimum fare of ₹${promo.minFare} required` });
    }

    // Calculate discount
    let discount = (fare * promo.discount) / 100;
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
    const newFare = Math.max(0, fare - discount);

    // Increment usage
    await db.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      newFare: Math.round(newFare),
      message: `₹${Math.round(discount)} off applied!`,
    });
  } catch (error: any) {
    console.error("[PROMO_VALIDATE]", error);
    return NextResponse.json({ error: "Failed to validate promo" }, { status: 500 });
  }
}
