import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { craftingService } from "@/services/craftingService";
import { useToast } from "@/hooks/use-toast";

export function useEconomy() {
  return useQuery({
    queryKey: ["economy"],
    queryFn:  craftingService.getEconomy,
    refetchInterval: 30000,
  });
}

export function usePrices() {
  return useQuery({
    queryKey: ["economy-prices"],
    queryFn:  craftingService.getPrices,
    refetchInterval: 10000,
  });
}

export function useFluctuatePrices() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: craftingService.fluctuatePrices,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["economy-prices"] });
      qc.invalidateQueries({ queryKey: ["economy"] });
      toast({ title: "📈 Giá thị trường đã cập nhật!" });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}
