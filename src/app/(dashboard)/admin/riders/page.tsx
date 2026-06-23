import { getRiders } from "@/actions/riders";
import RidersClient from "./RidersClient";

export default async function RidersPage() {
  const riders = await getRiders();
  return <RidersClient riders={riders} />;
}
