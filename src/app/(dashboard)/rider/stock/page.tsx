import { getTodayStock } from "@/actions/stocks";
import { getActiveProducts } from "@/actions/products";
import StockClient from "./StockClient";

export default async function StockPage() {
  const [todayStock, products] = await Promise.all([
    getTodayStock(),
    getActiveProducts(),
  ]);
  return <StockClient todayStock={todayStock} products={products} />;
}
