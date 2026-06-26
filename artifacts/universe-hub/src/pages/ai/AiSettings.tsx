import { useState } from "react";
import { Link } from "wouter";
import { Settings, ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

export default function AiSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "Nova", tone: "friendly", language: "vi" });

  const handleSave = () => { toast({ title: "Đã lưu cài đặt AI!" }); };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <Link href="/ai"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button></Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-primary" />Cài đặt AI Companion</h1>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <div className="font-bold text-white">{form.name}</div>
                  <div className="text-sm text-muted-foreground">AI Companion của bạn</div>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tên AI</label>
                <Input className="bg-white/5 border-white/10" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nova" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phong cách giao tiếp</label>
                <select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="friendly">Thân thiện</option>
                  <option value="professional">Chuyên nghiệp</option>
                  <option value="casual">Bình thường</option>
                  <option value="concise">Ngắn gọn</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Ngôn ngữ</label>
                <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-sm text-muted-foreground">
                <p className="font-medium text-white/60 mb-1">AI Provider</p>
                <p>Cấu hình qua biến môi trường <code className="bg-white/10 px-1 rounded font-mono text-xs">AI_PROVIDER</code>, <code className="bg-white/10 px-1 rounded font-mono text-xs">OPENAI_API_KEY</code>, hoặc <code className="bg-white/10 px-1 rounded font-mono text-xs">GEMINI_API_KEY</code>.</p>
              </div>
              <Button className="w-full" onClick={handleSave}>💾 Lưu cài đặt</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
