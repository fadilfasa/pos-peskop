import { getAdminDashboard } from "@/actions/dashboard";
import { getAllFranchisesSimple } from "@/actions/franchises";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; franchise?: string }>;
}) {
  const { period: periodParam, franchise: franchiseParam } = await searchParams;
  const period = (periodParam as "today" | "week" | "month" | "all") || "today";
  const data = await getAdminDashboard(period, franchiseParam);
  const franchises = await getAllFranchisesSimple();

  return <AdminDashboardClient initialData={data} period={period} franchises={franchises} franchiseFilter={franchiseParam || "all"} />;
}
