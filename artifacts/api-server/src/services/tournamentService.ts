// ─────────────────────────────────────────────────────────────────────────────
// TournamentService — HUB-23
// Tournament lifecycle, bracket management, rewards
// ─────────────────────────────────────────────────────────────────────────────

import type { ITournamentRepository, Tournament, TournamentBracket, TournamentMatch, TournamentType, MatchType } from "../repositories/pvpRepository.js";
import type { IPvpRepository } from "../repositories/pvpRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import type { PvpService } from "./pvpService.js";
import { pvpEventBus } from "./pvpEventBus.js";

export class TournamentError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message); this.name = "TournamentError";
  }
}

export class TournamentService {
  constructor(
    private tournamentRepo: ITournamentRepository,
    private pvpRepo: IPvpRepository,
    private pvpService: PvpService,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
    private reputationRepo: IUserReputationRepository,
  ) {}

  async createTournament(params: {
    name: string;
    description?: string;
    type: TournamentType;
    matchType: MatchType;
    organizerId: string;
    guildId?: string;
    maxParticipants?: number;
    entryFee?: number;
    prizePool?: number;
    minMmr?: number;
    maxMmr?: number;
  }): Promise<Tournament> {
    const max = params.maxParticipants ?? 8;
    if (![2,4,8,16,32].includes(max)) throw new TournamentError("INVALID_SIZE", "Số người tối đa phải là 2, 4, 8, 16, hoặc 32");

    const season = await this.pvpRepo.getCurrentSeason();

    return this.tournamentRepo.createTournament({
      name: params.name,
      description: params.description ?? null,
      type: params.type,
      status: "REGISTRATION",
      matchType: params.matchType,
      organizerId: params.organizerId,
      guildId: params.guildId ?? null,
      seasonId: season?.id ?? null,
      maxParticipants: max,
      minMmr: params.minMmr ?? null,
      maxMmr: params.maxMmr ?? null,
      entryFee: params.entryFee ?? 0,
      prizePool: params.prizePool ?? 0,
      currentRound: 0,
      totalRounds: Math.ceil(Math.log2(max)),
      winnerId: null, icon: "🏆", metadata: null,
      registrationEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      startAt: null, finishedAt: null,
    });
  }

  async listTournaments(status?: string): Promise<Tournament[]> {
    return this.tournamentRepo.listTournaments(status as Tournament["status"] | undefined);
  }

  async getTournament(id: string): Promise<Tournament> {
    const t = await this.tournamentRepo.getTournament(id);
    if (!t) throw new TournamentError("NOT_FOUND", "Giải đấu không tồn tại", 404);
    return t;
  }

  async joinTournament(tournamentId: string, userId: string): Promise<TournamentBracket> {
    const tournament = await this.getTournament(tournamentId);
    if (tournament.status !== "REGISTRATION")
      throw new TournamentError("NOT_OPEN", "Giải đấu không ở giai đoạn đăng ký");

    const count = await this.tournamentRepo.getParticipantCount(tournamentId);
    if (count >= tournament.maxParticipants)
      throw new TournamentError("FULL", "Giải đấu đã đầy");

    const already = await this.tournamentRepo.isParticipant(tournamentId, userId);
    if (already) throw new TournamentError("ALREADY_JOINED", "Bạn đã tham gia giải đấu này");

    // Check MMR requirements
    if (tournament.minMmr || tournament.maxMmr) {
      const season = await this.pvpRepo.getCurrentSeason();
      if (season) {
        const ranking = await this.pvpRepo.getRanking(userId, season.id);
        const mmr = ranking?.mmr ?? 1000;
        if (tournament.minMmr && mmr < tournament.minMmr)
          throw new TournamentError("MMR_TOO_LOW", `MMR tối thiểu: ${tournament.minMmr}`);
        if (tournament.maxMmr && mmr > tournament.maxMmr)
          throw new TournamentError("MMR_TOO_HIGH", `MMR tối đa: ${tournament.maxMmr}`);
      }
    }

    const bracket = await this.tournamentRepo.joinTournament(tournamentId, userId);
    pvpEventBus.publish({ type: "TOURNAMENT_UPDATED", tournamentId, payload: { action: "PLAYER_JOINED", userId, tournamentId } });
    return bracket;
  }

