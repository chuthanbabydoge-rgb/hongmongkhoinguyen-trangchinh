// ─────────────────────────────────────────────────────────────────────────────
// Land Routes — HUB-28
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import { landService } from "../container.js";
import { LandController } from "../controllers/landController.js";

const router = Router();
const ctrl   = new LandController(landService);

// Dashboard & Stats
router.get("/land/dashboard",    ctrl.getDashboard);
router.get("/land/statistics",   ctrl.getStatistics);
router.get("/land/analytics",    ctrl.getAnalytics);

// Regions
router.get("/land/regions",          ctrl.listRegions);
router.post("/land/regions",         ctrl.createRegion);
router.get("/land/regions/:id",      ctrl.getRegion);
router.put("/land/regions/:id",      ctrl.updateRegion);
router.delete("/land/regions/:id",   ctrl.deleteRegion);

// Cities
router.get("/land/cities",           ctrl.listCities);
router.post("/land/cities",          ctrl.createCity);
router.get("/land/cities/:id",       ctrl.getCity);
router.put("/land/cities/:id",       ctrl.updateCity);
router.delete("/land/cities/:id",    ctrl.deleteCity);

// Districts
router.get("/land/districts",        ctrl.listDistricts);
router.post("/land/districts",       ctrl.createDistrict);
router.get("/land/districts/:id",    ctrl.getDistrict);
router.put("/land/districts/:id",    ctrl.updateDistrict);

// Parcels
router.get("/land/parcels",          ctrl.listParcels);
router.post("/land/parcels",         ctrl.createParcel);
router.get("/land/parcels/:id",      ctrl.getParcel);
router.put("/land/parcels/:id",      ctrl.updateParcel);
router.post("/land/parcels/:id/buy",  ctrl.buyParcel);
router.post("/land/parcels/:id/sell", ctrl.sellParcel);
router.post("/land/parcels/:id/rent", ctrl.rentParcel);

// Parcel Visitors
router.post("/land/parcels/:parcelId/visit",    ctrl.recordVisit);
router.get("/land/parcels/:parcelId/visitors",  ctrl.getVisitors);

// Parcel Ratings
router.post("/land/parcels/:parcelId/rate",     ctrl.rateParcel);
router.get("/land/parcels/:parcelId/ratings",   ctrl.listRatings);

// Parcel Permissions
router.get("/land/parcels/:parcelId/permissions",    ctrl.listPermissions);
router.post("/land/parcels/:parcelId/permissions",   ctrl.grantPermission);
router.delete("/land/permissions/:id",               ctrl.revokePermission);

// Buildings
router.get("/land/buildings",             ctrl.listBuildings);
router.post("/land/buildings",            ctrl.createBuilding);
router.get("/land/buildings/:id",         ctrl.getBuilding);
router.post("/land/buildings/:id/upgrade", ctrl.upgradeBuilding);
router.delete("/land/buildings/:id",      ctrl.destroyBuilding);

// Building Templates
router.get("/land/templates",      ctrl.listTemplates);
router.get("/land/templates/:id",  ctrl.getTemplate);

// Construction
router.get("/land/construction",             ctrl.listProjects);
router.post("/land/construction",            ctrl.createProject);
router.get("/land/construction/:id",         ctrl.getProject);
router.post("/land/construction/:id/complete", ctrl.completeProject);
router.post("/land/construction/:id/cancel",   ctrl.cancelProject);

// Roads
router.get("/land/roads",         ctrl.listRoads);
router.post("/land/roads",        ctrl.createRoad);
router.put("/land/roads/:id",     ctrl.updateRoad);

// Utilities
router.get("/land/utilities",     ctrl.listUtilities);
router.post("/land/utilities",    ctrl.createUtility);

// Teleports
router.get("/land/teleports",           ctrl.listTeleports);
router.post("/land/teleports",          ctrl.createTeleport);
router.get("/land/teleports/:id",       ctrl.getTeleport);
router.post("/land/teleports/:id/use",  ctrl.useTeleport);

// Bookmarks
router.get("/land/bookmarks",               ctrl.listBookmarks);
router.post("/land/bookmarks",              ctrl.addBookmark);
router.delete("/land/bookmarks/:parcelId",  ctrl.removeBookmark);

// Marketplace
router.get("/land/marketplace",       ctrl.listMarketplace);
router.post("/land/marketplace",      ctrl.createListing);
router.get("/land/marketplace/:id",   ctrl.getListing);
router.delete("/land/marketplace/:id", ctrl.delistListing);

// Transactions
router.get("/land/transactions",   ctrl.listTransactions);
router.post("/land/transactions",  ctrl.createTransaction);

// Events
router.get("/land/events",    ctrl.listEvents);
router.post("/land/events",   ctrl.createEvent);

export default router;
