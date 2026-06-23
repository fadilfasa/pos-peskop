import { getRiderDashboard } from "@/actions/dashboard";
import RiderDashboardClient from "./RiderDashboardClient";

export default async function RiderDashboardPage() {
  const data = await getRiderDashboard();
  return <RiderDashboardClient data={data} />;
}
