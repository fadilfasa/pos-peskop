import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "admin"; // Ganti jika username admin Anda berbeda
  const newPassword = "password123";

  console.log(`Mencari akun admin dengan username: ${username}...`);

  const admin = await prisma.user.findUnique({
    where: { username },
  });

  if (!admin) {
    console.error(`❌ Akun admin dengan username "${username}" tidak ditemukan!`);
    process.exit(1);
  }

  console.log(`Mengatur ulang password...`);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { username },
    data: { password: hashedPassword },
  });

  console.log(`✅ Password berhasil direset!`);
  console.log(`Username: ${username}`);
  console.log(`Password Baru: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
