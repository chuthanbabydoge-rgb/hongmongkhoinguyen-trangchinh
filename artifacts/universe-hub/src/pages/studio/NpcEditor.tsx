import { Users } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function NpcEditor() {
  return <StudioDocEditor type="NPC" label="NPC Editor" icon={Users} color="text-green-400" description="Tạo NPC với AI behavior, dialog, quest giver" />;
}
