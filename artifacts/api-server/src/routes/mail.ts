import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleGetMail,
  handleGetUnread,
  handleGetDashboard,
  handleGetMailById,
  handleSendMail,
  handleMarkRead,
  handleMarkAllRead,
  handleClaimAttachments,
  handleArchiveMail,
  handleDeleteMail,
  handleGetLabels,
  handleCreateLabel,
  handleBroadcast,
} from "../controllers/mailController.js";

const router = Router();

router.get(  "/mail/dashboard",     requireAuth, handleGetDashboard);
router.get(  "/mail/unread",        requireAuth, handleGetUnread);
router.get(  "/mail/labels",        requireAuth, handleGetLabels);
router.post( "/mail/labels",        requireAuth, handleCreateLabel);
router.patch("/mail/read-all",      requireAuth, handleMarkAllRead);
router.post( "/mail/broadcast",     handleBroadcast);
router.get(  "/mail",               requireAuth, handleGetMail);
router.post( "/mail",               handleSendMail);
router.get(  "/mail/:id",           requireAuth, handleGetMailById);
router.patch("/mail/:id/read",      requireAuth, handleMarkRead);
router.post( "/mail/:id/claim",     requireAuth, handleClaimAttachments);
router.post( "/mail/:id/archive",   requireAuth, handleArchiveMail);
router.delete("/mail/:id",          requireAuth, handleDeleteMail);

export default router;
