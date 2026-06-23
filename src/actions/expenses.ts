"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getLocalTodayUTC } from "@/lib/utils";
import type { ExpenseCategory } from "@prisma/client";

export async function createExpense(data: {
  dailyStockId: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const today = getLocalTodayUTC();

  await prisma.expense.create({
    data: {
      riderId: session.user.id,
      dailyStockId: data.dailyStockId,
      date: today,
      category: data.category,
      amount: data.amount,
      description: data.description || null,
    },
  });

  revalidatePath("/rider", "layout");
  revalidatePath("/admin", "layout");
}

import { getTodayStock } from "./stocks";

export async function getTodayExpenses() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const todayStock = await getTodayStock();

  if (!todayStock) {
    return [];
  }

  return prisma.expense.findMany({
    where: {
      riderId: session.user.id,
      dailyStockId: todayStock.id,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.expense.delete({
    where: { id, riderId: session.user.id },
  });

  revalidatePath("/rider", "layout");
  revalidatePath("/admin", "layout");
}
