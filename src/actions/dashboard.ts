"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLocalTodayUTC, getLogicalToday } from "@/lib/utils";

export async function getAdminDashboard(period: "today" | "week" | "month" | "all" = "today") {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const now = getLogicalToday();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  let startDate = new Date(todayStart);
  const endDate = new Date(todayEnd);

  if (period === "week") {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(startDate.setDate(diff));
  } else if (period === "month") {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  } else if (period === "all") {
    startDate = new Date(2020, 0, 1);
  }

  // Transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
    },
  });

  const totalSalesPeriod = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactionsPeriod = transactions.length;

  const localStartDateUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  const localEndDateUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  const localTodayStartUTC = new Date(Date.UTC(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate()));
  const localTodayEndUTC = new Date(Date.UTC(todayEnd.getFullYear(), todayEnd.getMonth(), todayEnd.getDate()));

  // Active riders
  const activeRiders = await prisma.user.count({
    where: { role: "RIDER", isActive: true },
  });

  // Riders stocked & closed (Always for today)
  const ridersStockedPeriod = await prisma.dailyStock.count({
    where: { date: { gte: localTodayStartUTC, lt: localTodayEndUTC } },
  });

  const ridersClosedPeriod = await prisma.dailyClosing.count({
    where: { date: { gte: localTodayStartUTC, lt: localTodayEndUTC } },
  });

  // Chart data
  const chartPoints = [];
  if (period === "today") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      chartPoints.push({ date: d, label: new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric" }).format(d), isMonth: false });
    }
  } else if (period === "week") {
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      chartPoints.push({ date: d, label: new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric" }).format(d), isMonth: false });
    }
  } else if (period === "month") {
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), i);
      chartPoints.push({ date: d, label: String(i), isMonth: false });
    }
  } else if (period === "all") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      chartPoints.push({ date: d, label: new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(d), isMonth: true });
    }
  }

  const chartData = await Promise.all(
    chartPoints.map(async (item) => {
      const qStart = item.date;
      const qEnd = new Date(qStart);
      if (item.isMonth) qEnd.setMonth(qEnd.getMonth() + 1);
      else qEnd.setDate(qEnd.getDate() + 1);

      const txs = await prisma.transaction.findMany({
        where: { createdAt: { gte: qStart, lt: qEnd } },
        select: { totalAmount: true },
      });
      const total = txs.reduce((sum, t) => sum + t.totalAmount, 0);
      return { 
        date: item.date.toISOString().split("T")[0],
        label: item.label, 
        total, 
        count: txs.length 
      };
    })
  );

  // Daily Riders (Always for today)
  const ridersWithStock = await prisma.dailyStock.findMany({
    where: { date: { gte: localTodayStartUTC, lt: localTodayEndUTC } },
    include: {
      rider: { select: { id: true, name: true } },
      items: { include: { product: true } },
      transactions: { include: { items: true } },
      expenses: true,
    }
  });

  const riderStatsMap = new Map();
  for (const ds of ridersWithStock) {
    const riderId = ds.rider.id;
    if (!riderStatsMap.has(riderId)) {
      riderStatsMap.set(riderId, {
        id: riderId,
        name: ds.rider.name,
        stokAwal: 0,
        terjual: 0,
        totalPendapatan: 0,
        totalExpenses: 0,
        cashAmount: 0,
        qrisAmount: 0,
        productsMap: new Map(),
      });
    }
    const stat = riderStatsMap.get(riderId);
    
    for (const item of ds.items) {
      stat.stokAwal += item.initialQty;
      if (!stat.productsMap.has(item.productId)) {
        stat.productsMap.set(item.productId, { name: item.product.name, unit: item.product.unit || "Lainnya", stokAwal: 0, terjual: 0 });
      }
      stat.productsMap.get(item.productId).stokAwal += item.initialQty;
    }
    
    for (const tx of ds.transactions) {
      stat.totalPendapatan += tx.totalAmount;
      if (tx.paymentMethod === 'CASH') stat.cashAmount += tx.totalAmount;
      if (tx.paymentMethod === 'QRIS') stat.qrisAmount += tx.totalAmount;
      for (const item of tx.items) {
        stat.terjual += item.qty;
        if (stat.productsMap.has(item.productId)) {
          stat.productsMap.get(item.productId).terjual += item.qty;
        } else {
          stat.productsMap.set(item.productId, { name: "Produk Unknown", unit: "Lainnya", stokAwal: 0, terjual: item.qty });
        }
      }
    }
    
    stat.totalExpenses += ds.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
  }
  
  const dailyRiders = Array.from(riderStatsMap.values()).map(stat => {
    const { productsMap, ...rest } = stat;
    return {
      ...rest,
      products: Array.from(productsMap.values()) as { name: string, unit: string, stokAwal: number, terjual: number }[],
    };
  }).sort((a, b) => b.totalPendapatan - a.totalPendapatan);

  // Expenses
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: localStartDateUTC, lt: localEndDateUTC } },
  });
  const totalExpensesPeriod = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Product sales
  const productSalesRaw = await prisma.transactionItem.groupBy({
    by: ["productId"],
    where: { transaction: { createdAt: { gte: startDate, lt: endDate } } },
    _sum: { qty: true, subtotal: true },
    orderBy: { _sum: { qty: "desc" } },
  });

  const products = await prisma.product.findMany({ select: { id: true, name: true, unit: true } });
  const productMap = Object.fromEntries(products.map((p) => [p.id, `${p.name} (${p.unit})`]));

  const productSales = productSalesRaw.map((ps) => ({
    name: productMap[ps.productId] || "Unknown",
    qty: ps._sum.qty || 0,
    subtotal: ps._sum.subtotal || 0,
  }));

  return {
    totalSalesToday: totalSalesPeriod,
    totalTransactionsToday: totalTransactionsPeriod,
    totalExpensesToday: totalExpensesPeriod,
    activeRiders,
    ridersStockedToday: ridersStockedPeriod,
    ridersClosedToday: ridersClosedPeriod,
    last7Days: chartData,
    dailyRiders,
    productSales,
  };
}

