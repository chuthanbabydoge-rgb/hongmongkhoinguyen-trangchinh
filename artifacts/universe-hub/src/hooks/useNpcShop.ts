import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { craftingService } from "@/services/craftingService";
import { useToast } from "@/hooks/use-toast";

export function useShops() {
  return useQuery({ queryKey: ["npc-shops"], queryFn: craftingService.getShops });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: ["npc-shop", id],
    queryFn:  () => craftingService.getShop(id),
    enabled:  !!id,
  });
}

export function useBuyItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ shopId, itemId, quantity }: { shopId: string; itemId: string; quantity?: number }) =>
      craftingService.buyItem(shopId, itemId, quantity),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["npc-shops"] });
      toast({ title: "🛒 Mua thành công!", description: `${data.item} — chi phí ${data.cost} Credits` });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}

export function useSellItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ shopId, itemId, quantity }: { shopId: string; itemId: string; quantity?: number }) =>
      craftingService.sellItem(shopId, itemId, quantity),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["npc-shops"] });
      toast({ title: "💰 Bán thành công!", description: `${data.item} — nhận ${data.earned} Credits` });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });
}
