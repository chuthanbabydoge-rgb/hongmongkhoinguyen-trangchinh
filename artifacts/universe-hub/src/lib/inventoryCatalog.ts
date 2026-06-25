import type {
  Pet, FootballPlayer, WorldAsset, Ticket, InventoryItem,
} from "@/types/inventory";
import { PETS, FOOTBALL_PLAYERS, WORLD_ASSETS, TICKETS, ITEMS } from "@/lib/inventoryMockData";

export const PET_CATALOG          = new Map<string, Pet>(PETS.map(p => [p.id, p]));
export const PLAYER_CATALOG       = new Map<string, FootballPlayer>(FOOTBALL_PLAYERS.map(p => [p.id, p]));
export const WORLD_ASSET_CATALOG  = new Map<string, WorldAsset>(WORLD_ASSETS.map(a => [a.id, a]));
export const TICKET_CATALOG       = new Map<string, Ticket>(TICKETS.map(t => [t.id, t]));
export const ITEM_CATALOG         = new Map<string, InventoryItem>(ITEMS.map(i => [i.id, i]));
