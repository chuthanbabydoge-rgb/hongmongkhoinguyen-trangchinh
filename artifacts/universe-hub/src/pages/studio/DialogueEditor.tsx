import { MessageSquare } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function DialogueEditor() {
  return <StudioDocEditor type="DIALOG" label="Dialogue Editor" icon={MessageSquare} color="text-teal-400" description="Viết hội thoại với branching logic, conditions" />;
}
