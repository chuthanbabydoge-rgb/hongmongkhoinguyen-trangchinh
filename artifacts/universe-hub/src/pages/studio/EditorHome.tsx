import { Wand2, Globe, Users, ScrollText, Skull, Swords, Package, Zap, Heart, Mountain, Building2, Trophy, GraduationCap, Briefcase, MessageSquare } from "lucide-react";
import { Link } from "wouter";

const EDITORS = [
  { label: "World Editor",      icon: Globe,          path: "/studio/world-editor",    color: "text-blue-400",   desc: "Thiết kế thế giới, vùng đất, biome" },
  { label: "NPC Editor",        icon: Users,          path: "/studio/npc-editor",       color: "text-green-400",  desc: "Tạo NPC với AI behavior tree" },
  { label: "Quest Editor",      icon: ScrollText,     path: "/studio/quest-editor",     color: "text-yellow-400", desc: "Thiết kế quest, objective, reward" },
  { label: "Boss Editor",       icon: Skull,          path: "/studio/boss-editor",      color: "text-red-400",    desc: "Tạo boss AI, phase, kỹ năng" },
  { label: "Dungeon Editor",    icon: Mountain,       path: "/studio/dungeon-editor",   color: "text-orange-400", desc: "Thiết kế dungeon, phòng, bẫy" },
  { label: "Item Editor",       icon: Package,        path: "/studio/item-editor",      color: "text-purple-400", desc: "Tạo vật phẩm, stats, enchant" },
  { label: "Skill Editor",      icon: Zap,            path: "/studio/skill-editor",     color: "text-cyan-400",   desc: "Thiết kế kỹ năng, hiệu ứng, combo" },
  { label: "Pet Editor",        icon: Heart,          path: "/studio/pet-editor",       color: "text-pink-400",   desc: "Tạo pet, tiến hóa, kỹ năng" },
  { label: "Mount Editor",      icon: Swords,         path: "/studio/mount-editor",     color: "text-indigo-400", desc: "Thiết kế mount, route, trang bị" },
  { label: "Building Editor",   icon: Building2,      path: "/studio/building-editor",  color: "text-amber-400",  desc: "Tạo công trình, nội thất, utility" },
  { label: "Dialogue Editor",   icon: MessageSquare,  path: "/studio/dialogue-editor",  color: "text-teal-400",   desc: "Viết hội thoại với branching logic" },
  { label: "Sports Editor",     icon: Trophy,         path: "/studio/sports-editor",    color: "text-lime-400",   desc: "Tạo giải đấu, đội, vận động viên" },
  { label: "Education Editor",  icon: GraduationCap,  path: "/studio/education-editor", color: "text-sky-400",    desc: "Thiết kế khoá học, bài thi, chứng chỉ" },
  { label: "Company Editor",    icon: Briefcase,      path: "/studio/company-editor",   color: "text-violet-400", desc: "Tạo công ty, phòng ban, sản phẩm" },
  { label: "Visual Scripts",    icon: Wand2,          path: "/studio/visual-script",    color: "text-fuchsia-400",desc: "Node-based visual scripting engine" },
];

export default function EditorHome() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wand2 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white">Chọn Editor</h1>
          <p className="text-muted-foreground text-sm">Chọn loại editor để bắt đầu sáng tạo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EDITORS.map((ed) => (
          <Link key={ed.label} href={ed.path}>
            <div className="rounded-xl border border-white/10 bg-white/3 hover:border-primary/40 hover:bg-white/5 p-5 cursor-pointer transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <ed.icon className={`w-6 h-6 ${ed.color} group-hover:scale-110 transition-transform`} />
                <span className="font-semibold text-white">{ed.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ed.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
