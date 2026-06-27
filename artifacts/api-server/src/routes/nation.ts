// ─────────────────────────────────────────────────────────────────────────────
// Nation routes — HUB-29
// ─────────────────────────────────────────────────────────────────────────────

import { Router }               from "express";
import { requireAuth }          from "../middlewares/requireAuth.js";
import { makeNationController } from "../controllers/nationController.js";
import { nationService }        from "../container.js";

const router = Router();
const ctrl   = makeNationController(nationService);

// ── Dashboard & Nation ────────────────────────────────────────────────────────
router.get("/nation/dashboard",        requireAuth, ctrl.getDashboard);
router.get("/nation",                              ctrl.getNation);

// ── Government ────────────────────────────────────────────────────────────────
router.get ("/nation/government",                  ctrl.getGovernment);
router.get ("/nation/ministries",                  ctrl.listMinistries);
router.post("/nation/ministries",      requireAuth, ctrl.createMinistry);
router.get ("/nation/ministries/:id",              ctrl.getMinistry);
router.put ("/nation/ministries/:id",  requireAuth, ctrl.updateMinistry);
router.delete("/nation/ministries/:id", requireAuth, ctrl.deleteMinistry);

// ── Government Members ────────────────────────────────────────────────────────
router.get ("/nation/members",                     ctrl.listMembers);
router.post("/nation/members",         requireAuth, ctrl.appointMember);

// ── Citizens ──────────────────────────────────────────────────────────────────
router.get ("/nation/citizens",                    ctrl.listCitizens);
router.get ("/nation/citizens/me",     requireAuth, ctrl.getCitizenMe);
router.post("/nation/citizens/register", requireAuth, ctrl.registerCitizen);

// ── Passport ──────────────────────────────────────────────────────────────────
router.get ("/nation/passport",        requireAuth, ctrl.getPassport);
router.get ("/nation/passports",       requireAuth, ctrl.listPassports);
router.post("/nation/passport",        requireAuth, ctrl.issuePassport);

// ── Visa ──────────────────────────────────────────────────────────────────────
router.get ("/nation/visa-types",                  ctrl.listVisaTypes);
router.get ("/nation/visa",            requireAuth, ctrl.getVisa);
router.get ("/nation/visas",           requireAuth, ctrl.listVisas);
router.post("/nation/visa",            requireAuth, ctrl.applyVisa);

// ── Laws ──────────────────────────────────────────────────────────────────────
router.get ("/nation/laws",                        ctrl.listLaws);
router.post("/nation/laws",            requireAuth, ctrl.createLaw);
router.get ("/nation/law-categories",              ctrl.listLawCategories);
router.get ("/nation/laws/:id",                    ctrl.getLaw);
router.post("/nation/laws/:id/vote",   requireAuth, ctrl.voteLaw);

// ── Elections ─────────────────────────────────────────────────────────────────
router.get ("/nation/elections",                   ctrl.listElections);
router.post("/nation/elections",       requireAuth, ctrl.createElection);
router.get ("/nation/elections/:id",               ctrl.getElection);
router.post("/nation/elections/:id/vote",      requireAuth, ctrl.voteElection);
router.post("/nation/elections/:id/candidates", requireAuth, ctrl.registerCandidate);

// ── Budget ────────────────────────────────────────────────────────────────────
router.get ("/nation/budgets",                     ctrl.listBudgets);
router.post("/nation/budgets",         requireAuth, ctrl.createBudget);
router.get ("/nation/budgets/:id",                 ctrl.getBudget);
router.post("/nation/budgets/:id/approve", requireAuth, ctrl.approveBudget);
router.post("/nation/budgets/:id/items",   requireAuth, ctrl.addBudgetItem);

// ── Tax ───────────────────────────────────────────────────────────────────────
router.get ("/nation/tax/rules",                   ctrl.listTaxRules);
router.post("/nation/tax/rules",       requireAuth, ctrl.createTaxRule);
router.get ("/nation/tax/payments",    requireAuth, ctrl.listTaxPayments);
router.post("/nation/tax/pay",         requireAuth, ctrl.payTax);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get ("/nation/announcements",               ctrl.listAnnouncements);
router.post("/nation/announcements",   requireAuth, ctrl.createAnnouncement);
router.put ("/nation/announcements/:id", requireAuth, ctrl.updateAnnouncement);
router.delete("/nation/announcements/:id", requireAuth, ctrl.deleteAnnouncement);

// ── National Events ───────────────────────────────────────────────────────────
router.get ("/nation/events",                      ctrl.listNationalEvents);
router.post("/nation/events",          requireAuth, ctrl.createNationalEvent);

// ── Statistics ────────────────────────────────────────────────────────────────
router.get ("/nation/statistics",                  ctrl.getStatistics);
router.post("/nation/statistics",      requireAuth, ctrl.createStatistics);

export default router;
