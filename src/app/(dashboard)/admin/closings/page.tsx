import { getClosingHistory } from "@/actions/closings";
import { getRiders } from "@/actions/riders";
import { getAllFranchisesSimple } from "@/actions/franchises";
import ClosingsClient from "./ClosingsClient";

export default async function ClosingsPage() {
  const [closings, riders, franchises] = await Promise.all([
    getClosingHistory(),
    getRiders(),
    getAllFranchisesSimple(),
  ]);
  return <ClosingsClient initialClosings={closings} riders={riders} franchises={franchises} />;
}
