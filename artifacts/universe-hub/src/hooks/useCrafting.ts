import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { craftingService } from "@/services/craftingService";
import { useToast } from "@/hooks/use-toast";

export function useRecipes(category?: string) {
  return useQuery({
    queryKey: ["crafting-recipes", category],
    queryFn:  () => craftingService.getRecipes(category),
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["crafting-recipe", id],
    queryFn:  () => craftingService.getRecipe(id),
    enabled:  !!id,
  });
}

export function useCraftJobs(status?: string) {
  return useQuery({
    queryKey: ["crafting-jobs", status],
    queryFn:  () => craftingService.getJobs(status),
    refetchInterval: 5000,
  });
}

export function useCraftHistory() {
  return useQuery({
    queryKey: ["crafting-history"],
    queryFn:  () => craftingService.getHistory(),
  });
}

export function useStartCraft() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (recipeId: string) => craftingService.startCraft(recipeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crafting-jobs"] });
      toast({ title: "⚒️ Bắt đầu chế tạo!", description: "Công việc đã được thêm vào hàng đợi." });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useCompleteCraft() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (jobId: string) => craftingService.completeCraft(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crafting-jobs"] });
      qc.invalidateQueries({ queryKey: ["crafting-history"] });
      toast({ title: "✅ Chế tạo hoàn thành!", description: "Vật phẩm đã được thêm vào túi đồ." });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useCancelCraft() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (jobId: string) => craftingService.cancelCraft(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crafting-jobs"] });
      toast({ title: "Đã huỷ", description: "Công việc chế tạo đã bị huỷ." });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useBlueprints() {
  return useQuery({ queryKey: ["blueprints"], queryFn: craftingService.getBlueprints });
}

export function useUnlockBlueprint() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (recipeId: string) => craftingService.unlockBlueprint(recipeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blueprints"] });
      toast({ title: "📖 Mở khoá thành công!", description: "Bản thiết kế đã được thêm vào bộ sưu tập." });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useStations() {
  return useQuery({ queryKey: ["crafting-stations"], queryFn: craftingService.getStations });
}
