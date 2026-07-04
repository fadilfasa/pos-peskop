import { getRiders } from "@/actions/riders";
import { getActiveProducts } from "@/actions/products";
import { getLocalTodayUTC } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import AdminStocksClient from "@/app/(dashboard)/admin/stocks/AdminStocksClient";

export const dynamic = "force-dynamic";

export default async function FranchiseStocksPage() {
  const session = await auth();
  if (!session || session.user.role !== "FRANCHISE_OWNER") {
    throw new Error("Unauthorized");
  }

  const [riders, products] = await Promise.all([
    getRiders(),
    getActiveProducts(),
  ]);

  const today = getLocalTodayUTC();

  // Get rider IDs for this franchise
  const riderIds = riders.map((r: { id: string }) => r.id);

  const dailyStocks = await prisma.dailyStock.findMany({
    where: {
      date: today,
      riderId: { in: riderIds },
    },
    include: {
      items: {
        include: { product: true },
      },
      closing: true,
    },
  });

  return (
    <AdminStocksClient
      riders={riders}
      products={products}
      dailyStocks={dailyStocks}
    />
  );
}
