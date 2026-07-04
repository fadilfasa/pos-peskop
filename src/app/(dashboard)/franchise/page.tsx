import { getFranchiseDashboard } from "@/actions/dashboard";
import FranchiseDashboardClient from "./FranchiseDashboardClient";

export const dynamic = "force-dynamic";

export default async function FranchiseDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = (periodParam as "today" | "week" | "month" | "all") || "today";
  const data = await getFranchiseDashboard(period);

  return <FranchiseDashboardClient initialData={data} period={period} />;
}
