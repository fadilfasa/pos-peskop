import { getSalesReport } from "@/actions/dashboard";
import { getRiders } from "@/actions/riders";
import SalesReportClient from "@/app/(dashboard)/admin/reports/sales/SalesReportClient";

export default async function FranchiseSalesReportPage() {
  const [report, riders] = await Promise.all([
    getSalesReport(),
    getRiders(),
  ]);
  return <SalesReportClient initialReport={report} riders={riders} />;
}
