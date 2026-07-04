import { getRiders } from "@/actions/riders";
import RidersClient from "@/app/(dashboard)/admin/riders/RidersClient";

export const dynamic = "force-dynamic";

export default async function FranchiseRidersPage() {
  const riders = await getRiders();
  return <RidersClient riders={riders} />;
}
