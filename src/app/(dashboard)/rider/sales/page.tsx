import { getTodayStock } from "@/actions/stocks";
import { getTodayTransactions } from "@/actions/transactions";
import SalesClient from "./SalesClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const todayStock = await getTodayStock();

  if (!todayStock) {
    redirect("/rider/stock");
  }

  if (todayStock.closing) {
    redirect("/rider");
  }

  const transactions = await getTodayTransactions();

  return (
    <SalesClient
      dailyStockId={todayStock.id}
      stockItems={todayStock.items}
      transactions={transactions}
    />
  );
}
