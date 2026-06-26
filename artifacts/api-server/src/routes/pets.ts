import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleListSpecies,
  handleListPets, handleCreatePet, handleGetPet, handleDeletePet,
  handleFeedPet, handleTrainPet, handleEvolvePet,
  handleEquipPet, handleUnequipPet, handleGetPetEquipment,
  handleListPetSkills, handleLearnPetSkill, handleGetPetSkills,
  handleSummonPet, handleDismissPet, handleGetSummonedPet,
  handleGetPetBond, handleGetPetLogs,
  handleListMountTypes,
  handleListMounts, handleCreateMount, handleGetMount,
  handleTrainMount, handleEquipMount, handleTravelMount,
  handleGetMountStatistics, handleListRoutes,
  handleGetMountCustomization, handleUpdateMountCustomization,
  handleGetTravelLogs,
} from "../controllers/petController.js";

const router: IRouter = Router();

// ─── Species ──────────────────────────────────────────────────────────────────
router.get("/pets/species",                    handleListSpecies);

// ─── Pet CRUD ─────────────────────────────────────────────────────────────────
router.get   ("/pets",                         requireAuth, handleListPets);
router.post  ("/pets",                         requireAuth, handleCreatePet);
router.get   ("/pets/summoned",                requireAuth, handleGetSummonedPet);
router.get   ("/pets/:id",                     requireAuth, handleGetPet);
router.delete("/pets/:id",                     requireAuth, handleDeletePet);

// ─── Actions ──────────────────────────────────────────────────────────────────
router.post("/pets/:id/feed",                  requireAuth, handleFeedPet);
router.post("/pets/:id/train",                 requireAuth, handleTrainPet);
router.post("/pets/:id/evolve",                requireAuth, handleEvolvePet);
router.post("/pets/:id/summon",                requireAuth, handleSummonPet);
router.post("/pets/:id/dismiss",               requireAuth, handleDismissPet);

// ─── Equipment ────────────────────────────────────────────────────────────────
router.get ("/pets/:id/equipment",             requireAuth, handleGetPetEquipment);
router.post("/pets/:id/equip",                 requireAuth, handleEquipPet);
router.post("/pets/:id/unequip",               requireAuth, handleUnequipPet);

// ─── Skills ───────────────────────────────────────────────────────────────────
router.get ("/pets/skills/list",               handleListPetSkills);
router.get ("/pets/:id/skills",                requireAuth, handleGetPetSkills);
router.post("/pets/:id/skill",                 requireAuth, handleLearnPetSkill);

// ─── Bond & Logs ──────────────────────────────────────────────────────────────
router.get("/pets/:id/bond",                   requireAuth, handleGetPetBond);
router.get("/pets/:id/logs",                   requireAuth, handleGetPetLogs);

// ─── Mount Types ──────────────────────────────────────────────────────────────
router.get("/mounts/types",                    handleListMountTypes);
router.get("/mounts/routes",                   handleListRoutes);
router.get("/mounts/statistics",               requireAuth, handleGetMountStatistics);
router.get("/mounts/travel-logs",              requireAuth, handleGetTravelLogs);

// ─── Mount CRUD ───────────────────────────────────────────────────────────────
router.get ("/mounts",                         requireAuth, handleListMounts);
router.post("/mounts",                         requireAuth, handleCreateMount);
router.get ("/mounts/:id",                     requireAuth, handleGetMount);

// ─── Mount Actions ────────────────────────────────────────────────────────────
router.post("/mounts/:id/train",               requireAuth, handleTrainMount);
router.post("/mounts/:id/equip",               requireAuth, handleEquipMount);
router.post("/mounts/:id/travel",              requireAuth, handleTravelMount);

// ─── Mount Customization ──────────────────────────────────────────────────────
router.get ("/mounts/:id/customization",       requireAuth, handleGetMountCustomization);
router.put ("/mounts/:id/customization",       requireAuth, handleUpdateMountCustomization);

export default router;
