import { getAdminDashboard } from "@/actions/dashboard";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = (periodParam as "today" | "week" | "month" | "all") || "today";
  const data = await getAdminDashboard(period);

  return <AdminDashboardClient initialData={data} period={period} />;
}
