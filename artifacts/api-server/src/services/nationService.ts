import { createId } from "@paralleldrive/cuid2";
import { DrizzleNationRepository } from "../repositories/drizzle/DrizzleNationRepository.js";
import { NotificationsService }    from "./notificationsService.js";
import { ActivitiesService }       from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { nationEventBus }          from "../realtime/nationEventBus.js";

export class NationError extends Error {
  constructor(message: string, public readonly code: string = "NATION_ERROR") {
    super(message);
    this.name = "NationError";
  }
}

export class NationService {
  constructor(
    private readonly repo:           DrizzleNationRepository,
    private readonly notifService:   NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  private getDefaultNationId() {
    return "nation-universe-prime";
  }

  // ── Nations ──────────────────────────────────────────────────────────────────
  async getDashboard(userId: string) {
    const nationId = this.getDefaultNationId();
    const [nation, term, ministries, laws, elections, announcements, stats, citizenship, taxRules] = await Promise.all([
      this.repo.getNation(nationId),
      this.repo.getActiveTerm(nationId),
      this.repo.listMinistries(nationId),
      this.repo.listLaws(nationId),
      this.repo.listElections(nationId),
      this.repo.listAnnouncements(nationId),
      this.repo.listStatistics(nationId),
      this.repo.getCitizenByUser(nationId, userId),
      this.repo.listTaxRules(nationId),
    ]);
    const passport = citizenship ? await this.repo.getPassportByUser(userId) : null;
    const visa     = await this.repo.getVisaByUser(nationId, userId);
    return {
      nation, activeTerm: term, ministries, laws: laws.slice(0, 10),
      elections: elections.slice(0, 5), announcements: announcements.slice(0, 5),
      latestStats: stats[0] ?? null, citizenship, passport, visa,
      totalCitizens: (await this.repo.listCitizens(nationId)).length,
      activeLaws:    laws.filter(l => l.status === "PASSED").length,
      taxRules,
    };
  }

  async getNation() {
    return this.repo.getNation(this.getDefaultNationId());
  }

  // ── Government ───────────────────────────────────────────────────────────────
  async getGovernment() {
    const nationId = this.getDefaultNationId();
    const [term, members, ministries] = await Promise.all([
      this.repo.getActiveTerm(nationId),
      this.repo.listMembers(nationId),
      this.repo.listMinistries(nationId),
    ]);
    return { term, members, ministries };
  }

  async listMinistries() {
    return this.repo.listMinistries(this.getDefaultNationId());
  }
  async getMinistry(id: string) {
    return this.repo.getMinistry(id);
  }
  async createMinistry(userId: string, data: { name: string; shortName: string; description: string; icon: string; budget: number }) {
    const m = await this.repo.createMinistry({ ...data, nationId: this.getDefaultNationId(), isActive: true });
    nationEventBus.publish({ type: "MINISTRY_CREATED", userId, payload: { ministryId: m.id, name: m.name } });
    this.activitiesService.createActivity({ userId, type: "nation", title: `Thành lập Bộ ${m.name}`, description: "" }).catch(() => {});
    return m;
  }
  async updateMinistry(userId: string, id: string, data: Partial<{ name: string; shortName: string; description: string; icon: string; budget: number }>) {
    const m = await this.repo.updateMinistry(id, data);
    if (!m) throw new NationError("Bộ ngành không tồn tại");
    return m;
  }
  async deleteMinistry(userId: string, id: string) {
    return this.repo.deleteMinistry(id);
  }

  async listMembers() {
    return this.repo.listMembers(this.getDefaultNationId());
  }
  async appointMember(userId: string, data: { targetUserId: string; role: string; ministryId?: string; title: string; bio: string }) {
    const m = await this.repo.createMember({
      nationId: this.getDefaultNationId(), termId: undefined, ministryId: data.ministryId,
      userId: data.targetUserId, role: data.role as "PRESIDENT", title: data.title, bio: data.bio, isActive: true, appointedAt: new Date(),
    });
    nationEventBus.publish({ type: "MINISTER_APPOINTED", userId, payload: { memberId: m.id, role: data.role } });
    await this.notifService.fire(data.targetUserId, "nation", "Bổ nhiệm chức vụ 🏛️", `Bạn đã được bổ nhiệm làm ${data.role} trong chính phủ`);
    this.activitiesService.createActivity({ userId, type: "nation", title: `Bổ nhiệm ${data.role}`, description: "" }).catch(() => {});
    return m;
  }

  // ── Citizens ─────────────────────────────────────────────────────────────────
  async listCitizens() {
    return this.repo.listCitizens(this.getDefaultNationId());
  }
  async getCitizenMe(userId: string) {
    const nationId = this.getDefaultNationId();
    const citizenship = await this.repo.getCitizenByUser(nationId, userId);
    if (!citizenship) return null;
    const [profile, titles, passport, visa] = await Promise.all([
      this.repo.getCitizenProfile(citizenship.id),
      this.repo.listCitizenTitles(citizenship.id),
      this.repo.getPassportByUser(userId),
      this.repo.getVisaByUser(nationId, userId),
    ]);
    return { citizenship, profile, titles, passport, visa };
  }
  async registerCitizen(userId: string, data: { occupation: string; address: string }) {
    const nationId = this.getDefaultNationId();
    const existing = await this.repo.getCitizenByUser(nationId, userId);
    if (existing) throw new NationError("Bạn đã là công dân của quốc gia này");
    const citizenId = `CIT-${createId().slice(0, 8).toUpperCase()}`;
    const citizenship = await this.repo.createCitizenship({ nationId, userId, citizenId, status: "ACTIVE", registeredAt: new Date(), approvedAt: new Date() });
    await this.repo.upsertCitizenProfile(citizenship.id, userId, { occupation: data.occupation, address: data.address, loyaltyScore: 100, votingRights: true });
    nationEventBus.publish({ type: "CITIZEN_REGISTERED", userId, payload: { citizenId, citizenshipId: citizenship.id } });
    await this.notifService.fire(userId, "nation", "Đăng ký công dân thành công 🎉", `Bạn đã trở thành công dân với mã số: ${citizenId}`);
    this.activitiesService.createActivity({ userId, type: "nation", title: "Đăng ký công dân", description: "" }).catch(() => {});
    await this.reputationRepo.upsert(userId, 200);
    return { citizenship, citizenId };
  }

  // ── Passport ─────────────────────────────────────────────────────────────────
  async getPassport(userId: string) {
    return this.repo.getPassportByUser(userId);
  }
  async listPassports() {
    return this.repo.listPassports(this.getDefaultNationId());
  }
  async issuePassport(userId: string) {
    const nationId = this.getDefaultNationId();
    const citizenship = await this.repo.getCitizenByUser(nationId, userId);
    if (!citizenship) throw new NationError("Bạn chưa đăng ký công dân");
    const existing = await this.repo.getPassportByUser(userId);
    if (existing && existing.status === "VALID") throw new NationError("Bạn đã có hộ chiếu hợp lệ");
    const passportNumber = `UP-${createId().slice(0, 10).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);
    const passport = await this.repo.createPassport({ citizenshipId: citizenship.id, userId, passportNumber, status: "VALID", issuedAt: new Date(), expiresAt });
    nationEventBus.publish({ type: "PASSPORT_CREATED", userId, payload: { passportId: passport.id, passportNumber } });
    await this.notifService.fire(userId, "nation", "Hộ chiếu được cấp ✈️", `Hộ chiếu ${passportNumber} đã được cấp thành công`);
    return passport;
  }

  // ── Visa ─────────────────────────────────────────────────────────────────────
  async listVisaTypes() {
    return this.repo.listVisaTypes(this.getDefaultNationId());
  }
  async getVisa(userId: string) {
    return this.repo.getVisaByUser(this.getDefaultNationId(), userId);
  }
  async listVisas() {
    return this.repo.listVisas(this.getDefaultNationId());
  }
  async applyVisa(userId: string, data: { visaTypeId: string; purpose: string }) {
    const nationId = this.getDefaultNationId();
    const visaType = await this.repo.createVisaType({ nationId, name: "", description: "", durationDays: 30, fee: 0, isActive: true });
    const visaNumber = `VN-${createId().slice(0, 10).toUpperCase()}`;
    const visa = await this.repo.createVisa({ nationId, visaTypeId: data.visaTypeId, userId, visaNumber, status: "PENDING", purpose: data.purpose });
    return visa;
  }
  async applyVisaByType(userId: string, visaTypeId: string, purpose: string) {
    const nationId = this.getDefaultNationId();
    const visaNumber = `VN-${createId().slice(0, 10).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const visa = await this.repo.createVisa({ nationId, visaTypeId, userId, visaNumber, status: "APPROVED", purpose, issuedAt: new Date(), expiresAt });
    nationEventBus.publish({ type: "VISA_GRANTED", userId, payload: { visaId: visa.id, visaNumber } });
    await this.notifService.fire(userId, "nation", "Visa được phê duyệt ✅", `Visa số ${visaNumber} đã được phê duyệt`);
    return visa;
  }

  // ── Laws ─────────────────────────────────────────────────────────────────────
  async listLaws(status?: string) {
    return this.repo.listLaws(this.getDefaultNationId(), status);
  }
  async getLaw(id: string) {
    const law = await this.repo.getLaw(id);
    if (!law) throw new NationError("Luật không tồn tại");
    const votes = await this.repo.listLawVotes(id);
    return { law, votes };
  }
  async listLawCategories() {
    return this.repo.listLawCategories(this.getDefaultNationId());
  }
  async createLaw(userId: string, data: { title: string; content: string; summary: string; categoryId?: string }) {
    const law = await this.repo.createLaw({ ...data, nationId: this.getDefaultNationId(), proposedBy: userId, status: "DRAFT", votesFor: 0, votesAgainst: 0 });
    nationEventBus.publish({ type: "LAW_CREATED", userId, payload: { lawId: law.id, title: law.title } });
    this.activitiesService.createActivity({ userId, type: "nation", title: `Đề xuất luật: ${law.title}`, description: "" }).catch(() => {});
    return law;
  }
  async voteLaw(userId: string, lawId: string, vote: boolean, reason: string) {
    const law = await this.repo.getLaw(lawId);
    if (!law) throw new NationError("Luật không tồn tại");
    if (law.status !== "VOTING") throw new NationError("Luật này không trong giai đoạn biểu quyết");
    const already = await this.repo.hasVotedLaw(lawId, userId);
    if (already) throw new NationError("Bạn đã biểu quyết cho luật này");
    const result = await this.repo.voteLaw(lawId, userId, vote, reason);
    nationEventBus.publish({ type: "LAW_VOTED", userId, payload: { lawId, vote } });
    await this.reputationRepo.upsert(userId, 10);
    return result;
  }

  // ── Elections ─────────────────────────────────────────────────────────────────
  async listElections() {
    return this.repo.listElections(this.getDefaultNationId());
  }
  async getElection(id: string) {
    const election = await this.repo.getElection(id);
    if (!election) throw new NationError("Bầu cử không tồn tại");
    const candidates = await this.repo.listCandidates(id);
    return { election, candidates };
  }
  async createElection(userId: string, data: { title: string; description: string; electionType: string; startDate: Date; endDate: Date }) {
    const election = await this.repo.createElection({ ...data, nationId: this.getDefaultNationId(), electionType: data.electionType as "PRESIDENTIAL", status: "UPCOMING", totalVotes: 0 });
    nationEventBus.publish({ type: "ELECTION_STARTED", userId, payload: { electionId: election.id } });
    return election;
  }
  async voteElection(userId: string, electionId: string, candidateId: string) {
    const election = await this.repo.getElection(electionId);
    if (!election) throw new NationError("Bầu cử không tồn tại");
    if (election.status !== "ACTIVE") throw new NationError("Bầu cử không đang diễn ra");
    const already = await this.repo.hasVotedElection(electionId, userId);
    if (already) throw new NationError("Bạn đã bỏ phiếu trong cuộc bầu cử này");
    const result = await this.repo.voteElection(electionId, candidateId, userId);
    nationEventBus.publish({ type: "ELECTION_VOTE_CAST", userId, payload: { electionId, candidateId } });
    await this.reputationRepo.upsert(userId, 20);
    return result;
  }
  async registerCandidate(userId: string, electionId: string, data: { name: string; party: string; platform: string }) {
    return this.repo.createCandidate({ electionId, userId, ...data, votes: 0, isWinner: false, registeredAt: new Date() });
  }

  // ── Budget ────────────────────────────────────────────────────────────────────
  async listBudgets() {
    return this.repo.listBudgets(this.getDefaultNationId());
  }
  async getBudget(id: string) {
    const budget = await this.repo.getBudget(id);
    if (!budget) throw new NationError("Ngân sách không tồn tại");
    const items = await this.repo.listBudgetItems(id);
    return { budget, items };
  }
  async createBudget(userId: string, data: { name: string; fiscalYear: number; totalAmount: number; description: string }) {
    const budget = await this.repo.createBudget({ ...data, nationId: this.getDefaultNationId(), spentAmount: 0, status: "DRAFT" });
    nationEventBus.publish({ type: "BUDGET_APPROVED", userId, payload: { budgetId: budget.id } });
    return budget;
  }
  async approveBudget(userId: string, id: string) {
    return this.repo.updateBudget(id, { status: "APPROVED", approvedBy: userId, approvedAt: new Date() });
  }
  async addBudgetItem(userId: string, budgetId: string, data: { name: string; description: string; allocatedAmount: number; ministryId?: string }) {
    return this.repo.createBudgetItem({ budgetId, ...data, spentAmount: 0 });
  }

  // ── Tax ───────────────────────────────────────────────────────────────────────
  async listTaxRules() {
    return this.repo.listTaxRules(this.getDefaultNationId());
  }
  async getTaxRule(id: string) {
    return this.repo.getTaxRule(id);
  }
  async createTaxRule(userId: string, data: { name: string; description: string; taxType: string; rate: number; minAmount: number }) {
    return this.repo.createTaxRule({ ...data, nationId: this.getDefaultNationId(), taxType: data.taxType as "INCOME", isActive: true, effectiveAt: new Date() });
  }
  async payTax(userId: string, taxRuleId: string, amount: number, period: string) {
    const rule = await this.repo.getTaxRule(taxRuleId);
    if (!rule) throw new NationError("Quy tắc thuế không tồn tại");
    const payment = await this.repo.createTaxPayment({ nationId: this.getDefaultNationId(), taxRuleId, userId, amount, period, status: "PAID", paidAt: new Date() });
    nationEventBus.publish({ type: "TAX_PAID", userId, payload: { taxRuleId, amount } });
    await this.notifService.fire(userId, "nation", "Thanh toán thuế thành công 💰", `Đã thanh toán ${amount} UNI thuế cho ${rule.name}`);
    this.activitiesService.createActivity({ userId, type: "nation", title: `Nộp thuế: ${rule.name}`, description: `Số tiền: ${amount} UNI` }).catch(() => {});
    await this.reputationRepo.upsert(userId, 5);
    return payment;
  }
  async listTaxPayments(userId?: string) {
    return this.repo.listTaxPayments(this.getDefaultNationId(), userId);
  }

  // ── Announcements ─────────────────────────────────────────────────────────────
  async listAnnouncements() {
    return this.repo.listAnnouncements(this.getDefaultNationId());
  }
  async createAnnouncement(userId: string, data: { title: string; content: string; priority: string; ministryId?: string; isPinned?: boolean }) {
    const ann = await this.repo.createAnnouncement({ ...data, nationId: this.getDefaultNationId(), authorId: userId, priority: data.priority as "HIGH", publishedAt: new Date() });
    nationEventBus.publish({ type: "ANNOUNCEMENT_PUBLISHED", userId, payload: { announcementId: ann.id } });
    return ann;
  }
  async updateAnnouncement(userId: string, id: string, data: Partial<{ title: string; content: string; priority: string; isPinned: boolean }>) {
    return this.repo.updateAnnouncement(id, data);
  }
  async deleteAnnouncement(userId: string, id: string) {
    return this.repo.deleteAnnouncement(id);
  }

  // ── National Events ───────────────────────────────────────────────────────────
  async listNationalEvents() {
    return this.repo.listNationalEvents(this.getDefaultNationId());
  }
  async createNationalEvent(userId: string, data: { title: string; description: string; eventType: string; startDate: Date; endDate?: Date; isPublicHoliday?: boolean }) {
    const event = await this.repo.createNationalEvent({ ...data, nationId: this.getDefaultNationId(), eventType: data.eventType as "HOLIDAY", isPublicHoliday: data.isPublicHoliday ?? false, createdBy: userId });
    nationEventBus.publish({ type: "NATIONAL_EVENT_CREATED", userId, payload: { eventId: event.id } });
    return event;
  }

  // ── Statistics ────────────────────────────────────────────────────────────────
  async getStatistics() {
    return this.repo.listStatistics(this.getDefaultNationId());
  }
  async createStatistics(userId: string, data: { period: string; gdp: number; population: number; taxRevenue: number; spending: number }) {
    return this.repo.createStatistics({ ...data, nationId: this.getDefaultNationId(), citizenCount: 0, lawsPassed: 0, recordedAt: new Date() });
  }

  async seedData() {
    return this.repo.seedData();
  }
}
