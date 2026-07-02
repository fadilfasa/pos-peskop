"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { PaymentMethod } from "@prisma/client";

export async function createTransaction(data: {
  dailyStockId: string;
  paymentMethod: PaymentMethod;
  items: { productId: string; qty: number; price: number }[];
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Create the transaction record
    await tx.transaction.create({
      data: {
        riderId: session.user.id,
        dailyStockId: data.dailyStockId,
        paymentMethod: data.paymentMethod,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            subtotal: item.qty * item.price,
          })),
        },
      },
    });

    // Update stock items
    for (const item of data.items) {
      await tx.dailyStockItem.update({
        where: {
          dailyStockId_productId: {
            dailyStockId: data.dailyStockId,
            productId: item.productId,
          },
        },
        data: {
          soldQty: { increment: item.qty },
          remainingQty: { decrement: item.qty },
        },
      });
    }
  });

  revalidatePath("/rider", "layout");
  revalidatePath("/admin", "layout");
}

import { getTodayStock } from "./stocks";

export async function getTodayTransactions() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const todayStock = await getTodayStock();

  if (!todayStock) {
    return [];
  }

  return prisma.transaction.findMany({
    where: {
      riderId: session.user.id,
      dailyStockId: todayStock.id,
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Fetch the transaction with its items
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!transaction) {
    throw new Error("Transaksi tidak ditemukan");
  }

  await prisma.$transaction(async (tx) => {
    // Restore stock quantities
    for (const item of transaction.items) {
      await tx.dailyStockItem.update({
        where: {
          dailyStockId_productId: {
            dailyStockId: transaction.dailyStockId,
            productId: item.productId,
          },
        },
        data: {
          soldQty: { decrement: item.qty },
          remainingQty: { increment: item.qty },
        },
      });
    }

    // Delete transaction items
    await tx.transactionItem.deleteMany({
      where: { transactionId: id },
    });

    // Delete the transaction
    await tx.transaction.delete({
      where: { id },
    });
  });

  revalidatePath("/admin/reports/sales");
  revalidatePath("/admin", "layout");
}
