import { getTodayStock } from "@/actions/stocks";
import { getTodayTransactions } from "@/actions/transactions";
import { getTodayExpenses } from "@/actions/expenses";
import ClosingClient from "./ClosingClient";
import { redirect } from "next/navigation";

export default async function ClosingPage() {
  const todayStock = await getTodayStock();

  if (!todayStock) {
    redirect("/rider/stock");
  }

  if (todayStock.closing) {
    redirect("/rider");
  }

  const [transactions, expenses] = await Promise.all([
    getTodayTransactions(),
    getTodayExpenses(),
  ]);

  return (
    <ClosingClient
      dailyStockId={todayStock.id}
      stockItems={todayStock.items}
      transactions={transactions}
      expenses={expenses}
    />
  );
}
