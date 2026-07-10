"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getRawMaterials() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.rawMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createRawMaterial(data: {
  merk: string;
  stockAwal: number;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.rawMaterial.findUnique({
    where: { merk: data.merk },
  });
  if (existing) {
    throw new Error("Bahan baku dengan merk ini sudah ada");
  }

  await prisma.rawMaterial.create({
    data: {
      merk: data.merk,
      stockAwal: data.stockAwal,
      tambahan: 0,
      terpakai: 0,
    },
  });

  revalidatePath("/admin/raw-materials");
}

export async function updateRawMaterial(
  id: string,
  data: {
    merk: string;
  }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Check if merk is taken by another item
  const existing = await prisma.rawMaterial.findUnique({
    where: { merk: data.merk },
  });
  if (existing && existing.id !== id) {
    throw new Error("Bahan baku dengan merk ini sudah ada");
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: { merk: data.merk },
  });

  revalidatePath("/admin/raw-materials");
}

export async function adjustTambahan(id: string, amount: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (amount <= 0) {
    throw new Error("Jumlah harus lebih dari 0");
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: {
      tambahan: { increment: amount },
    },
  });

  revalidatePath("/admin/raw-materials");
}

export async function adjustTerpakai(id: string, amount: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (amount <= 0) {
    throw new Error("Jumlah harus lebih dari 0");
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: {
      terpakai: { increment: amount },
    },
  });

  revalidatePath("/admin/raw-materials");
}

export async function deleteRawMaterial(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.rawMaterial.delete({
    where: { id },
  });

  revalidatePath("/admin/raw-materials");
}
