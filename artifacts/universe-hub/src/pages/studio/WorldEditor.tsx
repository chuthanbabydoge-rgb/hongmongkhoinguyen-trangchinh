import { Globe } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function WorldEditor() {
  return <StudioDocEditor type="WORLD" label="World Editor" icon={Globe} color="text-blue-400" description="Thiết kế thế giới, vùng đất, biome, sự kiện" />;
}
