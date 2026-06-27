import type { Request, Response } from "express";
import { NationService, NationError } from "../services/nationService.js";
import { accountBridgeService }        from "../container.js";

function handleErr(res: Response, err: unknown) {
  if (err instanceof NationError) return res.status(400).json({ ok: false, error: err.message, code: err.code });
  console.error(err);
  return res.status(500).json({ ok: false, error: "Lỗi hệ thống" });
}

async function getUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] ?? "";
  const profile = await accountBridgeService.getProfileCached(auth);
  return (profile as Record<string, unknown>)["id"] as string ?? "anonymous";
}

export function makeNationController(svc: NationService) {
  return {
    // ── Dashboard ──────────────────────────────────────────────────────────────
    async getDashboard(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.getDashboard(userId);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getNation(req: Request, res: Response) {
      try {
        const data = await svc.getNation();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Government ────────────────────────────────────────────────────────────
    async getGovernment(req: Request, res: Response) {
      try {
        const data = await svc.getGovernment();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async listMinistries(req: Request, res: Response) {
      try {
        const data = await svc.listMinistries();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getMinistry(req: Request, res: Response) {
      try {
        const id = req.params["id"] as string;
        const data = await svc.getMinistry(id);
        if (!data) return res.status(404).json({ ok: false, error: "Bộ ngành không tồn tại" });
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createMinistry(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.createMinistry(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async updateMinistry(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const data = await svc.updateMinistry(userId, id, req.body);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async deleteMinistry(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        await svc.deleteMinistry(userId, id);
        res.json({ ok: true });
      } catch (e) { handleErr(res, e); }
    },

    async listMembers(req: Request, res: Response) {
      try {
        const data = await svc.listMembers();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async appointMember(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.appointMember(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Citizens ──────────────────────────────────────────────────────────────
    async listCitizens(req: Request, res: Response) {
      try {
        const data = await svc.listCitizens();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getCitizenMe(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.getCitizenMe(userId);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async registerCitizen(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.registerCitizen(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Passport ──────────────────────────────────────────────────────────────
    async getPassport(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.getPassport(userId);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async listPassports(req: Request, res: Response) {
      try {
        const data = await svc.listPassports();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async issuePassport(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.issuePassport(userId);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Visa ──────────────────────────────────────────────────────────────────
    async listVisaTypes(req: Request, res: Response) {
      try {
        const data = await svc.listVisaTypes();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getVisa(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.getVisa(userId);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async listVisas(req: Request, res: Response) {
      try {
        const data = await svc.listVisas();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async applyVisa(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const { visaTypeId, purpose } = req.body;
        const data = await svc.applyVisaByType(userId, visaTypeId, purpose ?? "");
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Laws ──────────────────────────────────────────────────────────────────
    async listLaws(req: Request, res: Response) {
      try {
        const status = req.query["status"] as string | undefined;
        const data = await svc.listLaws(status);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getLaw(req: Request, res: Response) {
      try {
        const id = req.params["id"] as string;
        const data = await svc.getLaw(id);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async listLawCategories(req: Request, res: Response) {
      try {
        const data = await svc.listLawCategories();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createLaw(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.createLaw(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async voteLaw(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const { vote, reason } = req.body;
        const data = await svc.voteLaw(userId, id, Boolean(vote), reason ?? "");
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Elections ─────────────────────────────────────────────────────────────
    async listElections(req: Request, res: Response) {
      try {
        const data = await svc.listElections();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getElection(req: Request, res: Response) {
      try {
        const id = req.params["id"] as string;
        const data = await svc.getElection(id);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createElection(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const { title, description, electionType, startDate, endDate } = req.body;
        const data = await svc.createElection(userId, { title, description, electionType, startDate: new Date(startDate), endDate: new Date(endDate) });
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async voteElection(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const { candidateId } = req.body;
        const data = await svc.voteElection(userId, id, candidateId);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async registerCandidate(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const data = await svc.registerCandidate(userId, id, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Budget ────────────────────────────────────────────────────────────────
    async listBudgets(req: Request, res: Response) {
      try {
        const data = await svc.listBudgets();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async getBudget(req: Request, res: Response) {
      try {
        const id = req.params["id"] as string;
        const data = await svc.getBudget(id);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createBudget(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.createBudget(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async approveBudget(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const data = await svc.approveBudget(userId, id);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async addBudgetItem(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const data = await svc.addBudgetItem(userId, id, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Tax ───────────────────────────────────────────────────────────────────
    async listTaxRules(req: Request, res: Response) {
      try {
        const data = await svc.listTaxRules();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createTaxRule(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.createTaxRule(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async payTax(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const { taxRuleId, amount, period } = req.body;
        const data = await svc.payTax(userId, taxRuleId, Number(amount), period);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async listTaxPayments(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const mine = req.query["mine"] === "true";
        const data = await svc.listTaxPayments(mine ? userId : undefined);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Announcements ─────────────────────────────────────────────────────────
    async listAnnouncements(req: Request, res: Response) {
      try {
        const data = await svc.listAnnouncements();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createAnnouncement(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.createAnnouncement(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async updateAnnouncement(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        const data = await svc.updateAnnouncement(userId, id, req.body);
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async deleteAnnouncement(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const id = req.params["id"] as string;
        await svc.deleteAnnouncement(userId, id);
        res.json({ ok: true });
      } catch (e) { handleErr(res, e); }
    },

    // ── National Events ───────────────────────────────────────────────────────
    async listNationalEvents(req: Request, res: Response) {
      try {
        const data = await svc.listNationalEvents();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createNationalEvent(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const { title, description, eventType, startDate, endDate, isPublicHoliday } = req.body;
        const data = await svc.createNationalEvent(userId, { title, description, eventType, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : undefined, isPublicHoliday });
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    // ── Statistics ────────────────────────────────────────────────────────────
    async getStatistics(req: Request, res: Response) {
      try {
        const data = await svc.getStatistics();
        res.json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },

    async createStatistics(req: Request, res: Response) {
      try {
        const userId = await getUserId(req);
        const data = await svc.createStatistics(userId, req.body);
        res.status(201).json({ ok: true, data });
      } catch (e) { handleErr(res, e); }
    },
  };
}
