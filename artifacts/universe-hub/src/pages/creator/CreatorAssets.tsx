import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Upload, Loader2, Image, FileCode, FileText, Box } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string; name: string; type: string; url: string; size: number;
  mimeType?: string; projectId?: string; createdAt: string;
}

const ASSET_ICONS: Record<string, React.ReactNode> = {
  IMAGE:  <Image className="w-5 h-5 text-blue-400" />,
  MODEL:  <Box className="w-5 h-5 text-purple-400" />,
  JSON:   <FileCode className="w-5 h-5 text-yellow-400" />,
  SCRIPT: <FileCode className="w-5 h-5 text-green-400" />,
  TEXT:   <FileText className="w-5 h-5 text-gray-400" />,
  ICON:   <Image className="w-5 h-5 text-orange-400" />,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function CreatorAssets() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", type: "IMAGE", url: "" });

  const { data, isLoading } = useQuery<{ ok: boolean; data: Asset[] }>({
    queryKey: ["creator", "assets"],
    queryFn: async () => {
      const res = await fetch("/api/creator/assets", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Asset[] }>;
    },
    enabled: !!accessToken,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/creator/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(uploadForm),
      });
      return res.json() as Promise<{ ok: boolean; error?: string }>;
    },
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ["creator", "assets"] });
        toast({ title: "Asset đã upload!" });
        setShowUpload(false);
        setUploadForm({ name: "", type: "IMAGE", url: "" });
      } else {
        toast({ title: data.error ?? "Lỗi", variant: "destructive" });
      }
    },
  });

  const assets = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />Asset Library
              </h1>
              <Button className="gap-2" onClick={() => setShowUpload(v => !v)}>
                <Upload className="w-4 h-4" />Upload Asset
              </Button>
            </div>

            {showUpload && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h2 className="font-semibold text-white">Upload Asset mới</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tên asset</label>
                    <Input className="bg-white/5 border-white/10" placeholder="my-image.png"
                      value={uploadForm.name} onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Loại</label>
                    <select value={uploadForm.type} onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                      {["IMAGE","MODEL","JSON","SCRIPT","TEXT","ICON"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">URL</label>
                  <Input className="bg-white/5 border-white/10" placeholder="https://..."
                    value={uploadForm.url} onChange={e => setUploadForm(f => ({ ...f, url: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => uploadMutation.mutate()} disabled={!uploadForm.name || !uploadForm.url || uploadMutation.isPending}>
                    {uploadMutation.isPending ? "Đang upload..." : "Upload"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowUpload(false)}>Hủy</Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : assets.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có asset nào</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowUpload(true)}>
                  <Upload className="w-4 h-4 mr-1" />Upload Asset đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assets.map(a => (
                  <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                    <div className="flex items-start gap-3">
                      {ASSET_ICONS[a.type] ?? <Package className="w-5 h-5 text-muted-foreground" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.type} · {formatSize(a.size)}</p>
                      </div>
                    </div>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 text-xs text-primary hover:underline truncate block">
                        {a.url}
                      </a>
                    )}
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
