import { Mountain } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function DungeonEditor() {
  return <StudioDocEditor type="DUNGEON" label="Dungeon Editor" icon={Mountain} color="text-orange-400" description="Thiết kế dungeon, phòng, bẫy, loot table" />;
}
