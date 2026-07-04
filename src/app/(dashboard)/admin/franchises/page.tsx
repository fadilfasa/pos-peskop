import { getFranchises } from "@/actions/franchises";
import FranchisesClient from "./FranchisesClient";

export const dynamic = "force-dynamic";

export default async function AdminFranchisesPage() {
  const franchises = await getFranchises();
  return <FranchisesClient franchises={franchises} />;
}
