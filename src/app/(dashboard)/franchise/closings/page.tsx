import { getClosingHistory } from "@/actions/closings";
import { getRiders } from "@/actions/riders";
import ClosingsClient from "@/app/(dashboard)/admin/closings/ClosingsClient";

export default async function FranchiseClosingsPage() {
  const [closings, riders] = await Promise.all([
    getClosingHistory(),
    getRiders(),
  ]);
  return <ClosingsClient initialClosings={closings} riders={riders} />;
}
