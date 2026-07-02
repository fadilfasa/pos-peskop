"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getFranchises() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.franchise.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "FRANCHISE_OWNER", isActive: true },
        select: { id: true, name: true, username: true, phone: true },
      },
      _count: {
        select: {
          users: { where: { role: "RIDER", isActive: true } },
        },
      },
    },
  });
}

export async function getAllFranchisesSimple() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.franchise.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createFranchise(data: {
  name: string;
  ownerName: string;
  ownerNik: string;
  ownerPassword: string;
  ownerPhone?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Check franchise name uniqueness
  const existingFranchise = await prisma.franchise.findUnique({
    where: { name: data.name },
  });
  if (existingFranchise) {
    throw new Error("Nama franchise sudah terdaftar");
  }

  // Check username uniqueness (using franchise name as username)
  const existingUser = await prisma.user.findUnique({
    where: { username: data.name },
  });
  if (existingUser) {
    throw new Error("Nama franchise sudah terdaftar sebagai user");
  }

  // Check NIK uniqueness
  const existingNik = await prisma.user.findUnique({
    where: { nik: data.ownerNik },
  });
  if (existingNik) {
    throw new Error("NIK pemilik sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);

  // Create franchise and owner in a transaction
  await prisma.$transaction(async (tx) => {
    const franchise = await tx.franchise.create({
      data: {
        name: data.name,
      },
    });

    await tx.user.create({
      data: {
        name: data.ownerName,
        username: data.name,
        password: hashedPassword,
        phone: data.ownerPhone || null,
        nik: data.ownerNik,
        role: "FRANCHISE_OWNER",
        franchiseId: franchise.id,
      },
    });
  });

  revalidatePath("/admin/franchises");
}

export async function updateFranchise(
  id: string,
  data: {
    name: string;
  }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.franchise.findUnique({
    where: { name: data.name },
  });
  if (existing && existing.id !== id) {
    throw new Error("Nama franchise sudah terdaftar");
  }

  await prisma.franchise.update({
    where: { id },
    data: {
      name: data.name,
    },
  });

  revalidatePath("/admin/franchises");
}

export async function deleteFranchise(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({
      where: { franchiseId: id },
    });
    await tx.franchise.delete({
      where: { id },
    });
  });

  revalidatePath("/admin/franchises");
}
