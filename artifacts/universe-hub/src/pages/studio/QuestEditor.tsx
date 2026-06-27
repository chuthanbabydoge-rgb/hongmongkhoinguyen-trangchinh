import { ScrollText } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function QuestEditor() {
  return <StudioDocEditor type="QUEST" label="Quest Editor" icon={ScrollText} color="text-yellow-400" description="Thiết kế quest, objective, reward, trigger" />;
}
