import { createId } from "@paralleldrive/cuid2";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  nationsTable, governmentTermsTable, ministriesTable, governmentMembersTable,
  citizenshipsTable, citizenProfilesTable, citizenTitlesTable,
  lawCategoriesTable, lawsTable, lawVotesTable,
  taxRulesTable, taxPaymentsTable,
  budgetsTable, budgetItemsTable,
  electionsTable, electionCandidatesTable, electionVotesTable,
  passportsTable, visaTypesTable, visasTable,
  nationalEventsTable, governmentAnnouncementsTable, nationalStatisticsTable,
} from "@workspace/db/schema";

export class DrizzleNationRepository {
  // ── Nations ─────────────────────────────────────────────────────────────────
  async getNation(id: string) {
    const [r] = await db.select().from(nationsTable).where(eq(nationsTable.id, id)).limit(1);
    return r ?? null;
  }
  async listNations() {
    return db.select().from(nationsTable).orderBy(desc(nationsTable.createdAt));
  }
  async createNation(data: Omit<typeof nationsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(nationsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateNation(id: string, data: Partial<typeof nationsTable.$inferInsert>) {
    const [r] = await db.update(nationsTable).set({ ...data, updatedAt: new Date() }).where(eq(nationsTable.id, id)).returning();
    return r ?? null;
  }

  // ── Government Terms ────────────────────────────────────────────────────────
  async listTerms(nationId: string) {
    return db.select().from(governmentTermsTable).where(eq(governmentTermsTable.nationId, nationId)).orderBy(desc(governmentTermsTable.termNumber));
  }
  async getActiveTerm(nationId: string) {
    const [r] = await db.select().from(governmentTermsTable).where(and(eq(governmentTermsTable.nationId, nationId), eq(governmentTermsTable.status, "ACTIVE"))).limit(1);
    return r ?? null;
  }
  async createTerm(data: Omit<typeof governmentTermsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(governmentTermsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateTerm(id: string, data: Partial<typeof governmentTermsTable.$inferInsert>) {
    const [r] = await db.update(governmentTermsTable).set({ ...data, updatedAt: new Date() }).where(eq(governmentTermsTable.id, id)).returning();
    return r ?? null;
  }

  // ── Ministries ───────────────────────────────────────────────────────────────
  async listMinistries(nationId: string) {
    return db.select().from(ministriesTable).where(eq(ministriesTable.nationId, nationId)).orderBy(ministriesTable.name);
  }
  async getMinistry(id: string) {
    const [r] = await db.select().from(ministriesTable).where(eq(ministriesTable.id, id)).limit(1);
    return r ?? null;
  }
  async createMinistry(data: Omit<typeof ministriesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(ministriesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateMinistry(id: string, data: Partial<typeof ministriesTable.$inferInsert>) {
    const [r] = await db.update(ministriesTable).set({ ...data, updatedAt: new Date() }).where(eq(ministriesTable.id, id)).returning();
    return r ?? null;
  }
  async deleteMinistry(id: string) {
    const [r] = await db.delete(ministriesTable).where(eq(ministriesTable.id, id)).returning();
    return !!r;
  }

  // ── Government Members ───────────────────────────────────────────────────────
  async listMembers(nationId: string) {
    return db.select().from(governmentMembersTable).where(and(eq(governmentMembersTable.nationId, nationId), eq(governmentMembersTable.isActive, true))).orderBy(governmentMembersTable.role);
  }
  async getMember(id: string) {
    const [r] = await db.select().from(governmentMembersTable).where(eq(governmentMembersTable.id, id)).limit(1);
    return r ?? null;
  }
  async createMember(data: Omit<typeof governmentMembersTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(governmentMembersTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateMember(id: string, data: Partial<typeof governmentMembersTable.$inferInsert>) {
    const [r] = await db.update(governmentMembersTable).set({ ...data, updatedAt: new Date() }).where(eq(governmentMembersTable.id, id)).returning();
    return r ?? null;
  }

  // ── Citizenships ─────────────────────────────────────────────────────────────
  async listCitizens(nationId: string) {
    return db.select().from(citizenshipsTable).where(eq(citizenshipsTable.nationId, nationId)).orderBy(desc(citizenshipsTable.registeredAt));
  }
  async getCitizenByUser(nationId: string, userId: string) {
    const [r] = await db.select().from(citizenshipsTable).where(and(eq(citizenshipsTable.nationId, nationId), eq(citizenshipsTable.userId, userId))).limit(1);
    return r ?? null;
  }
  async getCitizenById(id: string) {
    const [r] = await db.select().from(citizenshipsTable).where(eq(citizenshipsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createCitizenship(data: Omit<typeof citizenshipsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(citizenshipsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateCitizenship(id: string, data: Partial<typeof citizenshipsTable.$inferInsert>) {
    const [r] = await db.update(citizenshipsTable).set({ ...data, updatedAt: new Date() }).where(eq(citizenshipsTable.id, id)).returning();
    return r ?? null;
  }
  async getCitizenProfile(citizenshipId: string) {
    const [r] = await db.select().from(citizenProfilesTable).where(eq(citizenProfilesTable.citizenshipId, citizenshipId)).limit(1);
    return r ?? null;
  }
  async upsertCitizenProfile(citizenshipId: string, userId: string, data: Partial<typeof citizenProfilesTable.$inferInsert>) {
    const existing = await this.getCitizenProfile(citizenshipId);
    if (existing) {
      const [r] = await db.update(citizenProfilesTable).set({ ...data, updatedAt: new Date() }).where(eq(citizenProfilesTable.citizenshipId, citizenshipId)).returning();
      return r!;
    }
    const [r] = await db.insert(citizenProfilesTable).values({ id: createId(), citizenshipId, userId, ...data, createdAt: new Date(), updatedAt: new Date() } as typeof citizenProfilesTable.$inferInsert).returning();
    return r!;
  }
  async listCitizenTitles(citizenshipId: string) {
    return db.select().from(citizenTitlesTable).where(eq(citizenTitlesTable.citizenshipId, citizenshipId)).orderBy(desc(citizenTitlesTable.awardedAt));
  }
  async awardTitle(citizenshipId: string, title: string, awardedBy: string, reason: string) {
    const [r] = await db.insert(citizenTitlesTable).values({ id: createId(), citizenshipId, title, awardedBy, reason, awardedAt: new Date(), createdAt: new Date() } as typeof citizenTitlesTable.$inferInsert).returning();
    return r!;
  }

  // ── Laws ─────────────────────────────────────────────────────────────────────
  async listLawCategories(nationId: string) {
    return db.select().from(lawCategoriesTable).where(eq(lawCategoriesTable.nationId, nationId)).orderBy(lawCategoriesTable.name);
  }
  async createLawCategory(data: Omit<typeof lawCategoriesTable.$inferInsert, "id" | "createdAt">) {
    const [r] = await db.insert(lawCategoriesTable).values({ ...data, id: createId(), createdAt: new Date() }).returning();
    return r!;
  }
  async listLaws(nationId: string, status?: string) {
    if (status) {
      return db.select().from(lawsTable).where(and(eq(lawsTable.nationId, nationId), sql`${lawsTable.status} = ${status}`)).orderBy(desc(lawsTable.createdAt));
    }
    return db.select().from(lawsTable).where(eq(lawsTable.nationId, nationId)).orderBy(desc(lawsTable.createdAt));
  }
  async getLaw(id: string) {
    const [r] = await db.select().from(lawsTable).where(eq(lawsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createLaw(data: Omit<typeof lawsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(lawsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateLaw(id: string, data: Partial<typeof lawsTable.$inferInsert>) {
    const [r] = await db.update(lawsTable).set({ ...data, updatedAt: new Date() }).where(eq(lawsTable.id, id)).returning();
    return r ?? null;
  }
  async hasVotedLaw(lawId: string, userId: string) {
    const [r] = await db.select().from(lawVotesTable).where(and(eq(lawVotesTable.lawId, lawId), eq(lawVotesTable.userId, userId))).limit(1);
    return !!r;
  }
  async voteLaw(lawId: string, userId: string, vote: boolean, reason: string) {
    const [r] = await db.insert(lawVotesTable).values({ id: createId(), lawId, userId, vote, reason, createdAt: new Date() } as typeof lawVotesTable.$inferInsert).returning();
    if (vote) {
      await db.update(lawsTable).set({ votesFor: sql`${lawsTable.votesFor} + 1`, updatedAt: new Date() }).where(eq(lawsTable.id, lawId));
    } else {
      await db.update(lawsTable).set({ votesAgainst: sql`${lawsTable.votesAgainst} + 1`, updatedAt: new Date() }).where(eq(lawsTable.id, lawId));
    }
    return r!;
  }
  async listLawVotes(lawId: string) {
    return db.select().from(lawVotesTable).where(eq(lawVotesTable.lawId, lawId)).orderBy(desc(lawVotesTable.createdAt));
  }

  // ── Tax ──────────────────────────────────────────────────────────────────────
  async listTaxRules(nationId: string) {
    return db.select().from(taxRulesTable).where(eq(taxRulesTable.nationId, nationId)).orderBy(taxRulesTable.name);
  }
  async getTaxRule(id: string) {
    const [r] = await db.select().from(taxRulesTable).where(eq(taxRulesTable.id, id)).limit(1);
    return r ?? null;
  }
  async createTaxRule(data: Omit<typeof taxRulesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(taxRulesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateTaxRule(id: string, data: Partial<typeof taxRulesTable.$inferInsert>) {
    const [r] = await db.update(taxRulesTable).set({ ...data, updatedAt: new Date() }).where(eq(taxRulesTable.id, id)).returning();
    return r ?? null;
  }
  async listTaxPayments(nationId: string, userId?: string) {
    if (userId) {
      return db.select().from(taxPaymentsTable).where(and(eq(taxPaymentsTable.nationId, nationId), eq(taxPaymentsTable.userId, userId))).orderBy(desc(taxPaymentsTable.paidAt));
    }
    return db.select().from(taxPaymentsTable).where(eq(taxPaymentsTable.nationId, nationId)).orderBy(desc(taxPaymentsTable.paidAt));
  }
  async createTaxPayment(data: Omit<typeof taxPaymentsTable.$inferInsert, "id" | "createdAt">) {
    const [r] = await db.insert(taxPaymentsTable).values({ ...data, id: createId(), createdAt: new Date() }).returning();
    return r!;
  }

  // ── Budgets ──────────────────────────────────────────────────────────────────
  async listBudgets(nationId: string) {
    return db.select().from(budgetsTable).where(eq(budgetsTable.nationId, nationId)).orderBy(desc(budgetsTable.fiscalYear));
  }
  async getBudget(id: string) {
    const [r] = await db.select().from(budgetsTable).where(eq(budgetsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createBudget(data: Omit<typeof budgetsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(budgetsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateBudget(id: string, data: Partial<typeof budgetsTable.$inferInsert>) {
    const [r] = await db.update(budgetsTable).set({ ...data, updatedAt: new Date() }).where(eq(budgetsTable.id, id)).returning();
    return r ?? null;
  }
  async listBudgetItems(budgetId: string) {
    return db.select().from(budgetItemsTable).where(eq(budgetItemsTable.budgetId, budgetId)).orderBy(budgetItemsTable.name);
  }
  async createBudgetItem(data: Omit<typeof budgetItemsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(budgetItemsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }

  // ── Elections ────────────────────────────────────────────────────────────────
  async listElections(nationId: string) {
    return db.select().from(electionsTable).where(eq(electionsTable.nationId, nationId)).orderBy(desc(electionsTable.startDate));
  }
  async getElection(id: string) {
    const [r] = await db.select().from(electionsTable).where(eq(electionsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createElection(data: Omit<typeof electionsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(electionsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateElection(id: string, data: Partial<typeof electionsTable.$inferInsert>) {
    const [r] = await db.update(electionsTable).set({ ...data, updatedAt: new Date() }).where(eq(electionsTable.id, id)).returning();
    return r ?? null;
  }
  async listCandidates(electionId: string) {
    return db.select().from(electionCandidatesTable).where(eq(electionCandidatesTable.electionId, electionId)).orderBy(desc(electionCandidatesTable.votes));
  }
  async createCandidate(data: Omit<typeof electionCandidatesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(electionCandidatesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async hasVotedElection(electionId: string, userId: string) {
    const [r] = await db.select().from(electionVotesTable).where(and(eq(electionVotesTable.electionId, electionId), eq(electionVotesTable.userId, userId))).limit(1);
    return !!r;
  }
  async voteElection(electionId: string, candidateId: string, userId: string) {
    const [r] = await db.insert(electionVotesTable).values({ id: createId(), electionId, candidateId, userId, createdAt: new Date() } as typeof electionVotesTable.$inferInsert).returning();
    await db.update(electionCandidatesTable).set({ votes: sql`${electionCandidatesTable.votes} + 1`, updatedAt: new Date() }).where(eq(electionCandidatesTable.id, candidateId));
    await db.update(electionsTable).set({ totalVotes: sql`${electionsTable.totalVotes} + 1`, updatedAt: new Date() }).where(eq(electionsTable.id, electionId));
    return r!;
  }

  // ── Passports ────────────────────────────────────────────────────────────────
  async getPassportByUser(userId: string) {
    const [r] = await db.select().from(passportsTable).where(eq(passportsTable.userId, userId)).orderBy(desc(passportsTable.createdAt)).limit(1);
    return r ?? null;
  }
  async createPassport(data: Omit<typeof passportsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(passportsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updatePassport(id: string, data: Partial<typeof passportsTable.$inferInsert>) {
    const [r] = await db.update(passportsTable).set({ ...data, updatedAt: new Date() }).where(eq(passportsTable.id, id)).returning();
    return r ?? null;
  }
  async listPassports(nationId: string) {
    return db.select().from(passportsTable).orderBy(desc(passportsTable.createdAt)).limit(100);
  }

  // ── Visas ────────────────────────────────────────────────────────────────────
  async listVisaTypes(nationId: string) {
    return db.select().from(visaTypesTable).where(and(eq(visaTypesTable.nationId, nationId), eq(visaTypesTable.isActive, true))).orderBy(visaTypesTable.name);
  }
  async createVisaType(data: Omit<typeof visaTypesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(visaTypesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async getVisaByUser(nationId: string, userId: string) {
    const [r] = await db.select().from(visasTable).where(and(eq(visasTable.nationId, nationId), eq(visasTable.userId, userId))).orderBy(desc(visasTable.createdAt)).limit(1);
    return r ?? null;
  }
  async listVisas(nationId: string) {
    return db.select().from(visasTable).where(eq(visasTable.nationId, nationId)).orderBy(desc(visasTable.createdAt));
  }
  async createVisa(data: Omit<typeof visasTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(visasTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateVisa(id: string, data: Partial<typeof visasTable.$inferInsert>) {
    const [r] = await db.update(visasTable).set({ ...data, updatedAt: new Date() }).where(eq(visasTable.id, id)).returning();
    return r ?? null;
  }

  // ── National Events ───────────────────────────────────────────────────────────
  async listNationalEvents(nationId: string) {
    return db.select().from(nationalEventsTable).where(eq(nationalEventsTable.nationId, nationId)).orderBy(desc(nationalEventsTable.startDate));
  }
  async createNationalEvent(data: Omit<typeof nationalEventsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(nationalEventsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateNationalEvent(id: string, data: Partial<typeof nationalEventsTable.$inferInsert>) {
    const [r] = await db.update(nationalEventsTable).set({ ...data, updatedAt: new Date() }).where(eq(nationalEventsTable.id, id)).returning();
    return r ?? null;
  }

  // ── Announcements ─────────────────────────────────────────────────────────────
  async listAnnouncements(nationId: string) {
    return db.select().from(governmentAnnouncementsTable).where(eq(governmentAnnouncementsTable.nationId, nationId)).orderBy(desc(governmentAnnouncementsTable.createdAt));
  }
  async createAnnouncement(data: Omit<typeof governmentAnnouncementsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(governmentAnnouncementsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateAnnouncement(id: string, data: Partial<typeof governmentAnnouncementsTable.$inferInsert>) {
    const [r] = await db.update(governmentAnnouncementsTable).set({ ...data, updatedAt: new Date() }).where(eq(governmentAnnouncementsTable.id, id)).returning();
    return r ?? null;
  }
  async deleteAnnouncement(id: string) {
    const [r] = await db.delete(governmentAnnouncementsTable).where(eq(governmentAnnouncementsTable.id, id)).returning();
    return !!r;
  }

  // ── Statistics ────────────────────────────────────────────────────────────────
  async listStatistics(nationId: string) {
    return db.select().from(nationalStatisticsTable).where(eq(nationalStatisticsTable.nationId, nationId)).orderBy(desc(nationalStatisticsTable.recordedAt)).limit(24);
  }
  async createStatistics(data: Omit<typeof nationalStatisticsTable.$inferInsert, "id" | "createdAt">) {
    const [r] = await db.insert(nationalStatisticsTable).values({ ...data, id: createId(), createdAt: new Date() }).returning();
    return r!;
  }

  // ── Seed ─────────────────────────────────────────────────────────────────────
  async seedData() {
    const existing = await this.listNations();
    if (existing.length > 0) return;

    const NATION_ID = "nation-universe-prime";
    const now = new Date();

    await db.insert(nationsTable).values({
      id: NATION_ID, name: "Universe Prime", officialName: "Cộng hòa Universe Prime",
      capital: "Nova Capital", flag: "🌌", anthem: "Bài ca Vũ trụ",
      motto: "Vì sự hài hòa của vũ trụ", currency: "UNI", language: "Universal",
      population: 1000000, area: 500000, gdp: 50000000000, status: "ACTIVE",
      foundedAt: new Date("2020-01-01"), description: "Quốc gia ảo đầu tiên trong Universe Ecosystem",
      createdAt: now, updatedAt: now,
    } as typeof nationsTable.$inferInsert).onConflictDoNothing();

    const TERM_ID = "term-001";
    await db.insert(governmentTermsTable).values({
      id: TERM_ID, nationId: NATION_ID, name: "Nhiệm kỳ I", termNumber: 1,
      startDate: new Date("2024-01-01"), status: "ACTIVE",
      description: "Nhiệm kỳ đầu tiên của chính phủ Universe Prime",
      createdAt: now, updatedAt: now,
    } as typeof governmentTermsTable.$inferInsert).onConflictDoNothing();

    const ministrySeeds = [
      { id: "min-finance",    name: "Bộ Tài chính",           shortName: "MOF",  icon: "💰" },
      { id: "min-defense",    name: "Bộ Quốc phòng",          shortName: "MOD",  icon: "⚔️" },
      { id: "min-justice",    name: "Bộ Tư pháp",             shortName: "MOJ",  icon: "⚖️" },
      { id: "min-economy",    name: "Bộ Kinh tế",             shortName: "MOE",  icon: "📈" },
      { id: "min-education",  name: "Bộ Giáo dục",            shortName: "MOEd", icon: "📚" },
      { id: "min-tech",       name: "Bộ Khoa học & Công nghệ", shortName: "MOST", icon: "🔬" },
      { id: "min-foreign",    name: "Bộ Ngoại giao",          shortName: "MFA",  icon: "🌐" },
      { id: "min-internal",   name: "Bộ Nội vụ",              shortName: "MOI",  icon: "🏛️" },
    ];
    for (const m of ministrySeeds) {
      await db.insert(ministriesTable).values({
        id: m.id, nationId: NATION_ID, name: m.name, shortName: m.shortName,
        description: `Bộ phụ trách ${m.name.replace("Bộ ", "")}`, icon: m.icon,
        budget: Math.floor(Math.random() * 5_000_000) + 1_000_000,
        isActive: true, createdAt: now, updatedAt: now,
      } as typeof ministriesTable.$inferInsert).onConflictDoNothing();
    }

    const lawCatSeeds = [
      { id: "lcat-civil", name: "Luật Dân sự", icon: "👥" },
      { id: "lcat-criminal", name: "Luật Hình sự", icon: "⚖️" },
      { id: "lcat-economic", name: "Luật Kinh tế", icon: "💼" },
      { id: "lcat-environment", name: "Luật Môi trường", icon: "🌿" },
    ];
    for (const c of lawCatSeeds) {
      await db.insert(lawCategoriesTable).values({
        id: c.id, nationId: NATION_ID, name: c.name, description: `Danh mục ${c.name}`, icon: c.icon, createdAt: now,
      } as typeof lawCategoriesTable.$inferInsert).onConflictDoNothing();
    }

    const lawTitles = [
      ["Luật Bảo vệ Tài sản Ảo", "PASSED"], ["Luật Thương mại Số", "PASSED"], ["Luật An ninh Mạng", "PASSED"],
      ["Luật Thuế Thu nhập Cá nhân", "PASSED"], ["Luật Bầu cử Dân chủ", "PASSED"],
      ["Luật Quyền Công dân", "PASSED"], ["Luật Ngân sách Nhà nước", "PASSED"],
      ["Luật Đất đai Ảo", "PASSED"], ["Luật Bảo vệ Người tiêu dùng", "PASSED"],
      ["Luật Tự do Báo chí", "VOTING"], ["Luật Môi trường Ảo", "DRAFT"],
      ["Luật Hôn nhân Ảo", "DRAFT"], ["Luật Khai thác Tài nguyên", "VOTING"],
      ["Luật Bảo hiểm Xã hội", "PASSED"], ["Luật Giáo dục Bắt buộc", "PASSED"],
      ["Luật Y tế Cộng đồng", "PASSED"], ["Luật Phúc lợi Xã hội", "PASSED"],
      ["Luật Di cư và Tị nạn", "VOTING"], ["Luật Giao thông Ảo", "DRAFT"],
      ["Luật Bảo vệ Trẻ em", "PASSED"],
    ];
    for (let i = 0; i < lawTitles.length; i++) {
      await db.insert(lawsTable).values({
        id: `law-${String(i + 1).padStart(3, "0")}`, nationId: NATION_ID,
        categoryId: lawCatSeeds[i % lawCatSeeds.length]!.id,
        proposedBy: "system", title: lawTitles[i]![0],
        content: `Nội dung chi tiết của ${lawTitles[i]![0]}...`,
        summary: `Tóm tắt ${lawTitles[i]![0]}`,
        status: lawTitles[i]![1] as "PASSED" | "VOTING" | "DRAFT",
        votesFor: Math.floor(Math.random() * 200) + 50,
        votesAgainst: Math.floor(Math.random() * 50),
        createdAt: now, updatedAt: now,
      } as typeof lawsTable.$inferInsert).onConflictDoNothing();
    }

    const electionSeeds = [
      { id: "elec-001", title: "Bầu cử Tổng thống lần 1", type: "PRESIDENTIAL" as const, status: "ENDED" as const },
      { id: "elec-002", title: "Bầu cử Quốc hội lần 1", type: "PARLIAMENTARY" as const, status: "ENDED" as const },
      { id: "elec-003", title: "Bầu cử Thị trưởng Nova Capital", type: "MUNICIPAL" as const, status: "ENDED" as const },
      { id: "elec-004", title: "Bầu cử Quốc hội lần 2", type: "PARLIAMENTARY" as const, status: "ACTIVE" as const },
      { id: "elec-005", title: "Trưng cầu dân ý Sửa đổi Hiến pháp", type: "REFERENDUM" as const, status: "UPCOMING" as const },
    ];
    for (const e of electionSeeds) {
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 * Math.random());
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      await db.insert(electionsTable).values({
        id: e.id, nationId: NATION_ID, title: e.title,
        description: `Chi tiết ${e.title}`, electionType: e.type, status: e.status,
        startDate, endDate, totalVotes: e.status === "ENDED" ? Math.floor(Math.random() * 5000) + 1000 : 0,
        createdAt: now, updatedAt: now,
      } as typeof electionsTable.$inferInsert).onConflictDoNothing();
    }

    for (let i = 1; i <= 5; i++) {
      await db.insert(electionCandidatesTable).values({
        id: `cand-${i}`, electionId: "elec-001",
        userId: `user-${String(i).padStart(3, "0")}`, name: `Ứng cử viên ${i}`,
        party: ["Đảng Tiến bộ", "Đảng Bảo thủ", "Đảng Tự do", "Đảng Xanh", "Độc lập"][i - 1]!,
        platform: `Nền tảng tranh cử của ứng cử viên ${i}`,
        votes: Math.floor(Math.random() * 2000) + 100,
        isWinner: i === 1, registeredAt: now, createdAt: now, updatedAt: now,
      } as typeof electionCandidatesTable.$inferInsert).onConflictDoNothing();
    }

    const taxRuleSeeds = [
      { id: "tax-001", name: "Thuế Thu nhập Cá nhân", taxType: "INCOME" as const, rate: 0.15, minAmount: 100 },
      { id: "tax-002", name: "Thuế Thương mại", taxType: "TRADE" as const, rate: 0.05, minAmount: 500 },
      { id: "tax-003", name: "Thuế Tài sản Ảo", taxType: "PROPERTY" as const, rate: 0.02, minAmount: 1000 },
      { id: "tax-004", name: "Thuế Giàu có", taxType: "WEALTH" as const, rate: 0.25, minAmount: 100000 },
      { id: "tax-005", name: "Thuế Xuất nhập khẩu", taxType: "IMPORT" as const, rate: 0.08, minAmount: 0 },
      { id: "tax-006", name: "Thuế Hoạt động", taxType: "ACTIVITY" as const, rate: 0.03, minAmount: 10 },
      { id: "tax-007", name: "Thuế Xuất khẩu", taxType: "EXPORT" as const, rate: 0.06, minAmount: 200 },
      { id: "tax-008", name: "Thuế Khác", taxType: "OTHER" as const, rate: 0.01, minAmount: 0 },
      { id: "tax-009", name: "Thuế Doanh nghiệp", taxType: "TRADE" as const, rate: 0.20, minAmount: 1000 },
      { id: "tax-010", name: "Thuế Thừa kế", taxType: "WEALTH" as const, rate: 0.10, minAmount: 5000 },
    ];
    for (const t of taxRuleSeeds) {
      await db.insert(taxRulesTable).values({
        id: t.id, nationId: NATION_ID, name: t.name,
        description: `Quy tắc ${t.name}`, taxType: t.taxType,
        rate: t.rate, minAmount: t.minAmount, isActive: true,
        effectiveAt: new Date("2024-01-01"), createdAt: now, updatedAt: now,
      } as typeof taxRulesTable.$inferInsert).onConflictDoNothing();
    }

    const announcementSeeds = [
      { title: "Thông báo khai trương Quốc gia Universe Prime", priority: "HIGH" as const },
      { title: "Kết quả bầu cử Tổng thống lần 1", priority: "URGENT" as const },
      { title: "Ngân sách Quốc gia năm 2025 được phê duyệt", priority: "HIGH" as const },
      { title: "Luật Bảo vệ Tài sản Ảo chính thức có hiệu lực", priority: "HIGH" as const },
      { title: "Lễ hội Quốc gia sắp diễn ra", priority: "MEDIUM" as const },
      { title: "Chương trình đăng ký công dân mở rộng", priority: "MEDIUM" as const },
      { title: "Tổng kết kinh tế Quý IV", priority: "LOW" as const },
      { title: "Cập nhật chính sách thuế 2025", priority: "HIGH" as const },
      { title: "Hội nghị Bộ trưởng tháng 6", priority: "MEDIUM" as const },
      { title: "Thông báo kết quả kiểm toán Ngân sách", priority: "HIGH" as const },
      { title: "Chương trình học bổng Quốc gia 2025", priority: "MEDIUM" as const },
      { title: "Cảnh báo an ninh mạng", priority: "URGENT" as const },
      { title: "Thành lập Tòa án Tối cao", priority: "HIGH" as const },
      { title: "Ra mắt Cổng thông tin Chính phủ", priority: "MEDIUM" as const },
      { title: "Thông báo lịch nghỉ lễ quốc khánh", priority: "LOW" as const },
      { title: "Kết quả Hội nghị Ngoại giao khu vực", priority: "MEDIUM" as const },
      { title: "Chương trình phúc lợi cho công dân", priority: "MEDIUM" as const },
      { title: "Thống kê dân số năm 2025", priority: "LOW" as const },
      { title: "Thông báo về chính sách visa mới", priority: "HIGH" as const },
      { title: "Kế hoạch phát triển kinh tế 5 năm", priority: "HIGH" as const },
    ];
    for (let i = 0; i < announcementSeeds.length; i++) {
      await db.insert(governmentAnnouncementsTable).values({
        id: `ann-${String(i + 1).padStart(3, "0")}`, nationId: NATION_ID,
        ministryId: ministrySeeds[i % ministrySeeds.length]!.id,
        authorId: "system", title: announcementSeeds[i]!.title,
        content: `Nội dung thông báo: ${announcementSeeds[i]!.title}. Chi tiết sẽ được cập nhật.`,
        priority: announcementSeeds[i]!.priority, isPinned: i < 3,
        publishedAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        createdAt: now, updatedAt: now,
      } as typeof governmentAnnouncementsTable.$inferInsert).onConflictDoNothing();
    }

    const visaTypeSeeds = [
      { id: "vtype-tourist", name: "Visa Du lịch", durationDays: 30, fee: 50 },
      { id: "vtype-business", name: "Visa Doanh nhân", durationDays: 90, fee: 150 },
      { id: "vtype-student", name: "Visa Sinh viên", durationDays: 365, fee: 100 },
      { id: "vtype-work", name: "Visa Lao động", durationDays: 365, fee: 200 },
      { id: "vtype-diplomatic", name: "Visa Ngoại giao", durationDays: 730, fee: 0 },
    ];
    for (const v of visaTypeSeeds) {
      await db.insert(visaTypesTable).values({
        id: v.id, nationId: NATION_ID, name: v.name,
        description: `Visa dành cho ${v.name.replace("Visa ", "")}`,
        durationDays: v.durationDays, fee: v.fee, isActive: true, createdAt: now, updatedAt: now,
      } as typeof visaTypesTable.$inferInsert).onConflictDoNothing();
    }

    await db.insert(budgetsTable).values({
      id: "budget-2025", nationId: NATION_ID, name: "Ngân sách Quốc gia 2025",
      fiscalYear: 2025, totalAmount: 100_000_000, spentAmount: 35_000_000,
      status: "ACTIVE", approvedBy: "parliament",
      approvedAt: new Date("2025-01-01"), description: "Ngân sách Quốc gia năm tài chính 2025",
      createdAt: now, updatedAt: now,
    } as typeof budgetsTable.$inferInsert).onConflictDoNothing();

    for (let i = 0; i < ministrySeeds.length; i++) {
      await db.insert(budgetItemsTable).values({
        id: `bitem-${i + 1}`, budgetId: "budget-2025",
        ministryId: ministrySeeds[i]!.id, name: `Ngân sách ${ministrySeeds[i]!.name}`,
        description: `Phân bổ ngân sách cho ${ministrySeeds[i]!.name}`,
        allocatedAmount: Math.floor(Math.random() * 15_000_000) + 2_000_000,
        spentAmount: Math.floor(Math.random() * 5_000_000),
        createdAt: now, updatedAt: now,
      } as typeof budgetItemsTable.$inferInsert).onConflictDoNothing();
    }

    await db.insert(nationalStatisticsTable).values({
      id: "stats-2025-q1", nationId: NATION_ID, period: "2025-Q1",
      gdp: 12_000_000_000, population: 1_050_000, taxRevenue: 2_500_000_000,
      spending: 2_100_000_000, citizenCount: 50000, lawsPassed: 12,
      recordedAt: new Date("2025-03-31"), createdAt: now,
    } as typeof nationalStatisticsTable.$inferInsert).onConflictDoNothing();

    const nationalEventSeeds = [
      { title: "Ngày Quốc khánh Universe Prime", eventType: "HOLIDAY" as const, isPublicHoliday: true },
      { title: "Lễ khai mạc Quốc hội", eventType: "CEREMONY" as const, isPublicHoliday: false },
      { title: "Bầu cử Quốc hội lần 2", eventType: "ELECTION" as const, isPublicHoliday: true },
      { title: "Phiên họp Quốc hội đặc biệt", eventType: "LEGISLATIVE" as const, isPublicHoliday: false },
      { title: "Hội nghị Kinh tế Quốc gia", eventType: "ECONOMIC" as const, isPublicHoliday: false },
      { title: "Lễ hội Văn hóa Ảo 2025", eventType: "CULTURAL" as const, isPublicHoliday: true },
      { title: "Diễn tập An ninh Quốc gia", eventType: "MILITARY" as const, isPublicHoliday: false },
      { title: "Hội nghị Ngoại giao Cấp cao", eventType: "DIPLOMATIC" as const, isPublicHoliday: false },
    ];
    for (let i = 0; i < nationalEventSeeds.length; i++) {
      const startDate = new Date(now.getTime() + (i - 4) * 7 * 24 * 60 * 60 * 1000);
      await db.insert(nationalEventsTable).values({
        id: `nevent-${i + 1}`, nationId: NATION_ID, title: nationalEventSeeds[i]!.title,
        description: `Mô tả sự kiện: ${nationalEventSeeds[i]!.title}`,
        eventType: nationalEventSeeds[i]!.eventType, startDate,
        endDate: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
        isPublicHoliday: nationalEventSeeds[i]!.isPublicHoliday,
        createdBy: "system", createdAt: now, updatedAt: now,
      } as typeof nationalEventsTable.$inferInsert).onConflictDoNothing();
    }
  }
}
