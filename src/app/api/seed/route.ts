import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";

/**
 * POST /api/seed — populate database with demo data.
 * Creates 3 users (customer, driver, admin), a vehicle, rides, ratings,
 * wallet transactions, and promo codes.
 */
export async function POST() {
  try {
    // Check if already seeded
    const existingUsers = await db.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: "Database already has data. Delete db/custom.db and run prisma db push to reseed." });
    }

    const pwd = await hashPassword("test123");

    // ── Users ─────────────────────────────────────────────────────────
    const customer = await db.user.create({
      data: {
        name: "Arjun Krishnan",
        email: "arjun@test.com",
        phone: "+91 94470 54321",
        password: pwd,
        role: "customer",
        isVerified: true,
        avatar: "",
        customerProfile: { create: { totalRides: 8 } },
        wallet: {
          create: {
            balance: 1250,
            transactions: {
              create: [
                { type: "credit", amount: 500, description: "Welcome bonus" },
                { type: "credit", amount: 1000, description: "Wallet top-up via UPI" },
                { type: "debit", amount: 85, description: "Ride: Payyoli → Vadakara" },
                { type: "debit", amount: 65, description: "Ride: Payyoli → Iringal" },
                { type: "credit", amount: 50, description: "Referral bonus" },
                { type: "debit", amount: 55, description: "Ride: Thikkodi → Keezhariyur" },
                { type: "debit", amount: 38, description: "Ride: Muttil → Railway Station" },
                { type: "debit", amount: 42, description: "Ride: Orkkatteri → Chorode" },
                { type: "debit", amount: 15, description: "Promo: WELCOME50 discount" },
              ],
            },
          },
        },
      },
    });

    const driver = await db.user.create({
      data: {
        name: "Rahul Krishnan",
        email: "rahul@test.com",
        phone: "+91 94470 12345",
        password: pwd,
        role: "driver",
        isVerified: true,
        isOnline: true,
        avatar: "",
        driverProfile: {
          create: {
            licenseNumber: "KL-14-2021-0012345",
            licenseExpiry: new Date("2028-12-31"),
            rcBookNumber: "KL14A1234",
            status: "online",
            totalTrips: 156,
            totalEarnings: 24800,
            rating: 4.8,
            isApproved: true,
            bankAccount: "XXXX XXXX 1234",
            ifscCode: "SBIN0001234",
            upiId: "rahul@upi",
            vehicle: {
              create: {
                type: "sedan",
                make: "Maruti Suzuki",
                model: "Swift Dzire",
                year: 2023,
                color: "White",
                plateNumber: "KL-14-A-1234",
                capacity: 4,
                isApproved: true,
              },
            },
          },
        },
        wallet: { create: { balance: 24800 } },
      },
    });

    const admin = await db.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        phone: "+91 11111 11111",
        password: pwd,
        role: "admin",
        isVerified: true,
        avatar: "",
      },
    });

    // ── Rides + Ratings ───────────────────────────────────────────────
    const now = new Date();
    const rides = [
      { pickup: "Payyoli Town Centre", drop: "Vadakara Bus Stand", fare: 85, dist: 9.8, dur: 22, hoursAgo: 2, rating: 5 },
      { pickup: "Payyoli Beach Road", drop: "Iringal Junction", fare: 45, dist: 4.5, dur: 12, hoursAgo: 5, rating: 4 },
      { pickup: "Thikkodi Market", drop: "Keezhariyur Temple", fare: 55, dist: 5.8, dur: 15, hoursAgo: 28, rating: 5 },
      { pickup: "Muttil Junction", drop: "Payyoli Railway Station", fare: 38, dist: 3.6, dur: 10, hoursAgo: 39, rating: 4 },
      { pickup: "Orkkatteri Square", drop: "Chorode Bridge", fare: 42, dist: 4.2, dur: 11, hoursAgo: 50, rating: 5 },
      { pickup: "Nanminda Junction", drop: "Payyoli Hospital", fare: 28, dist: 2.8, dur: 8, hoursAgo: 53, rating: 0, cancelled: true },
      { pickup: "Payyoli Town Centre", drop: "Ayyankara Hills", fare: 65, dist: 6.5, dur: 18, hoursAgo: 72, rating: 5 },
      { pickup: "Vatakara New Bus Stand", drop: "Payyoli Beach", fare: 75, dist: 8.2, dur: 20, hoursAgo: 76, rating: 4 },
    ];

    for (const r of rides) {
      const startTime = new Date(now.getTime() - r.hoursAgo * 3600_000);
      const endTime = new Date(startTime.getTime() + r.dur * 60_000);
      const isCancelled = !!r.cancelled;

      const ride = await db.ride.create({
        data: {
          customerId: customer.id,
          driverId: isCancelled ? null : driver.id,
          pickupLocation: r.pickup,
          dropLocation: r.drop,
          fare: r.fare,
          distance: r.dist,
          duration: r.dur,
          status: isCancelled ? "cancelled" : "completed",
          startTime: isCancelled ? null : startTime,
          endTime: isCancelled ? null : endTime,
          paymentMethod: "wallet",
          paymentStatus: isCancelled ? "pending" : "completed",
          cancelReason: isCancelled ? "Customer cancelled" : null,
        },
      });

      if (!isCancelled) {
        // Payment
        await db.payment.create({
          data: {
            rideId: ride.id,
            userId: customer.id,
            amount: r.fare,
            method: "wallet",
            status: "completed",
          },
        });

        // Rating
        if (r.rating > 0) {
          await db.rating.create({
            data: {
              rideId: ride.id,
              fromUser: customer.id,
              toUser: driver.id,
              score: r.rating,
              review: r.rating === 5 ? "Great ride!" : "Good experience",
            },
          });
        }
      }
    }

    // ── Promo Codes ───────────────────────────────────────────────────
    await db.promoCode.createMany({
      data: [
        {
          code: "WELCOME50",
          discount: 50,
          maxDiscount: 100,
          minFare: 50,
          usageLimit: 1000,
          usedCount: 42,
          validFrom: new Date("2024-01-01"),
          validUntil: new Date("2027-12-31"),
          isActive: true,
        },
        {
          code: "RIDE20",
          discount: 20,
          maxDiscount: 50,
          minFare: 30,
          usageLimit: 500,
          usedCount: 128,
          validFrom: new Date("2024-06-01"),
          validUntil: new Date("2027-12-31"),
          isActive: true,
        },
      ],
    });

    // ── Notifications ─────────────────────────────────────────────────
    await db.notification.createMany({
      data: [
        { userId: customer.id, title: "Welcome to LocalRide!", body: "Your account is ready. Book your first ride now!", type: "system" },
        { userId: customer.id, title: "₹500 credited", body: "Welcome bonus added to your wallet", type: "payment" },
        { userId: driver.id, title: "Account Approved", body: "Your driver account has been approved. Start earning now!", type: "system" },
        { userId: driver.id, title: "Weekly Bonus", body: "Complete 5 more trips to earn ₹200 bonus", type: "promo" },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      users: {
        customer: { email: "arjun@test.com", password: "test123", role: "customer" },
        driver: { email: "rahul@test.com", password: "test123", role: "driver" },
        admin: { email: "admin@test.com", password: "test123", role: "admin" },
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[SEED]", error);
    return NextResponse.json({ error: error?.message || "Seeding failed" }, { status: 500 });
  }
}
