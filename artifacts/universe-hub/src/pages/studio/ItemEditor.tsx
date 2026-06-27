import { Package } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function ItemEditor() {
  return <StudioDocEditor type="ITEM" label="Item Editor" icon={Package} color="text-purple-400" description="Tạo vật phẩm, stats, enchant, rarity" />;
}
