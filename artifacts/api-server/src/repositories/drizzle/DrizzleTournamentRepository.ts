// ─────────────────────────────────────────────────────────────────────────────
// DrizzleTournamentRepository — HUB-23
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc, asc, count } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  tournaments, tournamentBrackets, tournamentMatches,
  tournamentRewards, tournamentHistory,
} from "@workspace/db/schema";
import type {
  ITournamentRepository, Tournament, TournamentBracket,
  TournamentMatch, TournamentReward, TournamentStatus, TournamentType, MatchType,
} from "../pvpRepository.js";

function toTournament(r: typeof tournaments.$inferSelect): Tournament {
  return {
    id: r.id, name: r.name, description: r.description,
    type: r.type as TournamentType, status: r.status as TournamentStatus,
    matchType: r.matchType as MatchType,
    organizerId: r.organizerId, guildId: r.guildId, seasonId: r.seasonId,
    maxParticipants: r.maxParticipants,
    minMmr: r.minMmr, maxMmr: r.maxMmr,
    entryFee: r.entryFee, prizePool: r.prizePool,
    currentRound: r.currentRound, totalRounds: r.totalRounds,
    winnerId: r.winnerId, icon: r.icon,
    metadata: r.metadata as Record<string, unknown> | null,
    registrationEndsAt: r.registrationEndsAt ? r.registrationEndsAt.toISOString() : null,
    startAt: r.startAt ? r.startAt.toISOString() : null,
    finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
  };
}

function toBracket(r: typeof tournamentBrackets.$inferSelect): TournamentBracket {
  return {
    id: r.id, tournamentId: r.tournamentId, userId: r.userId,
    seed: r.seed, round: r.round, isEliminated: r.isEliminated,
    wins: r.wins, losses: r.losses, position: r.position,
    createdAt: r.createdAt.toISOString(),
  };
}

function toMatch(r: typeof tournamentMatches.$inferSelect): TournamentMatch {
  return {
    id: r.id, tournamentId: r.tournamentId, pvpMatchId: r.pvpMatchId,
    round: r.round, position: r.position,
    player1Id: r.player1Id, player2Id: r.player2Id,
    winnerId: r.winnerId, status: r.status,
    scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
    finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  };
}

export class DrizzleTournamentRepository implements ITournamentRepository {

  async createTournament(data: Omit<Tournament, "id" | "createdAt" | "updatedAt">): Promise<Tournament> {
    // Calculate total rounds
    const totalRounds = Math.ceil(Math.log2(data.maxParticipants));
    const [row] = await db.insert(tournaments).values({
      name: data.name, description: data.description,
      type: data.type, status: data.status, matchType: data.matchType,
      organizerId: data.organizerId, guildId: data.guildId, seasonId: data.seasonId,
      maxParticipants: data.maxParticipants,
      minMmr: data.minMmr, maxMmr: data.maxMmr,
      entryFee: data.entryFee, prizePool: data.prizePool,
      totalRounds,
      icon: data.icon, metadata: data.metadata,
      registrationEndsAt: data.registrationEndsAt ? new Date(data.registrationEndsAt) : null,
      startAt: data.startAt ? new Date(data.startAt) : null,
    }).returning();
    return toTournament(row);
  }

  async getTournament(id: string): Promise<Tournament | null> {
    const [row] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return row ? toTournament(row) : null;
  }

  async listTournaments(status?: TournamentStatus): Promise<Tournament[]> {
    const rows = status
      ? await db.select().from(tournaments).where(eq(tournaments.status, status)).orderBy(desc(tournaments.createdAt))
      : await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
    return rows.map(toTournament);
  }

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament | null> {
    const [row] = await db.update(tournaments).set({
      ...(data.status !== undefined && { status: data.status }),
      ...(data.currentRound !== undefined && { currentRound: data.currentRound }),
      ...(data.winnerId !== undefined && { winnerId: data.winnerId }),
      ...(data.finishedAt !== undefined && { finishedAt: data.finishedAt ? new Date(data.finishedAt) : null }),
      ...(data.startAt !== undefined && { startAt: data.startAt ? new Date(data.startAt) : null }),
      ...(data.prizePool !== undefined && { prizePool: data.prizePool }),
      updatedAt: new Date(),
    }).where(eq(tournaments.id, id)).returning();
    return row ? toTournament(row) : null;
  }

  async joinTournament(tournamentId: string, userId: string, seed?: number): Promise<TournamentBracket> {
    const currentCount = await this.getParticipantCount(tournamentId);
    const [row] = await db.insert(tournamentBrackets).values({
      tournamentId, userId,
      seed: seed ?? currentCount + 1,
    }).returning();
    return toBracket(row);
  }

