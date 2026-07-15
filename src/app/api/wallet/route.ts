import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/wallet?userId=xxx — balance + recent transactions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const wallet = await db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      return NextResponse.json({ balance: 0, transactions: [] });
    }

    return NextResponse.json({
      balance: wallet.balance,
      transactions: wallet.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.createdAt.toLocaleString(),
      })),
    });
  } catch (error: any) {
    console.error("[WALLET_GET]", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

// POST /api/wallet — top up or debit wallet
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, description, type } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: "userId and amount are required" }, { status: 400 });
    }

    const txType = type || "credit";

    // Get or create wallet
    let wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await db.wallet.create({ data: { userId, balance: 0 } });
    }

    const newBalance = txType === "credit"
      ? wallet.balance + amount
      : Math.max(0, wallet.balance - amount);

    // Update balance + create transaction in one go
    const [updatedWallet, transaction] = await db.$transaction([
      db.wallet.update({ where: { userId }, data: { balance: newBalance } }),
      db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: txType,
          amount,
          description: description || (txType === "credit" ? "Wallet top-up" : "Ride payment"),
        },
      }),
    ]);

    return NextResponse.json({
      balance: updatedWallet.balance,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[WALLET_POST]", error);
    return NextResponse.json({ error: "Wallet operation failed" }, { status: 500 });
  }
}
