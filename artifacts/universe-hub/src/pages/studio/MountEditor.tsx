import { Swords } from "lucide-react";
import { StudioDocEditor } from "@/components/studio/StudioDocEditor";

export default function MountEditor() {
  return <StudioDocEditor type="MOUNT" label="Mount Editor" icon={Swords} color="text-indigo-400" description="Thiết kế mount, route du hành, trang bị, kỹ năng" />;
}
