import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Link } from "wouter";
import {
  useAvailableQuests,
  useDailyQuests,
  useWeeklyQuests,
  useMyQuests,
  useCompletedQuests,
  useStartQuest,
  useClaimQuest,
  useCancelQuest,
  getDifficultyStyle,
  getTypeLabel,
  calcProgress,
  type Quest,
  type UserQuestEntry,
} from "@/hooks/useQuests";
import { Sword, Calendar, CalendarDays, Star, CheckCircle2, Clock, Trophy, Gift, X, Play, Loader2, Flame } from "lucide-react";
import { useState } from "react";

type Tab = "daily" | "weekly" | "active" | "all" | "completed";

function RewardBadges({ quest }: { quest: Quest }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {quest.rewardCredits > 0 && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
          +{quest.rewardCredits} Credits
        </span>
      )}
      {quest.rewardCoins > 0 && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
          +{quest.rewardCoins} Coins
        </span>
      )}
      {quest.rewardTokens > 0 && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-purple-400/30 bg-purple-400/10 text-purple-400">
          +{quest.rewardTokens} Tokens
        </span>
      )}
      {quest.rewardReputation > 0 && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-pink-400/30 bg-pink-400/10 text-pink-400">
          +{quest.rewardReputation} Rep
        </span>
      )}
    </div>
  );
}

