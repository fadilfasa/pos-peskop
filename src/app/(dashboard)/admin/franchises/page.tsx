import { getFranchises } from "@/actions/franchises";
import FranchisesClient from "./FranchisesClient";

export default async function AdminFranchisesPage() {
  const franchises = await getFranchises();
  return <FranchisesClient franchises={franchises} />;
}
