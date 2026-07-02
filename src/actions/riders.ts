"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Helper: check if user is admin or franchise owner
async function getAuthorizedSession() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "FRANCHISE_OWNER")) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getRiders(franchiseFilter?: string) {
  const session = await getAuthorizedSession();

  // Franchise owner can only see their own riders
  let franchiseId: string | null | undefined;
  if (session.user.role === "FRANCHISE_OWNER") {
    franchiseId = session.user.franchiseId;
  } else if (franchiseFilter === "pusat") {
    franchiseId = null;
  } else if (franchiseFilter) {
    franchiseId = franchiseFilter;
  }

  const where: Record<string, unknown> = { role: "RIDER", isActive: true };
  if (franchiseId !== undefined) {
    where.franchiseId = franchiseId;
  }

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      nik: true,
      isActive: true,
      createdAt: true,
      franchiseId: true,
      franchise: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function createRider(data: {
  name: string;
  username: string;
  password: string;
  phone?: string;
  nik?: string;
  franchiseId?: string | null;
}) {
  const session = await getAuthorizedSession();

  const existing = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existing) {
    throw new Error("Rider ID / Username sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Franchise owner: auto-assign their franchiseId
  let assignedFranchiseId: string | null = null;
  if (session.user.role === "FRANCHISE_OWNER") {
    assignedFranchiseId = session.user.franchiseId;
  } else {
    // Admin can optionally assign to a franchise
    assignedFranchiseId = data.franchiseId ?? null;
  }

  await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      password: hashedPassword,
      phone: data.phone || null,
      nik: data.nik || null,
      role: "RIDER",
      franchiseId: assignedFranchiseId,
    },
  });

  revalidatePath("/admin/riders");
  revalidatePath("/franchise/riders");
}

export async function updateRider(
  id: string,
  data: {
    name: string;
    username: string;
    phone?: string;
    nik?: string;
    password?: string;
    isActive?: boolean;
    franchiseId?: string | null;
  }
) {
  const session = await getAuthorizedSession();

  // Franchise owner: validate ownership
  if (session.user.role === "FRANCHISE_OWNER") {
    const rider = await prisma.user.findUnique({ where: { id } });
    if (!rider || rider.franchiseId !== session.user.franchiseId) {
      throw new Error("Unauthorized: rider bukan milik franchise Anda");
    }
  }

  const updateData: Record<string, unknown> = {
    name: data.name,
    username: data.username,
    phone: data.phone || null,
    nik: data.nik || null,
    isActive: data.isActive,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  // Only admin can change franchise assignment
  if (session.user.role === "ADMIN" && data.franchiseId !== undefined) {
    updateData.franchiseId = data.franchiseId;
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/riders");
  revalidatePath("/franchise/riders");
}

export async function deleteRider(id: string) {
  const session = await getAuthorizedSession();

  // Franchise owner: validate ownership
  if (session.user.role === "FRANCHISE_OWNER") {
    const rider = await prisma.user.findUnique({ where: { id } });
    if (!rider || rider.franchiseId !== session.user.franchiseId) {
      throw new Error("Unauthorized: rider bukan milik franchise Anda");
    }
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  } catch (error: any) {
    console.error("Delete Rider Error:", error);
    throw new Error(error?.message || "Gagal menghapus rider");
  }

  revalidatePath("/admin/riders");
  revalidatePath("/franchise/riders");
}
