import {
  Globe2,
  Trophy,
  Dna,
  ShieldCheck,
  ArrowLeftRight,
  Bot,
  Glasses,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleType = "internal" | "external" | "coming-soon" | "disabled";

export interface ModuleTheme {
  accent: string;
  glowColor: string;
  textColor: string;
  borderColor: string;
  hoverBorder: string;
}

export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  type: ModuleType;
  url?: string;
  navIcon: LucideIcon;
  navPath: string;
  theme: ModuleTheme;
}

export const MODULES: ModuleConfig[] = [
  {
    id: "world-creator",
    title: "World Creator",
    description: "Create countries, cities, planets and civilizations.",
    buttonText: "Enter World Creator",
    type: "internal",
    url: "/worlds",
    navIcon: Globe2,
    navPath: "/worlds",
    theme: {
      accent: "bg-blue-500",
      glowColor: "shadow-blue-500/50",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      hoverBorder: "hover:border-blue-500/80",
    },
  },
  {
    id: "football",
    title: "Football Universe",
    description: "AI Football simulation universe.",
    buttonText: "Launch Football Universe",
    type: "external",
    url: "https://football-ai.replit.app",
    navIcon: Trophy,
    navPath: "/football",
    theme: {
      accent: "bg-teal-400",
      glowColor: "shadow-teal-400/50",
      textColor: "text-teal-300",
      borderColor: "border-teal-400/30",
      hoverBorder: "hover:border-teal-400/80",
    },
  },
  {
    id: "animals",
    title: "Animal Evolution",
    description: "Create and evolve unique AI creatures.",
    buttonText: "Launch Animal Evolution",
    type: "external",
    url: "https://animal-universe.replit.app",
    navIcon: Dna,
    navPath: "/evolution",
    theme: {
      accent: "bg-emerald-500",
      glowColor: "shadow-emerald-500/50",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      hoverBorder: "hover:border-emerald-500/80",
    },
  },
  {
    id: "safepass",
    title: "SafePass",
    description: "Asset transfer and secure transactions.",
    buttonText: "Launch SafePass",
    type: "coming-soon",
    navIcon: ShieldCheck,
    navPath: "/safepass",
    theme: {
      accent: "bg-amber-500",
      glowColor: "shadow-amber-500/50",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      hoverBorder: "hover:border-amber-500/80",
    },
  },
  {
    id: "exchange-hub",
    title: "Exchange Hub",
    description: "Digital currency and asset exchange.",
    buttonText: "Launch Exchange",
    type: "coming-soon",
    navIcon: ArrowLeftRight,
    navPath: "/exchange",
    theme: {
      accent: "bg-purple-500",
      glowColor: "shadow-purple-500/50",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      hoverBorder: "hover:border-purple-500/80",
    },
  },
  {
    id: "ai-companion",
    title: "AI Companion",
    description: "Personal AI assistant across all worlds.",
    buttonText: "Coming Soon",
    type: "disabled",
    navIcon: Bot,
    navPath: "/ai",
    theme: {
      accent: "bg-pink-500",
      glowColor: "shadow-pink-500/50",
      textColor: "text-pink-400",
      borderColor: "border-pink-500/30",
      hoverBorder: "hover:border-pink-500/80",
    },
  },
  {
    id: "xr-worlds",
    title: "XR Worlds",
    description: "Immersive VR AR MR XR experiences.",
    buttonText: "Coming Soon",
    type: "disabled",
    navIcon: Glasses,
    navPath: "/xr",
    theme: {
      accent: "bg-orange-500",
      glowColor: "shadow-orange-500/50",
      textColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      hoverBorder: "hover:border-orange-500/80",
    },
  },
];
