import { getRiderDashboard } from "@/actions/dashboard";
import RiderDashboardClient from "./RiderDashboardClient";

export const dynamic = "force-dynamic";

export default async function RiderDashboardPage() {
  const data = await getRiderDashboard();
  return <RiderDashboardClient data={data} />;
}
