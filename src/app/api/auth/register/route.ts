import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user + role-specific profile in a transaction
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role,
        ...(role === "customer"
          ? { customerProfile: { create: {} } }
          : role === "driver"
          ? { driverProfile: { create: {} } }
          : {}),
        wallet: { create: { balance: role === "customer" ? 500 : 0 } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: error?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
