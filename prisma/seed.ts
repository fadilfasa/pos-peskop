import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.dailyClosing.deleteMany();
  await prisma.dailyStockItem.deleteMany();
  await prisma.dailyStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      phone: "081234567890",
    },
  });
  console.log("✅ Admin created:", admin.username);

  // Create Riders
  const riders = await Promise.all([
    prisma.user.create({
      data: {
        name: "Budi Santoso",
        username: "rider1",
        password: hashedPassword,
        role: "RIDER",
        phone: "081111111111",
      },
    }),
    prisma.user.create({
      data: {
        name: "Andi Pratama",
        username: "rider2",
        password: hashedPassword,
        role: "RIDER",
        phone: "082222222222",
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Rahmawati",
        username: "rider3",
        password: hashedPassword,
        role: "RIDER",
        phone: "083333333333",
      },
    }),
  ]);
  console.log("✅ Riders created:", riders.length);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: { name: "Es Kopi Susu", price: 15000, unit: "150 ml" },
    }),
    prisma.product.create({
      data: { name: "Es Kopi Hitam", price: 12000, unit: "150 ml" },
    }),
    prisma.product.create({
      data: { name: "Es Kopi Gula Aren", price: 18000, unit: "150 ml" },
    }),
    prisma.product.create({
      data: { name: "Es Matcha Latte", price: 20000, unit: "150 ml" },
    }),
    prisma.product.create({
      data: { name: "Es Coklat", price: 15000, unit: "150 ml" },
    }),
    prisma.product.create({
      data: { name: "Thai Tea", price: 12000, unit: "150 ml" },
    }),
  ]);
  console.log("✅ Products created:", products.length);

  // Create sample data for the past 7 days
  for (let dayOffset = 6; dayOffset >= 1; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    for (const rider of riders) {
      // Daily Stock
      const dailyStock = await prisma.dailyStock.create({
        data: {
          riderId: rider.id,
          date: date,
          items: {
            create: products.map((p) => ({
              productId: p.id,
              initialQty: 15 + Math.floor(Math.random() * 10),
              soldQty: 0,
              remainingQty: 15,
            })),
          },
        },
        include: { items: true },
      });

      // Generate random transactions
      const transactionCount = 3 + Math.floor(Math.random() * 8);
      let totalCash = 0;
      let totalQris = 0;

      for (let t = 0; t < transactionCount; t++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        const paymentMethod = Math.random() > 0.4 ? "CASH" : "QRIS";
        const total = product.price * qty;

        if (paymentMethod === "CASH") totalCash += total;
        else totalQris += total;

        const txDate = new Date(date);
        txDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

        await prisma.transaction.create({
          data: {
            riderId: rider.id,
            dailyStockId: dailyStock.id,
            paymentMethod: paymentMethod as "CASH" | "QRIS",
            totalAmount: total,
            transactionDate: txDate,
            createdAt: txDate,
            items: {
              create: {
                productId: product.id,
                qty,
                price: product.price,
                subtotal: total,
              },
            },
          },
        });

        // Update stock
        await prisma.dailyStockItem.update({
          where: {
            dailyStockId_productId: {
              dailyStockId: dailyStock.id,
              productId: product.id,
            },
          },
          data: {
            soldQty: { increment: qty },
            remainingQty: { decrement: qty },
          },
        });
      }

      // Expenses
      const expenseAmount = 5000 + Math.floor(Math.random() * 20000);
      await prisma.expense.create({
        data: {
          riderId: rider.id,
          dailyStockId: dailyStock.id,
          date: date,
          category: ["FUEL", "FOOD", "PARKING"][Math.floor(Math.random() * 3)] as "FUEL" | "FOOD" | "PARKING",
          amount: expenseAmount,
          description: "Pengeluaran operasional",
        },
      });

      // Closing
      const expectedDeposit = totalCash - expenseAmount;
      const variance = Math.floor(Math.random() * 3000) - 1000;
      const actualDeposit = expectedDeposit + variance;
      const difference = actualDeposit - expectedDeposit;

      let status: "BALANCED" | "SURPLUS" | "DEFICIT" = "BALANCED";
      if (difference > 0) status = "SURPLUS";
      if (difference < 0) status = "DEFICIT";

      await prisma.dailyClosing.create({
        data: {
          riderId: rider.id,
          dailyStockId: dailyStock.id,
          date: date,
          totalSalesCash: totalCash,
          totalSalesQris: totalQris,
          totalExpenses: expenseAmount,
          expectedDeposit,
          actualDeposit,
          difference,
          status,
          notes: difference !== 0 ? "Selisih kecil" : null,
        },
      });
    }
  }

  console.log("✅ Sample data created for 6 days");
  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin: admin / password123");
  console.log("   Rider: rider1 / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
