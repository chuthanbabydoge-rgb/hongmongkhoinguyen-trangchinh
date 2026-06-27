// ─────────────────────────────────────────────────────────────────────────────
// Sports routes — HUB-26  (specific routes BEFORE param routes)
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleDashboard,
  handleListSports, handleGetSport, handleGetSportBySlug, handleCreateSport, handleUpdateSport,
  handleListLeagues, handleGetLeague, handleCreateLeague, handleUpdateLeague,
  handleListSeasons, handleGetSeason, handleCreateSeason,
  handleListClubs, handleGetClub, handleCreateClub,
  handleListTeams, handleGetTeam, handleCreateTeam, handleUpdateTeam,
  handleListPlayers, handleGetPlayer, handleAddPlayer, handleUpdatePlayer,
  handleTransferPlayer, handleGetPlayerStatistics,
  handleListCoaches, handleGetCoach, handleAssignCoach,
  handleListStadiums, handleGetStadium, handleCreateStadium,
  handleListMatches, handleGetMatch, handleScheduleMatch, handleStartMatch,
  handleFinishMatch, handleUpdateMatch, handleAddMatchEvent, handleGetMatchEvents,
  handleGetMatchStatistics, handleUpdateMatchStatistics, handleGetLiveMatches, handleGetTodayMatches,
  handleListTournaments, handleGetTournament, handleCreateTournament,
  handleFinishTournament, handleGenerateBracket, handleListRounds,
  handleGetRankings, handleGenerateRankings,
  handleListAwards, handleGrantAward,
  handleGetStatistics, handleGetTopScorers, handleGetTeamStatistics,
  handleListTransfers, handleSignContract, handleGetActiveContract,
} from "../controllers/sportsController.js";

const router: IRouter = Router();

// Dashboard — static, must be first
router.get("/sports/dashboard",                        handleDashboard);

// Sports list + specific sub-routes BEFORE /sports/:id
router.get("/sports",                                  handleListSports);
router.post("/sports",                                 requireAuth, handleCreateSport);
router.get("/sports/slug/:slug",                       handleGetSportBySlug);

// Leagues (specific routes before /sports/:id)
router.get("/sports/leagues",                          handleListLeagues);
router.post("/sports/leagues",                         requireAuth, handleCreateLeague);
router.get("/sports/leagues/:id",                      handleGetLeague);
router.put("/sports/leagues/:id",                      requireAuth, handleUpdateLeague);

// Seasons
router.get("/sports/seasons",                          handleListSeasons);
router.post("/sports/seasons",                         requireAuth, handleCreateSeason);
router.get("/sports/seasons/:id",                      handleGetSeason);

// Clubs
router.get("/sports/clubs",                            handleListClubs);
router.post("/sports/clubs",                           requireAuth, handleCreateClub);
router.get("/sports/clubs/:id",                        handleGetClub);

// Teams
router.get("/sports/teams",                            handleListTeams);
router.post("/sports/teams",                           requireAuth, handleCreateTeam);
router.get("/sports/teams/:id/statistics",             handleGetTeamStatistics);
router.get("/sports/teams/:id",                        handleGetTeam);
router.put("/sports/teams/:id",                        requireAuth, handleUpdateTeam);

// Players (transfer before :id)
router.get("/sports/players",                          handleListPlayers);
router.post("/sports/players",                         requireAuth, handleAddPlayer);
router.post("/sports/players/transfer",                requireAuth, handleTransferPlayer);
router.get("/sports/players/:id/statistics",           handleGetPlayerStatistics);
router.get("/sports/players/:id",                      handleGetPlayer);
router.put("/sports/players/:id",                      requireAuth, handleUpdatePlayer);

// Coaches
router.get("/sports/coaches",                          handleListCoaches);
router.post("/sports/coaches",                         requireAuth, handleAssignCoach);
router.get("/sports/coaches/:id",                      handleGetCoach);

// Stadiums
router.get("/sports/stadiums",                         handleListStadiums);
router.post("/sports/stadiums",                        requireAuth, handleCreateStadium);
router.get("/sports/stadiums/:id",                     handleGetStadium);

// Matches (live/today before :id)
router.get("/sports/matches",                          handleListMatches);
router.post("/sports/matches",                         requireAuth, handleScheduleMatch);
router.get("/sports/matches/live",                     handleGetLiveMatches);
router.get("/sports/matches/today",                    handleGetTodayMatches);
router.get("/sports/matches/:id/events",               handleGetMatchEvents);
router.post("/sports/matches/:id/events",              requireAuth, handleAddMatchEvent);
router.get("/sports/matches/:id/statistics",           handleGetMatchStatistics);
router.put("/sports/matches/:id/statistics",           requireAuth, handleUpdateMatchStatistics);
router.post("/sports/matches/:id/start",               requireAuth, handleStartMatch);
router.post("/sports/matches/:id/finish",              requireAuth, handleFinishMatch);
router.get("/sports/matches/:id",                      handleGetMatch);
router.put("/sports/matches/:id",                      requireAuth, handleUpdateMatch);

// Tournaments (rounds/bracket/finish before :id)
router.get("/sports/tournaments",                      handleListTournaments);
router.post("/sports/tournaments",                     requireAuth, handleCreateTournament);
router.get("/sports/tournaments/:id/rounds",           handleListRounds);
router.post("/sports/tournaments/:id/finish",          requireAuth, handleFinishTournament);
router.post("/sports/tournaments/:id/bracket",         requireAuth, handleGenerateBracket);
router.get("/sports/tournaments/:id",                  handleGetTournament);

// Rankings
router.get("/sports/rankings/:seasonId",               handleGetRankings);
router.post("/sports/rankings/:seasonId/generate",     requireAuth, handleGenerateRankings);

// Awards
router.get("/sports/awards",                           handleListAwards);
router.post("/sports/awards",                          requireAuth, handleGrantAward);

// Statistics (top-scorers before bare /statistics)
router.get("/sports/statistics/top-scorers",           handleGetTopScorers);
router.get("/sports/statistics",                       handleGetStatistics);

// Transfers
router.get("/sports/transfers",                        handleListTransfers);

// Contracts
router.post("/sports/contracts",                       requireAuth, handleSignContract);
router.get("/sports/contracts/player/:playerId",       handleGetActiveContract);

// Sport by ID — must come LAST among /sports/* routes
router.get("/sports/:id",                              handleGetSport);
router.put("/sports/:id",                              requireAuth, handleUpdateSport);

export default router;
