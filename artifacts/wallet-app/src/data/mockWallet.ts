import type { RewardProgram, Reward } from "../types/wallet";

export const MOCK_REWARDS: Reward[] = [
  {
    id: "rwd_001",
    title: "Coffee Voucher",
    description: "Free coffee at any partner café",
    pointsCost: 1000,
    category: "Food & Drink",
    available: true,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    id: "rwd_002",
    title: "Movie Ticket",
    description: "One standard cinema ticket",
    pointsCost: 2500,
    category: "Entertainment",
    available: true,
    expiresAt: "2026-09-30T23:59:59Z",
  },
  {
    id: "rwd_003",
    title: "$10 Store Credit",
    description: "Applied directly to your account balance",
    pointsCost: 5000,
    category: "Store Credit",
    available: true,
  },
  {
    id: "rwd_004",
    title: "Premium Membership (1 Month)",
    description: "Unlock all premium features for a month",
    pointsCost: 8000,
    category: "Subscription",
    available: true,
    expiresAt: "2026-07-31T23:59:59Z",
  },
  {
    id: "rwd_005",
    title: "Exclusive Avatar Frame",
    description: "Limited edition profile frame",
    pointsCost: 3000,
    category: "Cosmetics",
    available: false,
  },
  {
    id: "rwd_006",
    title: "Double XP Weekend Pass",
    description: "2x rewards for an entire weekend",
    pointsCost: 4000,
    category: "Boosts",
    available: true,
  },
];

export const MOCK_REWARD_PROGRAM: RewardProgram = {
  tier: "silver",
  currentPoints: 15600,
  pointsToNextTier: 4400,
  nextTier: "gold",
  lifetimePoints: 42300,
  rewards: MOCK_REWARDS,
};
