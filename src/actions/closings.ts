"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ClosingStatus } from "@prisma/client";

export async function createClosing(data: {
  dailyStockId: string;
  actualDeposit: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Dapatkan date dari dailyStock untuk memastikan tanggal closing sesuai dengan tanggal stok
  const stock = await prisma.dailyStock.findUnique({
    where: { id: data.dailyStockId },
  });

  if (!stock) {
    throw new Error("Data stok tidak ditemukan");
  }

  const stockDate = stock.date;

  // Check if already closed for this stock
  const existingClosing = await prisma.dailyClosing.findUnique({
    where: {
      dailyStockId: data.dailyStockId,
    },
  });

  if (existingClosing) {
    throw new Error("Hari ini sudah di-closing");
  }

  // Calculate totals
  const transactions = await prisma.transaction.findMany({
    where: {
      dailyStockId: data.dailyStockId,
      riderId: session.user.id,
    },
  });

  const totalSalesCash = transactions
    .filter((t) => t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalSalesQris = transactions
    .filter((t) => t.paymentMethod === "QRIS")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const expenses = await prisma.expense.findMany({
    where: {
      dailyStockId: data.dailyStockId,
      riderId: session.user.id,
    },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expectedDeposit = totalSalesCash - totalExpenses;
  const difference = data.actualDeposit - expectedDeposit;

  let status: ClosingStatus = "BALANCED";
  if (difference > 0) status = "SURPLUS";
  if (difference < 0) status = "DEFICIT";

  await prisma.dailyClosing.create({
    data: {
      riderId: session.user.id,
      dailyStockId: data.dailyStockId,
      date: stockDate,
      totalSalesCash,
      totalSalesQris,
      totalExpenses,
      expectedDeposit,
      actualDeposit: data.actualDeposit,
      difference,
      notes: data.notes || null,
      status,
    },
  });

  revalidatePath("/rider", "layout");
  revalidatePath("/admin", "layout");
}

export async function getClosingHistory(filters?: {
  riderId?: string;
  startDate?: string;
  endDate?: string;
  franchiseId?: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {};

  if (session.user.role === "RIDER") {
    where.riderId = session.user.id;
  } else if (session.user.role === "FRANCHISE_OWNER") {
    // Franchise owner: scope to their franchise's riders
    const ridersInFranchise = await prisma.user.findMany({
      where: { role: "RIDER", isActive: true, franchiseId: session.user.franchiseId },
      select: { id: true },
    });
    const riderIds = ridersInFranchise.map(r => r.id);
    if (filters?.riderId && riderIds.includes(filters.riderId)) {
      where.riderId = filters.riderId;
    } else {
      where.riderId = { in: riderIds };
    }
  } else if (filters?.riderId) {
    where.riderId = filters.riderId;
  } else if (filters?.franchiseId) {
    // Admin filtering by franchise
    const franchiseRiderWhere: Record<string, unknown> = { role: "RIDER", isActive: true };
    if (filters.franchiseId === "pusat") {
      franchiseRiderWhere.franchiseId = null;
    } else {
      franchiseRiderWhere.franchiseId = filters.franchiseId;
    }
    const ridersInFranchise = await prisma.user.findMany({
      where: franchiseRiderWhere,
      select: { id: true },
    });
    where.riderId = { in: ridersInFranchise.map(r => r.id) };
  }

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters?.startDate) {
      (where.date as Record<string, unknown>).gte = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      (where.date as Record<string, unknown>).lte = new Date(filters.endDate);
    }
  }

  return prisma.dailyClosing.findMany({
    where,
    include: {
      rider: {
        select: { name: true, username: true },
      },
      dailyStock: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { date: "desc" },
    take: 100,
  });
}
