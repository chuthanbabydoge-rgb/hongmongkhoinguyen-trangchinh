import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  ArrowLeft, Eye, Star, GitFork, Globe, Lock, Send, Clock,
  Users, MessageSquare, GitBranch, Upload, Loader2, StarOff,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string; name: string; description?: string; type: string; status: string;
  viewCount: number; forkCount: number; likeCount: number; isPublic: boolean;
  ownerId: string; createdAt: string; updatedAt: string; publishedAt?: string;
  content?: Record<string, unknown>; tags?: string[];
}
interface Comment { id: string; userId: string; content: string; createdAt: string; }
interface Version { id: string; version: number; label?: string; createdAt: string; savedBy: string; }
interface Member { id: string; userId: string; role: string; joinedAt: string; }

const TYPE_ICONS: Record<string, string> = {
  WORLD: "🌍", NPC: "🤖", QUEST: "📜", BUSINESS: "🏪", STORY: "📖",
  EVENT: "🎪", TOURNAMENT: "🏆", SHOP: "🛒", GUILD: "⚔️", DUNGEON: "🏰",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-yellow-400", PRIVATE: "text-gray-400", PUBLIC: "text-blue-400",
  PUBLISHED: "text-green-400", ARCHIVED: "text-red-400",
};

export default function CreatorProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [tab, setTab] = useState<"overview" | "versions" | "members" | "comments">("overview");

  const { data: projData, isLoading } = useQuery<{ ok: boolean; data: Project }>({
    queryKey: ["creator", "project", id],
    queryFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}`,
        accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined);
      return res.json() as Promise<{ ok: boolean; data: Project }>;
    },
    enabled: !!id,
  });

  const { data: commentsData } = useQuery<{ ok: boolean; data: Comment[] }>({
    queryKey: ["creator", "project", id, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/comments`);
      return res.json() as Promise<{ ok: boolean; data: Comment[] }>;
    },
    enabled: !!id,
  });

  const { data: versionsData } = useQuery<{ ok: boolean; data: Version[] }>({
    queryKey: ["creator", "project", id, "versions"],
    queryFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/versions`);
      return res.json() as Promise<{ ok: boolean; data: Version[] }>;
    },
    enabled: !!id,
  });

  const { data: membersData } = useQuery<{ ok: boolean; data: Member[] }>({
    queryKey: ["creator", "project", id, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/members`);
      return res.json() as Promise<{ ok: boolean; data: Member[] }>;
    },
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({}),
      });
      return res.json() as Promise<{ ok: boolean; error?: string }>;
    },
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["creator"] }); toast({ title: "Published!" }); }
      else toast({ title: d.error ?? "Lỗi", variant: "destructive" });
    },
  });

  const savVersionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/version`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ label: versionLabel }),
      });
      return res.json() as Promise<{ ok: boolean; error?: string }>;
    },
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["creator", "project", id, "versions"] }); toast({ title: "Version đã lưu!" }); setVersionLabel(""); }
      else toast({ title: d.error ?? "Lỗi", variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content: comment }),
      });
      return res.json() as Promise<{ ok: boolean; error?: string }>;
    },
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["creator", "project", id, "comments"] }); toast({ title: "Đã bình luận!" }); setComment(""); }
      else toast({ title: d.error ?? "Lỗi", variant: "destructive" });
    },
  });

  const favMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/creator/projects/${id ?? ""}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["creator"] }); toast({ title: "Đã thêm vào yêu thích!" }); },
  });

  const project = projData?.data;
  const comments = commentsData?.data ?? [];
  const versions = versionsData?.data ?? [];
  const members = membersData?.data ?? [];
  const isOwner = user?.id === project?.ownerId;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Project không tồn tại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/creator/projects">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button>
            </Link>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{TYPE_ICONS[project.type] ?? "🎨"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                    {project.isPublic ? <Globe className="w-4 h-4 text-blue-400" /> : <Lock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{project.type}</span>
                    <span className={`text-xs font-mono ${STATUS_COLORS[project.status] ?? ""}`}>{project.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isOwner && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => favMutation.mutate()}>
                      <Star className="w-3 h-3" />Yêu thích
                    </Button>
                  )}
                  {isOwner && project.status !== "PUBLISHED" && (
                    <Button size="sm" className="gap-1" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                      <Globe className="w-3 h-3" />Publish
                    </Button>
                  )}
                </div>
              </div>

              {project.description && <p className="text-sm text-muted-foreground mb-4">{project.description}</p>}

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-white/10">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{project.viewCount} lượt xem</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4" />{project.likeCount} yêu thích</span>
                <span className="flex items-center gap-1"><GitFork className="w-4 h-4" />{project.forkCount} fork</span>
              </div>
            </div>

            <div className="flex border-b border-white/10">
              {(["overview","versions","members","comments"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors capitalize border-b-2 ${tab === t ? "border-primary text-white" : "border-transparent text-muted-foreground hover:text-white"}`}>
                  {t === "overview" ? "Tổng quan" : t === "versions" ? `Versions (${versions.length})` : t === "members" ? `Thành viên (${members.length})` : `Bình luận (${comments.length})`}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3">Nội dung project</h3>
                <pre className="text-xs text-muted-foreground bg-black/20 rounded-lg p-4 overflow-auto max-h-60">
                  {JSON.stringify(project.content ?? {}, null, 2)}
                </pre>
              </div>
            )}

            {tab === "versions" && (
              <div className="space-y-4">
                {isOwner && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-2">
                    <Input className="bg-white/5 border-white/10 flex-1" placeholder="Label (tùy chọn)"
                      value={versionLabel} onChange={e => setVersionLabel(e.target.value)} />
                    <Button size="sm" onClick={() => savVersionMutation.mutate()} disabled={savVersionMutation.isPending}>
                      <Clock className="w-3 h-3 mr-1" />Lưu Version
                    </Button>
                  </div>
                )}
                {versions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có version nào</p>
                ) : versions.map(v => (
                  <div key={v.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">v{v.version}{v.label ? ` — ${v.label}` : ""}</p>
                      <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "members" && (
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có thành viên nào</p>
                ) : members.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <Users className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{m.userId}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">{m.role}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "comments" && (
              <div className="space-y-4">
                {accessToken && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-2">
                    <Input className="bg-white/5 border-white/10 flex-1" placeholder="Viết bình luận..."
                      value={comment} onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && comment.trim()) commentMutation.mutate(); }} />
                    <Button size="sm" onClick={() => commentMutation.mutate()}
                      disabled={!comment.trim() || commentMutation.isPending}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có bình luận nào</p>
                ) : comments.map(c => (
                  <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{c.userId}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(c.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                    <p className="text-sm text-white">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
