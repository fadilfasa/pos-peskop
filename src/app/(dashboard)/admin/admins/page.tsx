import { getAdmins } from "@/actions/admins";
import AdminsClient from "./AdminsClient";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const admins = await getAdmins();

  return <AdminsClient admins={admins} />;
}
