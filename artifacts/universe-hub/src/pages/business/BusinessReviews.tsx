import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare, Loader2, ThumbsUp } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
      ))}
    </div>
  );
}

function CompanyReviews({ company }: { company: Record<string, unknown> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["business-reviews", company["id"]],
    queryFn:  () => fetch(`/api/business/companies/${company["id"]}/reviews`).then(r => r.json()),
  });
  const reviews: Record<string, unknown>[] = data?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-yellow-400" /></div>;
  if (reviews.length === 0) return <p className="text-xs text-muted-foreground py-2">Chưa có đánh giá nào</p>;

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r["id"] as string} className="p-4 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <StarRating rating={r["rating"] as number} />
              {r["title"] && <h4 className="text-sm font-medium text-white mt-1">{r["title"] as string}</h4>}
            </div>
            {r["isVerified"] && <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Đã xác minh</span>}
          </div>
          <p className="text-sm text-muted-foreground">{r["content"] as string}</p>
          <div className="flex items-center gap-2 mt-2">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
              <ThumbsUp className="w-3 h-3" /> {r["isHelpful"] as number} hữu ích
            </button>
            <span className="text-xs text-muted-foreground">· {new Date(r["createdAt"] as string).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BusinessReviews() {
  const { data: companiesData } = useQuery({
    queryKey: ["business-companies-reviews"],
    queryFn:  () => fetch("/api/business/companies?limit=20").then(r => r.json()),
  });
  const companies: Record<string, unknown>[] = companiesData?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Đánh giá" subtitle="Phản hồi của người dùng về các công ty" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có đánh giá nào</p>
            </div>
          ) : (
            companies.map(company => (
              <div key={company["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{(company["logo"] as string) ?? "🏢"}</span>
                  <h3 className="font-semibold text-white">{company["name"] as string}</h3>
                </div>
                <CompanyReviews company={company} />
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
