import { Heart } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function PetEditor() {
  return <StudioDocEditor type="PET" label="Pet Editor" icon={Heart} color="text-pink-400" description="Tạo pet, tiến hóa, kỹ năng, rarity" />;
}
