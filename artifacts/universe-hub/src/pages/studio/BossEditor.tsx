import { Skull } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function BossEditor() {
  return <StudioDocEditor type="BOSS" label="Boss Editor" icon={Skull} color="text-red-400" description="Tạo boss AI, phase, kỹ năng, spawn logic" />;
}
