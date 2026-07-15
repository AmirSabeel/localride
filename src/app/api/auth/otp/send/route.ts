import { NextResponse } from "next/server";
import { generateAndStoreOTP } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const otp = generateAndStoreOTP(phone);

    // In development, log the OTP to console (no SMS cost)
    console.log(`\n🔑 OTP for ${phone}: ${otp}\n`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Include OTP in dev mode so the frontend can auto-fill
      ...(process.env.NODE_ENV !== "production" ? { _dev_otp: otp } : {}),
    });
  } catch (error: any) {
    console.error("[OTP_SEND]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
