import express from "express";
import {
  healthCheck,
  getSessions,
  createNewSession,
  getSessionMessages,
  updateSessionTitle,
  deleteSession,
  getConversations,
  createConversationMessage,
} from "../controllers/chatController.js";
import {
  authenticateToken,
  optionalAuthenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Test that the backend is working.
router.get("/", healthCheck);

// Chat session endpoints
router.get("/sessions", authenticateToken, getSessions);
router.post("/sessions", authenticateToken, createNewSession);
router.get("/sessions/:id", authenticateToken, getSessionMessages);
router.put("/sessions/:id", authenticateToken, updateSessionTitle);
router.delete("/sessions/:id", authenticateToken, deleteSession);

// Conversation messages endpoints
router.get("/conversations", authenticateToken, getConversations);
router.post("/conversations", optionalAuthenticateToken, createConversationMessage);

export default router;
