import { getClosingHistory } from "@/actions/closings";
import { getRiders } from "@/actions/riders";
import ClosingsClient from "./ClosingsClient";

export default async function ClosingsPage() {
  const [closings, riders] = await Promise.all([
    getClosingHistory(),
    getRiders(),
  ]);
  return <ClosingsClient initialClosings={closings} riders={riders} />;
}
