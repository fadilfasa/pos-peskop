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
  tambahan: number;
  terpakai: number;
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
    data,
  });

  revalidatePath("/admin/raw-materials");
}

export async function updateRawMaterial(
  id: string,
  data: {
    merk: string;
    stockAwal: number;
    tambahan: number;
    terpakai: number;
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
    data,
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
