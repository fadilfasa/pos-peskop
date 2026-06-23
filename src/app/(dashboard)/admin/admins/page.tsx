import { getAdmins } from "@/actions/admins";
import AdminsClient from "./AdminsClient";

export default async function AdminsPage() {
  const admins = await getAdmins();

  return <AdminsClient admins={admins} />;
}
