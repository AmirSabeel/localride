import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOTP } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const valid = verifyOTP(phone, otp);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Mark user as verified if they exist
    const user = await db.user.findFirst({ where: { phone } });
    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error("[OTP_VERIFY]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