  async getBracket(tournamentId: string): Promise<{
    tournament: Tournament;
    participants: TournamentBracket[];
    matches: TournamentMatch[];
  }> {
    const tournament = await this.getTournament(tournamentId);
    const participants = await this.tournamentRepo.getBracket(tournamentId);
    const matches = await this.tournamentRepo.getMatches(tournamentId);
    return { tournament, participants, matches };
  }

  async startTournament(tournamentId: string, organizerId: string): Promise<{
    tournament: Tournament;
    matches: TournamentMatch[];
  }> {
    const tournament = await this.getTournament(tournamentId);
    if (tournament.organizerId !== organizerId)
      throw new TournamentError("FORBIDDEN", "Chỉ người tổ chức mới có thể bắt đầu giải đấu", 403);
    if (tournament.status !== "REGISTRATION")
      throw new TournamentError("INVALID_STATE", "Giải đấu chưa ở giai đoạn đăng ký");

    const count = await this.tournamentRepo.getParticipantCount(tournamentId);
    if (count < 2) throw new TournamentError("TOO_FEW", "Cần ít nhất 2 người chơi");

    await this.tournamentRepo.updateTournament(tournamentId, {
      status: "IN_PROGRESS",
      currentRound: 1,
      startAt: new Date().toISOString(),
    });

    const matches = await this.tournamentRepo.generateBracket(tournamentId);
    const updated = await this.getTournament(tournamentId);

    pvpEventBus.publish({ type: "TOURNAMENT_STARTED", tournamentId, payload: { tournamentId, name: tournament.name, participantCount: count } });

    // Create PvP matches for round 1
    const season = await this.pvpRepo.getCurrentSeason();
    for (const tmatch of matches) {
      if (tmatch.player1Id && tmatch.player2Id) {
        const pvpMatch = await this.pvpService.createMatch({
          type: tournament.matchType,
          playerIds: [tmatch.player1Id, tmatch.player2Id],
          seasonId: season?.id,
          tournamentId,
          isRanked: false,
        });
        await this.tournamentRepo.updateTournamentMatch(tmatch.id, { pvpMatchId: pvpMatch.match.id });
      }
    }

    return { tournament: updated, matches };
  }

  async finishTournament(tournamentId: string, organizerId: string): Promise<{
    tournament: Tournament;
    winner: string | null;
  }> {
    const tournament = await this.getTournament(tournamentId);
    if (tournament.organizerId !== organizerId)
      throw new TournamentError("FORBIDDEN", "Chỉ người tổ chức mới có thể kết thúc giải đấu", 403);

    // Determine winner from final round
    const matches = await this.tournamentRepo.getMatches(tournamentId);
    const finalMatch = matches.sort((a, b) => b.round - a.round)[0];
    const winnerId = finalMatch?.winnerId ?? null;

    const finished = await this.tournamentRepo.finishTournament(tournamentId, winnerId ?? "");

    if (winnerId) {
      // Grant rewards to winner
      await this.tournamentRepo.createReward({
        tournamentId, userId: winnerId,
        position: 1,
        credits: tournament.prizePool,
        xu: Math.floor(tournament.prizePool / 2),
        tokens: 10,
        items: null, claimed: false, claimedAt: null,
      });

      await this.pvpRepo.upsertStatistics(winnerId, { tournamentWins: 1 });
      await this.reputationRepo.upsert(winnerId, 100);

      await this.notifService.fire(
        winnerId,
        "pvp_tournament_winner",
        "🏆 Vô địch giải đấu!",
        `Chúc mừng! Bạn đã vô địch giải "${tournament.name}"!`,
      );

      await this.activitiesService.createActivity({
        userId: winnerId,
        type: "pvp_tournament",
        title: "Vô địch giải đấu!",
        description: `Vô địch "${tournament.name}"`,
        metadata: { tournamentId, name: tournament.name },
      });
    }

    pvpEventBus.publish({ type: "TOURNAMENT_FINISHED", tournamentId, payload: { tournamentId, name: tournament.name, winnerId } });

    return { tournament: finished!, winner: winnerId };
  }
}
