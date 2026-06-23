"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getRiders() {
  return prisma.user.findMany({
    where: { role: "RIDER", isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createRider(data: {
  name: string;
  username: string;
  password: string;
  phone?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existing) {
    throw new Error("Rider ID / Username sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      password: hashedPassword,
      phone: data.phone || null,
      role: "RIDER",
    },
  });

  revalidatePath("/admin/riders");
}

export async function updateRider(
  id: string,
  data: {
    name: string;
    username: string;
    phone?: string;
    password?: string;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updateData: Record<string, unknown> = {
    name: data.name,
    username: data.username,
    phone: data.phone || null,
    isActive: data.isActive,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/riders");
}

export async function deleteRider(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
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
}
