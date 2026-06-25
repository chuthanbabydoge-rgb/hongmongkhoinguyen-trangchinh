import { Router } from "express";
import {
  handleGetRooms,
  handleCreateRoom,
  handleGetRoom,
  handleDeleteRoom,
  handleJoinRoom,
  handleLeaveRoom,
  handleGetMembers,
  handleGetOrCreatePrivate,
  handleGetOrCreateGuild,
  handleGetMessages,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleReact,
  handleRemoveReact,
  handleMarkRead,
  handlePinMessage,
  handleUnpinMessage,
  handleGetPins,
  handleSearchMessages,
  handleTyping,
  handleGetSettings,
  handleUpdateSettings,
  handleBlockUser,
  handleUnblockUser,
  handleReportMessage,
  handleGetDashboard,
} from "../controllers/chatController.js";

const chatRouter = Router();

// Dashboard
chatRouter.get("/chat/dashboard", handleGetDashboard);

// Rooms
chatRouter.get("/chat/rooms",          handleGetRooms);
chatRouter.post("/chat/rooms",         handleCreateRoom);
chatRouter.post("/chat/rooms/private", handleGetOrCreatePrivate);
chatRouter.post("/chat/rooms/guild",   handleGetOrCreateGuild);
chatRouter.get("/chat/rooms/:id",              handleGetRoom);
chatRouter.delete("/chat/rooms/:id",           handleDeleteRoom);
chatRouter.post("/chat/rooms/:id/join",        handleJoinRoom);
chatRouter.post("/chat/rooms/:id/leave",       handleLeaveRoom);
chatRouter.get("/chat/rooms/:id/members",      handleGetMembers);
chatRouter.get("/chat/rooms/:id/messages",     handleGetMessages);
chatRouter.post("/chat/rooms/:id/messages",    handleSendMessage);
chatRouter.get("/chat/rooms/:id/pins",         handleGetPins);
chatRouter.get("/chat/rooms/:id/search",       handleSearchMessages);
chatRouter.post("/chat/rooms/:id/typing",      handleTyping);

// Messages
chatRouter.patch("/chat/messages/:id/edit",    handleEditMessage);
chatRouter.delete("/chat/messages/:id",        handleDeleteMessage);
chatRouter.post("/chat/messages/:id/react",    handleReact);
chatRouter.delete("/chat/messages/:id/react",  handleRemoveReact);
chatRouter.post("/chat/messages/:id/read",     handleMarkRead);
chatRouter.post("/chat/messages/:id/pin",      handlePinMessage);
chatRouter.post("/chat/messages/:id/unpin",    handleUnpinMessage);
chatRouter.post("/chat/messages/:id/report",   handleReportMessage);

// Settings & Blocks
chatRouter.get("/chat/settings",            handleGetSettings);
chatRouter.patch("/chat/settings",          handleUpdateSettings);
chatRouter.post("/chat/blocks",             handleBlockUser);
chatRouter.delete("/chat/blocks/:blockedUserId", handleUnblockUser);

export default chatRouter;
