import { Link } from "wouter";
import { useDailyQuests, useMyQuests, useClaimQuest, calcProgress, getDifficultyStyle, type UserQuestEntry } from "@/hooks/useQuests";
import { Sword, Gift, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";

function MiniQuestRow({ entry }: { entry: UserQuestEntry }) {
  const { quest, userQuest } = entry;
  const progress = calcProgress(userQuest, quest);
  const claim = useClaimQuest();
  const isCompleted = userQuest.status === "COMPLETED";
  const diffStyle = getDifficultyStyle(quest.difficulty);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-mono px-1 py-0.5 rounded border ${diffStyle}`}>{quest.difficulty}</span>
          {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-400" />}
        </div>
        <p className="text-xs text-white font-medium truncate">{quest.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-400" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground font-mono">{progress}%</span>
        </div>
      </div>
      {isCompleted && (
        <button
          onClick={(e) => { e.preventDefault(); claim.mutate(userQuest.id); }}
          disabled={claim.isPending}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-400/20 text-[10px] font-mono transition-all disabled:opacity-50"
        >
          {claim.isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Gift className="w-2.5 h-2.5" />}
          Nhận
        </button>
      )}
    </div>
  );
}

export function QuestWidget() {
  const daily    = useDailyQuests();
  const myQuests = useMyQuests();

  const claimable   = myQuests.data?.filter(e => e.userQuest.status === "COMPLETED") ?? [];
  const inProgress  = myQuests.data?.filter(e => e.userQuest.status === "IN_PROGRESS") ?? [];
  const displayList = [...claimable, ...inProgress].slice(0, 4);

  return (
    <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sword className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Nhiệm vụ của tôi</span>
          {claimable.length > 0 && (
            <span className="min-w-[18px] h-[18px] rounded-full bg-green-400/20 border border-green-400/30 text-green-400 text-[9px] font-mono font-bold flex items-center justify-center px-1">
              {claimable.length}
            </span>
          )}
        </div>
        <Link href="/quests">
          <span className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer">
            Xem tất cả <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      <div className="p-4">
        {myQuests.isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-xs">Đang tải...</div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-muted-foreground">Chưa có quest nào đang làm.</p>
            <Link href="/quests">
              <span className="text-xs text-primary hover:underline cursor-pointer">
                Xem {daily.data?.length ?? 0} nhiệm vụ hằng ngày →
              </span>
            </Link>
          </div>
        ) : (
          <div>
            {displayList.map(e => (
              <MiniQuestRow key={e.userQuest.id} entry={e} />
            ))}
          </div>
        )}

        {(daily.data?.length ?? 0) > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {daily.data!.length} nhiệm vụ hằng ngày có sẵn
            </span>
            <Link href="/quests">
              <span className="text-[10px] text-primary hover:underline cursor-pointer">Bắt đầu →</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
