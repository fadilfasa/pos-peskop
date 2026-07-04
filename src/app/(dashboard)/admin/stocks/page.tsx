import { getRiders } from "@/actions/riders";
import { getActiveProducts } from "@/actions/products";
import { getLocalTodayUTC } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import AdminStocksClient from "./AdminStocksClient";

export const dynamic = "force-dynamic";

export default async function AdminStocksPage() {
  const [riders, products] = await Promise.all([
    getRiders(),
    getActiveProducts(),
  ]);

  const today = getLocalTodayUTC();

  const dailyStocks = await prisma.dailyStock.findMany({
    where: {
      date: today,
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
