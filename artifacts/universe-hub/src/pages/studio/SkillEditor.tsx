import { Zap } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function SkillEditor() {
  return <StudioDocEditor type="SKILL" label="Skill Editor" icon={Zap} color="text-cyan-400" description="Thiết kế kỹ năng, hiệu ứng, combo, cooldown" />;
}
