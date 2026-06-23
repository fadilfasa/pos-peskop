import { getTodayStock } from "@/actions/stocks";
import { getTodayExpenses } from "@/actions/expenses";
import ExpensesClient from "./ExpensesClient";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const todayStock = await getTodayStock();

  if (!todayStock) {
    redirect("/rider/stock");
  }

  if (todayStock.closing) {
    redirect("/rider");
  }

  const expenses = await getTodayExpenses();

  return (
    <ExpensesClient dailyStockId={todayStock.id} expenses={expenses} />
  );
}
