import { useWallet } from "../context/WalletContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Rewards() {
  const { rewards, redeemReward } = useWallet();
  const { toast } = useToast();

  const handleRedeem = (id: string, title: string) => {
    const success = redeemReward(id);
    if (success) {
      toast({
        title: "Reward Redeemed",
        description: `Successfully redeemed ${title}!`,
      });
    } else {
      toast({
        title: "Redemption Failed",
        description: "Not enough points or reward unavailable.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Rewards</h1>
          <p className="text-muted-foreground mt-1">Redeem your points for exclusive perks.</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4 flex items-center gap-6 shadow-sm">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Available Points</div>
            <div className="text-2xl font-bold text-primary">{rewards.currentPoints.toLocaleString()}</div>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Tier Status</div>
            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary hover:bg-primary/20">{rewards.tier}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.rewards.map((reward) => {
          const canAfford = rewards.currentPoints >= reward.pointsCost;
          const isAvailable = reward.available;
          
          return (
            <Card key={reward.id} className={`flex flex-col ${!isAvailable ? 'opacity-60 grayscale-[0.5]' : ''}`} data-testid={`card-reward-${reward.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">{reward.category}</Badge>
                  <div className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                    <Star className="w-3.5 h-3.5" />
                    {reward.pointsCost.toLocaleString()}
                  </div>
                </div>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                {reward.expiresAt && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    Expires {format(new Date(reward.expiresAt), "MMM d, yyyy")}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-4 border-t mt-auto">
                <Button 
                  className="w-full" 
                  onClick={() => handleRedeem(reward.id, reward.title)}
                  disabled={!isAvailable || !canAfford}
                  data-testid={`button-redeem-${reward.id}`}
                >
                  {!isAvailable ? 'Out of Stock' : !canAfford ? 'Need More Points' : 'Redeem Now'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
