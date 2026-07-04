import { getRawMaterials } from "@/actions/raw-materials";
import RawMaterialsClient from "./RawMaterialsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stok Bahan Baku | PESKOP",
};

export default async function RawMaterialsPage() {
  const materials = await getRawMaterials();

  return <RawMaterialsClient initialData={materials} />;
}