  async getBracket(tournamentId: string): Promise<TournamentBracket[]> {
    const rows = await db.select().from(tournamentBrackets)
      .where(eq(tournamentBrackets.tournamentId, tournamentId))
      .orderBy(asc(tournamentBrackets.seed));
    return rows.map(toBracket);
  }

  async getParticipantCount(tournamentId: string): Promise<number> {
    const [result] = await db.select({ cnt: count() }).from(tournamentBrackets)
      .where(eq(tournamentBrackets.tournamentId, tournamentId));
    return Number(result?.cnt ?? 0);
  }

  async isParticipant(tournamentId: string, userId: string): Promise<boolean> {
    const [row] = await db.select().from(tournamentBrackets)
      .where(and(eq(tournamentBrackets.tournamentId, tournamentId), eq(tournamentBrackets.userId, userId)));
    return !!row;
  }

  async generateBracket(tournamentId: string): Promise<TournamentMatch[]> {
    const participants = await this.getBracket(tournamentId);
    // shuffle by seed for fairness
    const sorted = [...participants].sort((a, b) => a.seed - b.seed);
    const matches: TournamentMatch[] = [];
    // Round 1 matchups: 1 vs 2, 3 vs 4, etc.
    for (let i = 0; i < sorted.length; i += 2) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      const [row] = await db.insert(tournamentMatches).values({
        tournamentId,
        round: 1,
        position: Math.floor(i / 2) + 1,
        player1Id: p1?.userId ?? null,
        player2Id: p2?.userId ?? null,
        status: p2 ? "PENDING" : "BYE",
        winnerId: p2 ? null : (p1?.userId ?? null),
      }).returning();
      matches.push(toMatch(row));
    }
    return matches;
  }

  async getMatches(tournamentId: string, round?: number): Promise<TournamentMatch[]> {
    const rows = round
      ? await db.select().from(tournamentMatches)
          .where(and(eq(tournamentMatches.tournamentId, tournamentId), eq(tournamentMatches.round, round)))
          .orderBy(asc(tournamentMatches.position))
      : await db.select().from(tournamentMatches)
          .where(eq(tournamentMatches.tournamentId, tournamentId))
          .orderBy(asc(tournamentMatches.round), asc(tournamentMatches.position));
    return rows.map(toMatch);
  }

  async updateTournamentMatch(id: string, data: Partial<TournamentMatch>): Promise<TournamentMatch | null> {
    const [row] = await db.update(tournamentMatches).set({
      ...(data.pvpMatchId !== undefined && { pvpMatchId: data.pvpMatchId }),
      ...(data.winnerId !== undefined && { winnerId: data.winnerId }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.finishedAt !== undefined && { finishedAt: data.finishedAt ? new Date(data.finishedAt) : null }),
    }).where(eq(tournamentMatches.id, id)).returning();
    return row ? toMatch(row) : null;
  }

  async createReward(data: Omit<TournamentReward, "id" | "createdAt">): Promise<TournamentReward> {
    const [row] = await db.insert(tournamentRewards).values({
      tournamentId: data.tournamentId, userId: data.userId,
      position: data.position,
      credits: data.credits, xu: data.xu, tokens: data.tokens,
      items: data.items,
    }).returning();
    return {
      id: row.id, tournamentId: row.tournamentId, userId: row.userId,
      position: row.position,
      credits: row.credits, xu: row.xu, tokens: row.tokens,
      items: row.items, claimed: row.claimed,
      claimedAt: row.claimedAt ? row.claimedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getRewards(tournamentId: string): Promise<TournamentReward[]> {
    const rows = await db.select().from(tournamentRewards)
      .where(eq(tournamentRewards.tournamentId, tournamentId));
    return rows.map((r) => ({
      id: r.id, tournamentId: r.tournamentId, userId: r.userId,
      position: r.position,
      credits: r.credits, xu: r.xu, tokens: r.tokens,
      items: r.items, claimed: r.claimed,
      claimedAt: r.claimedAt ? r.claimedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getHistory(userId: string): Promise<TournamentBracket[]> {
    const rows = await db.select().from(tournamentBrackets)
      .where(eq(tournamentBrackets.userId, userId))
      .orderBy(desc(tournamentBrackets.createdAt));
    return rows.map(toBracket);
  }

  async finishTournament(id: string, winnerId: string): Promise<Tournament | null> {
    return this.updateTournament(id, {
      status: "FINISHED",
      winnerId,
      finishedAt: new Date().toISOString(),
    });
  }
}
