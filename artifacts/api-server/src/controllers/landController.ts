// ─────────────────────────────────────────────────────────────────────────────
// LandController — HUB-28
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";
import type { LandService } from "../services/landService.js";
import { LandError } from "../services/landService.js";

function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ success: true, data });
}

function fail(res: Response, err: unknown) {
  if (err instanceof LandError) {
    res.status(err.status).json({ success: false, error: err.message, code: err.code });
  } else {
    res.status(500).json({ success: false, error: "Lỗi server nội bộ" });
  }
}

export class LandController {
  constructor(private readonly svc: LandService) {}

  // ── Dashboard & Stats ─────────────────────────────────────────────────────

  getDashboard   = async (req: Request, res: Response) => { try { ok(res, await this.svc.getDashboard()); } catch (e) { fail(res, e); } };
  getStatistics  = async (req: Request, res: Response) => { try { ok(res, await this.svc.getStatistics()); } catch (e) { fail(res, e); } };
  getAnalytics   = async (req: Request, res: Response) => { try { ok(res, await this.svc.getAnalytics()); } catch (e) { fail(res, e); } };

  // ── Regions ───────────────────────────────────────────────────────────────

  listRegions  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listRegions(req.query as never)); } catch (e) { fail(res, e); } };
  getRegion    = async (req: Request, res: Response) => { try { ok(res, await this.svc.getRegion(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createRegion = async (req: Request, res: Response) => { try { ok(res, await this.svc.createRegion(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  updateRegion = async (req: Request, res: Response) => { try { ok(res, await this.svc.updateRegion(req.params["id"] as string, req.body as never)); } catch (e) { fail(res, e); } };
  deleteRegion = async (req: Request, res: Response) => { try { ok(res, await this.svc.deleteRegion(req.params["id"] as string)); } catch (e) { fail(res, e); } };

  // ── Cities ────────────────────────────────────────────────────────────────

  listCities  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listCities(req.query as never)); } catch (e) { fail(res, e); } };
  getCity     = async (req: Request, res: Response) => { try { ok(res, await this.svc.getCity(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createCity  = async (req: Request, res: Response) => { try { ok(res, await this.svc.createCity(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  updateCity  = async (req: Request, res: Response) => { try { ok(res, await this.svc.updateCity(req.params["id"] as string, req.body as never)); } catch (e) { fail(res, e); } };
  deleteCity  = async (req: Request, res: Response) => { try { ok(res, await this.svc.deleteCity(req.params["id"] as string)); } catch (e) { fail(res, e); } };

  // ── Districts ─────────────────────────────────────────────────────────────

  listDistricts  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listDistricts(req.query as never)); } catch (e) { fail(res, e); } };
  getDistrict    = async (req: Request, res: Response) => { try { ok(res, await this.svc.getDistrict(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createDistrict = async (req: Request, res: Response) => { try { ok(res, await this.svc.createDistrict(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  updateDistrict = async (req: Request, res: Response) => { try { ok(res, await this.svc.updateDistrict(req.params["id"] as string, req.body as never)); } catch (e) { fail(res, e); } };

  // ── Parcels ───────────────────────────────────────────────────────────────

  listParcels  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listParcels(req.query as never)); } catch (e) { fail(res, e); } };
  getParcel    = async (req: Request, res: Response) => { try { ok(res, await this.svc.getParcel(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createParcel = async (req: Request, res: Response) => { try { ok(res, await this.svc.createParcel(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  updateParcel = async (req: Request, res: Response) => { try { ok(res, await this.svc.updateParcel(req.params["id"] as string, req.body as never)); } catch (e) { fail(res, e); } };
  buyParcel    = async (req: Request, res: Response) => { try { ok(res, await this.svc.buyParcel(req.params["id"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };
  sellParcel   = async (req: Request, res: Response) => { try { ok(res, await this.svc.sellParcel(req.params["id"] as string, (req.body as { price: number }).price, req.headers.authorization)); } catch (e) { fail(res, e); } };
  rentParcel   = async (req: Request, res: Response) => { try { ok(res, await this.svc.rentParcel(req.params["id"] as string, req.body as never, req.headers.authorization)); } catch (e) { fail(res, e); } };

  // ── Buildings ─────────────────────────────────────────────────────────────

  listBuildings   = async (req: Request, res: Response) => { try { ok(res, await this.svc.listBuildings(req.query as never)); } catch (e) { fail(res, e); } };
  getBuilding     = async (req: Request, res: Response) => { try { ok(res, await this.svc.getBuilding(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createBuilding  = async (req: Request, res: Response) => { try { ok(res, await this.svc.createBuilding(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  upgradeBuilding = async (req: Request, res: Response) => { try { ok(res, await this.svc.upgradeBuilding(req.params["id"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };
  destroyBuilding = async (req: Request, res: Response) => { try { ok(res, await this.svc.destroyBuilding(req.params["id"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };

  // ── Templates ─────────────────────────────────────────────────────────────

  listTemplates = async (req: Request, res: Response) => { try { ok(res, await this.svc.listTemplates()); } catch (e) { fail(res, e); } };
  getTemplate   = async (req: Request, res: Response) => { try { ok(res, await this.svc.getTemplate(req.params["id"] as string)); } catch (e) { fail(res, e); } };

  // ── Construction ──────────────────────────────────────────────────────────

  listProjects   = async (req: Request, res: Response) => { try { ok(res, await this.svc.listProjects(req.query as never)); } catch (e) { fail(res, e); } };
  getProject     = async (req: Request, res: Response) => { try { ok(res, await this.svc.getProject(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createProject  = async (req: Request, res: Response) => { try { ok(res, await this.svc.createProject(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  completeProject = async (req: Request, res: Response) => { try { ok(res, await this.svc.completeProject(req.params["id"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };
  cancelProject  = async (req: Request, res: Response) => { try { ok(res, await this.svc.cancelProject(req.params["id"] as string)); } catch (e) { fail(res, e); } };

  // ── Roads ─────────────────────────────────────────────────────────────────

  listRoads  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listRoads(req.query as never)); } catch (e) { fail(res, e); } };
  createRoad = async (req: Request, res: Response) => { try { ok(res, await this.svc.createRoad(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  updateRoad = async (req: Request, res: Response) => { try { ok(res, await this.svc.updateParcel(req.params["id"] as string, req.body as never)); } catch (e) { fail(res, e); } };

  // ── Utilities ─────────────────────────────────────────────────────────────

  listUtilities  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listUtilities(req.query as never)); } catch (e) { fail(res, e); } };
  createUtility  = async (req: Request, res: Response) => { try { ok(res, await this.svc.createUtility(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };

  // ── Teleports ─────────────────────────────────────────────────────────────

  listTeleports  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listTeleports(req.query as never)); } catch (e) { fail(res, e); } };
  getTeleport    = async (req: Request, res: Response) => { try { ok(res, await this.svc.getTeleport(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createTeleport = async (req: Request, res: Response) => { try { ok(res, await this.svc.createTeleport(req.body as never, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  useTeleport    = async (req: Request, res: Response) => { try { ok(res, await this.svc.useTeleport(req.params["id"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };

  // ── Bookmarks ─────────────────────────────────────────────────────────────

  listBookmarks  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listBookmarks(req.headers.authorization)); } catch (e) { fail(res, e); } };
  addBookmark    = async (req: Request, res: Response) => { try { ok(res, await this.svc.addBookmark((req.body as { parcelId: string }).parcelId, (req.body as { note?: string }).note, req.headers.authorization), 201); } catch (e) { fail(res, e); } };
  removeBookmark = async (req: Request, res: Response) => { try { ok(res, await this.svc.removeBookmark(req.params["parcelId"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };

  // ── Permissions ───────────────────────────────────────────────────────────

  listPermissions  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listPermissions(req.params["parcelId"] as string)); } catch (e) { fail(res, e); } };
  grantPermission  = async (req: Request, res: Response) => {
    try {
      const { parcelId } = req.params as { parcelId: string };
      const body = req.body as { userId: string; canBuild?: boolean; canDestroy?: boolean; canVisit?: boolean; canManage?: boolean };
      const grantedBy = req.headers.authorization ?? "system";
      ok(res, await this.svc.grantPermission(parcelId, body.userId, body, grantedBy), 201);
    } catch (e) { fail(res, e); }
  };
  revokePermission = async (req: Request, res: Response) => { try { ok(res, await this.svc.revokePermission(req.params["id"] as string)); } catch (e) { fail(res, e); } };

  // ── Visitors ──────────────────────────────────────────────────────────────

  recordVisit  = async (req: Request, res: Response) => { try { ok(res, await this.svc.recordVisit(req.params["parcelId"] as string, req.headers.authorization)); } catch (e) { fail(res, e); } };
  getVisitors  = async (req: Request, res: Response) => { try { ok(res, await this.svc.getVisitors(req.params["parcelId"] as string)); } catch (e) { fail(res, e); } };

  // ── Ratings ───────────────────────────────────────────────────────────────

  rateParcel   = async (req: Request, res: Response) => {
    try {
      const body = req.body as { rating: number; review?: string };
      ok(res, await this.svc.rateParcel(req.params["parcelId"] as string, body.rating, body.review, req.headers.authorization));
    } catch (e) { fail(res, e); }
  };
  listRatings  = async (req: Request, res: Response) => { try { ok(res, await this.svc.repo.listRatings(req.params["parcelId"] as string)); } catch (e) { fail(res, e); } };

  // ── Marketplace ───────────────────────────────────────────────────────────

  listMarketplace  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listMarketplace(req.query as never)); } catch (e) { fail(res, e); } };
  getListing       = async (req: Request, res: Response) => { try { ok(res, await this.svc.getListing(req.params["id"] as string)); } catch (e) { fail(res, e); } };
  createListing    = async (req: Request, res: Response) => {
    try {
      const body = req.body as { parcelId: string; price: number; listingType?: string };
      ok(res, await this.svc.createListing(body.parcelId, body.price, body.listingType ?? "SALE", req.headers.authorization), 201);
    } catch (e) { fail(res, e); }
  };
  delistListing    = async (req: Request, res: Response) => { try { ok(res, await this.svc.delistListing(req.params["id"] as string)); } catch (e) { fail(res, e); } };

  // ── Transactions ──────────────────────────────────────────────────────────

  listTransactions  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listTransactions(req.query as never)); } catch (e) { fail(res, e); } };
  createTransaction = async (req: Request, res: Response) => { try { ok(res, await this.svc.createTransaction(req.body as never), 201); } catch (e) { fail(res, e); } };

  // ── Events ────────────────────────────────────────────────────────────────

  listEvents  = async (req: Request, res: Response) => { try { ok(res, await this.svc.listEvents(req.query as never)); } catch (e) { fail(res, e); } };
  createEvent = async (req: Request, res: Response) => { try { ok(res, await this.svc.createLandEvent(req.body as never), 201); } catch (e) { fail(res, e); } };
}
