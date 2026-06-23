import { getSalesReport } from "@/actions/dashboard";
import { getRiders } from "@/actions/riders";
import SalesReportClient from "./SalesReportClient";

export default async function SalesReportPage() {
  const [report, riders] = await Promise.all([
    getSalesReport(),
    getRiders(),
  ]);
  return <SalesReportClient initialReport={report} riders={riders} />;
}
