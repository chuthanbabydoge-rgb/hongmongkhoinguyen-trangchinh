// ─────────────────────────────────────────────────────────────────────────────
// Mock profile data
// Replace with DB queries when integrating a database.
// ─────────────────────────────────────────────────────────────────────────────

export interface Avatar {
  initials: string;
  imageUrl: string | null;
  frameColor: string;
}

export interface ProfileData {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  reputation: number;
  reputationTier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  badges: string[];
  avatar: Avatar;
  joinedAt: string;
}

export const PROFILE: ProfileData = {
  id: "user-001",
  username: "Commander Zara",
  title: "Galactic Architect",
  status: "online",
  level: 47,
  xp: 84320,
  maxXp: 100000,
  progressPercent: 84,
  reputation: 142,
  reputationTier: "gold",
  badges: ["early-adopter", "trader", "explorer"],
  avatar: {
    initials: "CZ",
    imageUrl: null,
    frameColor: "#7c3aed",
  },
  joinedAt: "2022-03-15T08:00:00Z",
};
