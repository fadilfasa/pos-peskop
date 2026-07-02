import { getRiders } from "@/actions/riders";
import { getAllFranchisesSimple } from "@/actions/franchises";
import RidersClient from "./RidersClient";

export default async function RidersPage() {
  const [riders, franchises] = await Promise.all([
    getRiders(),
    getAllFranchisesSimple(),
  ]);
  return <RidersClient riders={riders} franchises={franchises} />;
}