function QuestCard({ quest, onStart }: { quest: Quest; onStart: (id: string) => void }) {
  const diffStyle = getDifficultyStyle(quest.difficulty);
  const start = useStartQuest();

  return (
    <div className="glass-panel rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-all duration-200 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${diffStyle}`}>
              {quest.difficulty}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground">
              {getTypeLabel(quest.type)}
            </span>
          </div>
          <h3 className="font-semibold text-white mt-1 text-sm">{quest.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{quest.description}</p>
        </div>
        <button
          onClick={() => onStart(quest.id)}
          disabled={start.isPending}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-mono transition-all disabled:opacity-50"
        >
          {start.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          Bắt đầu
        </button>
      </div>
      <div className="text-xs text-muted-foreground/60">
        {quest.objectives.length} mục tiêu
      </div>
      <RewardBadges quest={quest} />
    </div>
  );
}

function ActiveQuestCard({ entry }: { entry: UserQuestEntry }) {
  const { quest, userQuest } = entry;
  const diffStyle = getDifficultyStyle(quest.difficulty);
  const progress = calcProgress(userQuest, quest);
  const claim = useClaimQuest();
  const cancel = useCancelQuest();

  return (
    <div className="glass-panel rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-all flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${diffStyle}`}>{quest.difficulty}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground">{getTypeLabel(quest.type)}</span>
            {userQuest.status === "COMPLETED" && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-green-400/30 bg-green-400/10 text-green-400">✓ Hoàn thành</span>
            )}
          </div>
          <h3 className="font-semibold text-white mt-1 text-sm">{quest.title}</h3>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {userQuest.status === "COMPLETED" && (
            <button
              onClick={() => claim.mutate(userQuest.id)}
              disabled={claim.isPending}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-400/20 text-xs font-mono transition-all disabled:opacity-50"
            >
              {claim.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
              Nhận thưởng
            </button>
          )}
          <button
            onClick={() => cancel.mutate(userQuest.id)}
            disabled={cancel.isPending || userQuest.status !== "IN_PROGRESS"}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-400/20 transition-all disabled:opacity-30"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Tiến độ</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-400" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {quest.objectives.map(obj => {
          const p = userQuest.progress.find(pr => pr.objectiveId === obj.id);
          const cur = p?.currentCount ?? 0;
          return (
            <div key={obj.id} className="flex items-center gap-2 text-xs">
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${p?.completed ? "border-green-400 bg-green-400/20" : "border-white/20"}`}>
                {p?.completed && <span className="text-green-400 text-[8px]">✓</span>}
              </div>
              <span className={p?.completed ? "text-muted-foreground line-through" : "text-white/80"}>
                {obj.description}
              </span>
              <span className="ml-auto text-muted-foreground/60 font-mono text-[10px]">{cur}/{obj.targetCount}</span>
            </div>
          );
        })}
      </div>

      <RewardBadges quest={quest} />
    </div>
  );
}

function CompletedQuestCard({ entry }: { entry: UserQuestEntry }) {
  const { quest, userQuest } = entry;
  const diffStyle = getDifficultyStyle(quest.difficulty);
  return (
    <div className="glass-panel rounded-xl p-4 border border-white/5 opacity-75 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${userQuest.status === "CLAIMED" ? "text-green-400" : "text-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${diffStyle}`}>{quest.difficulty}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground">{getTypeLabel(quest.type)}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${userQuest.status === "CLAIMED" ? "border-green-400/30 bg-green-400/10 text-green-400" : "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"}`}>
              {userQuest.status === "CLAIMED" ? "Đã nhận" : "Hoàn thành"}
            </span>
          </div>
          <p className="font-semibold text-white text-sm mt-1">{quest.title}</p>
          {userQuest.claimedAt && (
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
              Nhận lúc: {new Date(userQuest.claimedAt).toLocaleString("vi-VN")}
            </p>
          )}
          <RewardBadges quest={quest} />
        </div>
      </div>
    </div>
  );
}

export default function QuestsDashboard() {
  const [tab, setTab] = useState<Tab>("daily");

  const available = useAvailableQuests();
  const daily     = useDailyQuests();
  const weekly    = useWeeklyQuests();
  const myQuests  = useMyQuests();
  const completed = useCompletedQuests();
  const startMut  = useStartQuest();

  const handleStart = (questId: string) => startMut.mutate(questId);

  const TAB_CONFIG: { key: Tab; label: string; icon: typeof Sword; count?: number }[] = [
    { key: "daily",     label: "Hằng ngày",    icon: Calendar,     count: daily.data?.length },
    { key: "weekly",    label: "Hằng tuần",    icon: CalendarDays, count: weekly.data?.length },
    { key: "active",    label: "Đang làm",     icon: Flame,        count: myQuests.data?.length },
    { key: "all",       label: "Tất cả Quest", icon: Sword,        count: available.data?.length },
    { key: "completed", label: "Đã hoàn thành",icon: Trophy,       count: completed.data?.length },
  ];

  const claimable = myQuests.data?.filter(e => e.userQuest.status === "COMPLETED").length ?? 0;

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white neon-text flex items-center gap-2">
                  <Sword className="w-6 h-6 text-primary" /> Quest &amp; Nhiệm vụ
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Hoàn thành nhiệm vụ để nhận phần thưởng Credits, Coins, Token và Reputation.</p>
              </div>
              {claimable > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-400/20 text-green-400 text-sm">
                  <Gift className="w-4 h-4" />
                  <span className="font-mono">{claimable} phần thưởng chờ nhận!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Quest đang làm", value: myQuests.data?.filter(e => e.userQuest.status === "IN_PROGRESS").length ?? 0, icon: Clock, color: "text-blue-400" },
                { label: "Sẵn sàng nhận", value: claimable, icon: Gift, color: "text-green-400" },
                { label: "Đã hoàn thành", value: completed.data?.filter(e => e.userQuest.status === "CLAIMED").length ?? 0, icon: CheckCircle2, color: "text-purple-400" },
                { label: "Nhiệm vụ hôm nay", value: daily.data?.length ?? 0, icon: Star, color: "text-yellow-400" },
              ].map(item => (
                <div key={item.label} className="glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {TAB_CONFIG.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    tab === t.key ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {(t.count ?? 0) > 0 && (
                    <span className="ml-0.5 min-w-[16px] h-[16px] rounded-full bg-white/10 text-[9px] font-mono flex items-center justify-center px-1">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {tab === "daily" && (
                <>
                  {daily.isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                  ) : (daily.data?.length ?? 0) === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Không có nhiệm vụ hằng ngày nào.</div>
                  ) : daily.data!.map(q => <QuestCard key={q.id} quest={q} onStart={handleStart} />)}
                </>
              )}
              {tab === "weekly" && (
                <>
                  {weekly.isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                  ) : (weekly.data?.length ?? 0) === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Không có nhiệm vụ hằng tuần nào.</div>
                  ) : weekly.data!.map(q => <QuestCard key={q.id} quest={q} onStart={handleStart} />)}
                </>
              )}
              {tab === "active" && (
                <>
                  {myQuests.isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                  ) : (myQuests.data?.length ?? 0) === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Bạn chưa bắt đầu quest nào.</div>
                  ) : myQuests.data!.map(e => <ActiveQuestCard key={e.userQuest.id} entry={e} />)}
                </>
              )}
              {tab === "all" && (
                <>
                  {available.isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                  ) : (available.data?.length ?? 0) === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Không có quest nào.</div>
                  ) : available.data!.map(q => <QuestCard key={q.id} quest={q} onStart={handleStart} />)}
                </>
              )}
              {tab === "completed" && (
                <>
                  {completed.isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                  ) : (completed.data?.length ?? 0) === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Chưa hoàn thành quest nào.</div>
                  ) : completed.data!.map(e => <CompletedQuestCard key={e.userQuest.id} entry={e} />)}
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
