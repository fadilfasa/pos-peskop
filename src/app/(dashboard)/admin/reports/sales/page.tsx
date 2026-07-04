import { getSalesReport } from "@/actions/dashboard";
import { getRiders } from "@/actions/riders";
import { getAllFranchisesSimple } from "@/actions/franchises";
import SalesReportClient from "./SalesReportClient";

export const dynamic = "force-dynamic";

export default async function SalesReportPage() {
  const [report, riders, franchises] = await Promise.all([
    getSalesReport(),
    getRiders(),
    getAllFranchisesSimple(),
  ]);
  return <SalesReportClient initialReport={report} riders={riders} franchises={franchises} />;
}
