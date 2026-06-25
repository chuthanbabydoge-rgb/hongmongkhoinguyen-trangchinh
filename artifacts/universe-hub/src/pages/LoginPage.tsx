import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { Loader2, LogIn, Hexagon, ExternalLink } from "lucide-react";

const ACCOUNT_PROJECT_URL = "https://hongmongkhoinguyen-taikhoanvutru--manifestanhthu3.replit.app";

export default function LoginPage() {
  const { login } = useSession();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Hexagon className="w-9 h-9 text-primary" strokeWidth={1.5} />
          <span className="text-2xl font-bold tracking-widest uppercase text-white font-mono">
            Universe Hub
          </span>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl border border-white/10 p-8">
          <h1 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
            Đăng nhập
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Dùng tài khoản Universe Account của bạn.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg px-4 py-2.5 transition mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
        </div>

        {/* Register link — goes to Account project, not Hub */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Chưa có tài khoản?{" "}
          <a
            href={`${ACCOUNT_PROJECT_URL}/register`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Tạo tài khoản tại Universe Account
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        <p className="text-center text-xs text-muted-foreground/50 mt-4 font-mono">
          SYSTEM v4.7.2 // UNIVERSE HUB
        </p>
      </div>
    </div>
  );
}
