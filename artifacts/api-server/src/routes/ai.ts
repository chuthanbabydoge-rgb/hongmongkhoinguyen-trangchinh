import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleAiStatus,
  handleAiDashboard,
  handleListConversations,
  handleCreateConversation,
  handleGetConversation,
  handleDeleteConversation,
  handleListMessages,
  handleChat,
  handleListMemory,
  handleCreateMemory,
  handleDeleteMemory,
  handleListSuggestions,
  handleDismissSuggestion,
  handleFeedback,
  handleGenerateSuggestions,
} from "../controllers/aiController.js";

const router: IRouter = Router();

router.get("/ai",                                         handleAiStatus);
router.get("/ai/status",                                  handleAiStatus);
router.get("/ai/dashboard",              requireAuth,     handleAiDashboard);

// Conversations
router.get("/ai/conversations",          requireAuth,     handleListConversations);
router.post("/ai/conversations",         requireAuth,     handleCreateConversation);
router.get("/ai/conversations/:id",      requireAuth,     handleGetConversation);
router.delete("/ai/conversations/:id",   requireAuth,     handleDeleteConversation);

// Messages
router.get("/ai/messages/:conversationId", requireAuth,  handleListMessages);

// Chat
router.post("/ai/chat",                  requireAuth,     handleChat);

// Memory
router.get("/ai/memory",                 requireAuth,     handleListMemory);
router.post("/ai/memory",                requireAuth,     handleCreateMemory);
router.delete("/ai/memory/:id",          requireAuth,     handleDeleteMemory);

// Suggestions
router.get("/ai/suggestions",            requireAuth,     handleListSuggestions);
router.delete("/ai/suggestions/:id",     requireAuth,     handleDismissSuggestion);
router.post("/ai/suggestions/generate",  requireAuth,     handleGenerateSuggestions);

// Feedback
router.post("/ai/feedback",              requireAuth,     handleFeedback);

export default router;
