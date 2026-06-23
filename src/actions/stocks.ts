"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getLocalTodayUTC } from "@/lib/utils";

export async function getTodayStock() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const today = getLocalTodayUTC();

  return prisma.dailyStock.findUnique({
    where: {
      riderId_date: {
        riderId: session.user.id,
        date: today,
      },
    },
    include: {
      items: {
        include: { product: true },
      },
      closing: true,
    },
  });
}

export async function createDailyStock(
  items: { productId: string; initialQty: number }[]
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const today = getLocalTodayUTC();

  // Check if stock already exists
  const existing = await prisma.dailyStock.findUnique({
    where: {
      riderId_date: {
        riderId: session.user.id,
        date: today,
      },
    },
  });

  if (existing) {
    throw new Error("Stok awal hari ini sudah diinput");
  }

  await prisma.dailyStock.create({
    data: {
      riderId: session.user.id,
      date: today,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          initialQty: item.initialQty,
          remainingQty: item.initialQty,
          soldQty: 0,
        })),
      },
    },
  });

  revalidatePath("/rider");
  revalidatePath("/rider/stock");
}

export async function updateDailyStock(
  dailyStockId: string,
  items: { productId: string; initialQty: number }[]
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Check if there are transactions
  const transactions = await prisma.transaction.count({
    where: { dailyStockId },
  });

  if (transactions > 0) {
    throw new Error("Tidak bisa mengubah stok awal karena sudah ada transaksi");
  }

  // Delete existing items and recreate
  await prisma.dailyStockItem.deleteMany({
    where: { dailyStockId },
  });

  await prisma.dailyStockItem.createMany({
    data: items.map((item) => ({
      dailyStockId,
      productId: item.productId,
      initialQty: item.initialQty,
      remainingQty: item.initialQty,
      soldQty: 0,
    })),
  });

  revalidatePath("/rider");
  revalidatePath("/rider/stock");
}

export async function addAdditionalStock(
  dailyStockId: string,
  items: { productId: string; addQty: number }[]
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const dailyStock = await prisma.dailyStock.findUnique({
    where: { id: dailyStockId },
    include: { closing: true }
  });

  if (!dailyStock) throw new Error("Data stok hari ini tidak ditemukan");
  if (dailyStock.closing) throw new Error("Closing sudah dilakukan, tidak bisa menambah stok");

  // Loop through items and update/create
  for (const item of items) {
    if (item.addQty <= 0) continue;

    const existingItem = await prisma.dailyStockItem.findUnique({
      where: {
        dailyStockId_productId: {
          dailyStockId,
          productId: item.productId,
        }
      }
    });

    if (existingItem) {
      await prisma.dailyStockItem.update({
        where: { id: existingItem.id },
        data: {
          initialQty: { increment: item.addQty },
          remainingQty: { increment: item.addQty }
        }
      });
    } else {
      await prisma.dailyStockItem.create({
        data: {
          dailyStockId,
          productId: item.productId,
          initialQty: item.addQty,
          remainingQty: item.addQty,
          soldQty: 0
        }
      });
    }
  }

  revalidatePath("/rider");
  revalidatePath("/rider/stock");
}

export async function createAdminDailyStock(
  riderId: string,
  items: { productId: string; initialQty: number }[]
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const today = getLocalTodayUTC();

  // Check if stock already exists
  const existing = await prisma.dailyStock.findUnique({
    where: {
      riderId_date: {
        riderId,
        date: today,
      },
    },
  });

  if (existing) {
    throw new Error("Stok awal hari ini sudah diinput untuk rider tersebut");
  }

  await prisma.dailyStock.create({
    data: {
      riderId,
      date: today,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          initialQty: item.initialQty,
          remainingQty: item.initialQty,
          soldQty: 0,
        })),
      },
    },
  });

  revalidatePath("/admin/stocks");
}

export async function addAdminAdditionalStock(
  dailyStockId: string,
  items: { productId: string; addQty: number }[]
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const dailyStock = await prisma.dailyStock.findUnique({
    where: { id: dailyStockId },
    include: { closing: true }
  });

  if (!dailyStock) throw new Error("Data stok hari ini tidak ditemukan");
  if (dailyStock.closing) throw new Error("Closing sudah dilakukan, tidak bisa menambah stok");

  // Loop through items and update/create
  for (const item of items) {
    if (item.addQty <= 0) continue;

    const existingItem = await prisma.dailyStockItem.findUnique({
      where: {
        dailyStockId_productId: {
          dailyStockId,
          productId: item.productId,
        }
      }
    });

    if (existingItem) {
      await prisma.dailyStockItem.update({
        where: { id: existingItem.id },
        data: {
          initialQty: { increment: item.addQty },
          remainingQty: { increment: item.addQty }
        }
      });
    } else {
      await prisma.dailyStockItem.create({
        data: {
          dailyStockId,
          productId: item.productId,
          initialQty: item.addQty,
          remainingQty: item.addQty,
          soldQty: 0
        }
      });
    }
  }

  revalidatePath("/admin/stocks");
}
