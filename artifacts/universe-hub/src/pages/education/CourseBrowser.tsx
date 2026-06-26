import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { GraduationCap, Search, Filter, Star, Users, Clock, Loader2, BookOpen } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Course {
  id: string; title: string; description?: string; teacherId: string;
  level: string; price: number; duration: number; rating: number; students: number; status: string;
}
interface Category { id: string; name: string; slug: string; icon?: string; }

const LEVELS = ["", "BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER"];
const LEVEL_LABELS: Record<string, string> = {
  "": "Tất cả", BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", MASTER: "Bậc thầy",
};
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "text-green-400", INTERMEDIATE: "text-blue-400", ADVANCED: "text-purple-400", MASTER: "text-yellow-400",
};

export default function CourseBrowser() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: catData } = useQuery<{ ok: boolean; data: Category[] }>({
    queryKey: ["education", "categories"],
    queryFn: async () => (await fetch("/api/education/categories")).json() as Promise<{ ok: boolean; data: Category[] }>,
  });
  const categories = catData?.data ?? [];

  const params = new URLSearchParams({ limit: "24" });
  if (search) params.set("search", search);
  if (level) params.set("level", level);
  if (categoryId) params.set("categoryId", categoryId);

  const { data, isLoading } = useQuery<{ ok: boolean; data: Course[] }>({
    queryKey: ["education", "courses", search, level, categoryId],
    queryFn: async () => (await fetch(`/api/education/courses?${params}`)).json() as Promise<{ ok: boolean; data: Course[] }>,
  });
  const courses = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary" /> Khám phá Khoá học
            </h1>
            <Link href="/education"><Button variant="outline" size="sm">← Dashboard</Button></Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm khoá học..." className="pl-9 bg-white/5 border-white/10"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(l => (
                <Button key={l} size="sm" variant={level === l ? "default" : "outline"}
                  onClick={() => setLevel(l)} className={level === l ? "bg-primary" : ""}>
                  {LEVEL_LABELS[l]}
                </Button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={categoryId === "" ? "default" : "outline"}
                onClick={() => setCategoryId("")} className={categoryId === "" ? "bg-primary/20 text-primary" : ""}>
                Tất cả
              </Button>
              {categories.map(cat => (
                <Button key={cat.id} size="sm" variant={categoryId === cat.id ? "default" : "outline"}
                  onClick={() => setCategoryId(cat.id)} className={categoryId === cat.id ? "bg-primary/20 text-primary" : ""}>
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Không tìm thấy khoá học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((c) => (
                <Link key={c.id} href={`/education/courses/${c.id}`}>
                  <div className="glass-panel rounded-xl border border-white/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                      <GraduationCap className="w-14 h-14 text-primary/40" />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{c.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className={LEVEL_COLORS[c.level] ?? "text-white"}>{LEVEL_LABELS[c.level] ?? c.level}</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {c.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Users className="w-3 h-3" />{c.students.toLocaleString()}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration} phút</div>
                      </div>
                      <div className="pt-1 border-t border-white/5">
                        <span className="text-sm font-bold text-primary">
                          {c.price === 0 ? "🆓 Miễn phí" : `${c.price.toLocaleString()}đ`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
