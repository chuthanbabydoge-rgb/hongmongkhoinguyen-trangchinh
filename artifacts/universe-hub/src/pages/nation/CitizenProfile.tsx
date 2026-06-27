import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, BadgeCheck, Star, Passport, Globe, Users } from "lucide-react";
import { Link } from "wouter";

export default function CitizenProfile() {
  const { data, isLoading } = useQuery({
    queryKey: ["citizen-me"],
    queryFn: () => fetch("/api/nation/citizens/me").then(r => r.json()).then(r => r.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  if (!data) return (
    <div className="p-6 max-w-xl mx-auto mt-12 text-center">
      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Chưa có hồ sơ công dân</h2>
      <p className="text-muted-foreground mb-6">Bạn chưa đăng ký công dân của Universe Prime</p>
      <Link href="/nation/citizens/register" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">Đăng ký ngay</Link>
    </div>
  );

  const c = data.citizenship;
  const p = data.profile;
  const passport = data.passport;
  const visa = data.visa;
  const titles = data.titles ?? [];

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-7 h-7 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Hồ sơ Công dân</h1>
      </div>

      {/* Citizen Card */}
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BadgeCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mã công dân</p>
            <p className="text-2xl font-bold text-white font-mono">{c.citizenId}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>{c.status}</span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Điểm trung thành</p>
            <p className="text-2xl font-bold text-amber-400">{p?.loyaltyScore ?? 0}</p>
            <p className="text-xs text-muted-foreground">Quyền bầu cử: {p?.votingRights ? "✅" : "❌"}</p>
          </div>
        </div>
        {p && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
            <div><p className="text-xs text-muted-foreground">Nghề nghiệp</p><p className="text-sm text-white">{p.occupation || "Chưa cập nhật"}</p></div>
            <div><p className="text-xs text-muted-foreground">Địa chỉ</p><p className="text-sm text-white">{p.address || "Chưa cập nhật"}</p></div>
          </div>
        )}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-muted-foreground">
          <span>Đăng ký: {new Date(c.registeredAt).toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Passport */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">🛂 Hộ chiếu</h3>
            {!passport && <Link href="/nation/passport" className="text-xs text-blue-400 hover:text-blue-300">Xin cấp →</Link>}
          </div>
          {passport ? (
            <div>
              <p className="text-xs text-muted-foreground">Số hộ chiếu</p>
              <p className="text-lg font-bold text-white font-mono">{passport.passportNumber}</p>
              <p className="text-xs text-muted-foreground mt-2">Hết hạn: {new Date(passport.expiresAt).toLocaleDateString("vi-VN")}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${passport.status === "VALID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{passport.status}</span>
            </div>
          ) : <p className="text-sm text-muted-foreground">Chưa có hộ chiếu</p>}
        </div>

        {/* Visa */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">🌏 Visa</h3>
            {!visa && <Link href="/nation/visa" className="text-xs text-blue-400 hover:text-blue-300">Xin visa →</Link>}
          </div>
          {visa ? (
            <div>
              <p className="text-xs text-muted-foreground">Số visa</p>
              <p className="text-lg font-bold text-white font-mono">{visa.visaNumber}</p>
              <p className="text-xs text-muted-foreground mt-2">Hết hạn: {visa.expiresAt ? new Date(visa.expiresAt).toLocaleDateString("vi-VN") : "N/A"}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${visa.status === "APPROVED" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>{visa.status}</span>
            </div>
          ) : <p className="text-sm text-muted-foreground">Chưa có visa</p>}
        </div>
      </div>

      {/* Titles */}
      {titles.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-amber-400" /> Danh hiệu</h3>
          <div className="flex flex-wrap gap-2">
            {titles.map((t: Record<string, string>) => (
              <span key={t.id} className="text-xs px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">{t.title}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
