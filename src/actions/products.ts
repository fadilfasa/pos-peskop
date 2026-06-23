"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createProduct(data: {
  name: string;
  price: number;
  hpp?: number;
  unit?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      hpp: data.hpp || 0,
      unit: data.unit || "150 ml",
    },
  });

  revalidatePath("/admin/products");
}

export async function updateProduct(
  id: string,
  data: { name: string; price: number; hpp?: number; unit?: string; isActive?: boolean }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price,
      hpp: data.hpp || 0,
      unit: data.unit || "150 ml",
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    throw new Error(error?.message || "Gagal menghapus produk");
  }

  revalidatePath("/admin/products");
}