export async function getRiderDashboard() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const today = getLocalTodayUTC();

  const dailyStock = await prisma.dailyStock.findUnique({
    where: {
      riderId_date: {
        riderId: session.user.id,
        date: today,
      },
    },
    include: {
      items: { include: { product: true } },
      closing: true,
    },
  });

  const todayTransactions = dailyStock ? await prisma.transaction.findMany({
    where: {
      riderId: session.user.id,
      dailyStockId: dailyStock.id,
    },
  }) : [];

  const totalSales = todayTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0
  );
  const cashSales = todayTransactions
    .filter((t) => t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const qrisSales = todayTransactions
    .filter((t) => t.paymentMethod === "QRIS")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const todayExpenses = dailyStock ? await prisma.expense.findMany({
    where: {
      riderId: session.user.id,
      dailyStockId: dailyStock.id,
    },
  }) : [];
  const totalExpenses = todayExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );



  return {
    hasStock: !!dailyStock,
    isClosed: !!dailyStock?.closing,
    stockItems: dailyStock?.items || [],
    totalSales,
    cashSales,
    qrisSales,
    totalExpenses,
    transactionCount: todayTransactions.length,
  };
}

export async function getSalesReport(filters?: {
  riderId?: string;
  startDate?: string;
  endDate?: string;
  productUnit?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const where: Record<string, unknown> = {};

  if (filters?.riderId) {
    where.riderId = filters.riderId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters?.startDate) {
      (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      (where.createdAt as Record<string, unknown>).lt = endDate;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      rider: { select: { name: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  let totalAmount = 0;
  let cashAmount = 0;
  let qrisAmount = 0;
  const filteredTransactions = [];

  for (const t of transactions) {
    const matchingItems = filters?.productUnit
      ? t.items.filter((item) => item.product.unit === filters.productUnit)
      : t.items;

    if (matchingItems.length === 0) continue;

    const itemsSubtotal = matchingItems.reduce((sum, item) => sum + item.subtotal, 0);

    totalAmount += itemsSubtotal;
    if (t.paymentMethod === "CASH") cashAmount += itemsSubtotal;
    if (t.paymentMethod === "QRIS") qrisAmount += itemsSubtotal;

    filteredTransactions.push({
      ...t,
      items: matchingItems,
      totalAmount: itemsSubtotal,
    });
  }

  return {
    transactions: filteredTransactions,
    summary: {
      totalAmount,
      cashAmount,
      qrisAmount,
      totalCount: filteredTransactions.length,
    },
  };
}

export async function getRiderPerformance(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const riders = await prisma.user.findMany({
    where: { role: "RIDER", isActive: true },
    select: { id: true, name: true, username: true },
  });

  const where: Record<string, unknown> = {};
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters?.startDate) {
      (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      (where.createdAt as Record<string, unknown>).lt = endDate;
    }
  }

  const performance = await Promise.all(
    riders.map(async (rider) => {
      const transactions = await prisma.transaction.findMany({
        where: { riderId: rider.id, ...where },
      });

      const closings = await prisma.dailyClosing.findMany({
        where: {
          riderId: rider.id,
          ...(filters?.startDate
            ? { date: { gte: new Date(filters.startDate) } }
            : {}),
          ...(filters?.endDate
            ? { date: { lte: new Date(filters.endDate) } }
            : {}),
        },
      });

      const totalSales = transactions.reduce(
        (sum, t) => sum + t.totalAmount,
        0
      );

      const closingCount = closings.length;
      const deficitCount = closings.filter((c) => c.status === "DEFICIT").length;

      return {
        id: rider.id,
        name: rider.name,
        username: rider.username,
        totalSales,
        transactionCount: transactions.length,
        avgPerTransaction:
          transactions.length > 0
            ? Math.round(totalSales / transactions.length)
            : 0,
        closingCount,
        deficitCount,
        accuracy:
          closingCount > 0
            ? Math.round(((closingCount - deficitCount) / closingCount) * 100)
            : 0,
      };
    })
  );

  // Sort by total sales descending
  performance.sort((a, b) => b.totalSales - a.totalSales);

  return performance;
}
