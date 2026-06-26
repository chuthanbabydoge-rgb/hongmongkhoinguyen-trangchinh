import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { craftingService } from "@/services/craftingService";
import { useToast } from "@/hooks/use-toast";

export function useResourceNodes(worldId?: string) {
  return useQuery({
    queryKey: ["resources", worldId],
    queryFn:  () => craftingService.getResources(worldId),
    refetchInterval: 15000,
  });
}

export function useGather() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ nodeId, amount }: { nodeId: string; amount?: number }) =>
      craftingService.gather(nodeId, amount ?? 1),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "⛏️ Thu thập thành công!", description: "Tài nguyên đã được thêm vào túi đồ." });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}
