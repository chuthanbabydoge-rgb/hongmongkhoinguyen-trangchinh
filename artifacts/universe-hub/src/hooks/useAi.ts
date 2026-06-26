import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { aiService, type ConversationType, type MemoryScope, type FeedbackType } from "@/services/aiService";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const AI_KEYS = {
  dashboard:     ["ai-dashboard"] as const,
  conversations: (limit?: number) => ["ai-conversations", limit] as const,
  messages:      (convId: string) => ["ai-messages", convId] as const,
  memory:        ["ai-memory"] as const,
  suggestions:   ["ai-suggestions"] as const,
  status:        ["ai-status"] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useAiStatus() {
  return useQuery({
    queryKey: AI_KEYS.status,
    queryFn:  () => aiService.status(),
    retry:    false,
    staleTime: 60_000,
  });
}

export function useAiDashboard() {
  return useQuery({
    queryKey: AI_KEYS.dashboard,
    queryFn:  () => aiService.dashboard(),
    retry:    false,
  });
}

export function useAiConversations(limit = 20) {
  return useQuery({
    queryKey: AI_KEYS.conversations(limit),
    queryFn:  () => aiService.listConversations(limit),
  });
}

export function useAiMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: AI_KEYS.messages(conversationId ?? ""),
    queryFn:  () => aiService.listMessages(conversationId!),
    enabled:  !!conversationId,
  });
}

export function useAiMemory() {
  return useQuery({
    queryKey: AI_KEYS.memory,
    queryFn:  () => aiService.listMemories(),
  });
}

export function useAiSuggestions() {
  return useQuery({
    queryKey: AI_KEYS.suggestions,
    queryFn:  () => aiService.listSuggestions(),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateConversation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: { title?: string; type?: ConversationType }) =>
      aiService.createConversation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => aiService.deleteConversation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useChat() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      aiService.chat(message, conversationId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ai-messages", data.conversation.id] });
      qc.invalidateQueries({ queryKey: ["ai-conversations"] });
      qc.invalidateQueries({ queryKey: AI_KEYS.dashboard });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useCreateMemory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: { key: string; value: string; scope?: MemoryScope }) =>
      aiService.createMemory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_KEYS.memory });
      qc.invalidateQueries({ queryKey: AI_KEYS.dashboard });
      toast({ title: "Đã lưu ký ức!" });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteMemory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => aiService.deleteMemory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_KEYS.memory });
      qc.invalidateQueries({ queryKey: AI_KEYS.dashboard });
      toast({ title: "Đã xóa ký ức" });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useDismissSuggestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => aiService.dismissSuggestion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_KEYS.suggestions });
      qc.invalidateQueries({ queryKey: AI_KEYS.dashboard });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useGenerateSuggestions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => aiService.generateSuggestions(),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: AI_KEYS.suggestions });
      qc.invalidateQueries({ queryKey: AI_KEYS.dashboard });
      toast({
        title: created.length > 0
          ? `Đã tạo ${created.length} gợi ý mới!`
          : "Nova không có gợi ý mới lúc này.",
      });
    },
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useAiFeedback() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ messageId, type, comment }: { messageId: string; type: FeedbackType; comment?: string }) =>
      aiService.feedback(messageId, type, comment),
    onSuccess: () => toast({ title: "Cảm ơn phản hồi của bạn!" }),
    onError: (e: Error) =>
      toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

// ─── Composite hook (convenience) ─────────────────────────────────────────────

export function useAi() {
  const dashboard     = useAiDashboard();
  const conversations = useAiConversations(5);
  const memory        = useAiMemory();
  const suggestions   = useAiSuggestions();

  const createConv    = useCreateConversation();
  const deleteConv    = useDeleteConversation();
  const chat          = useChat();
  const createMemory  = useCreateMemory();
  const deleteMemory  = useDeleteMemory();
  const dismiss       = useDismissSuggestion();
  const generate      = useGenerateSuggestions();
  const feedback      = useAiFeedback();

  return {
    // Data
    dashboard:     dashboard.data,
    conversations: conversations.data ?? [],
    memories:      memory.data ?? [],
    suggestions:   suggestions.data ?? [],

    // Loading states
    isLoading: dashboard.isLoading || conversations.isLoading,

    // Mutations
    createConversation: createConv.mutate,
    deleteConversation: deleteConv.mutate,
    chat:               chat.mutate,
    createMemory:       createMemory.mutate,
    deleteMemory:       deleteMemory.mutate,
    dismissSuggestion:  dismiss.mutate,
    generateSuggestions: generate.mutate,
    feedback:           feedback.mutate,

    // Pending states
    isChatting:       chat.isPending,
    isGenerating:     generate.isPending,
  };
}
