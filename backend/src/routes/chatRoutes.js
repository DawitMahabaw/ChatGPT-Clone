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
import { optionalAuthenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test that the backend is working.
router.get("/", healthCheck);

// Chat session endpoints
router.get("/sessions", optionalAuthenticateToken, getSessions);
router.post("/sessions", optionalAuthenticateToken, createNewSession);
router.get("/sessions/:id", optionalAuthenticateToken, getSessionMessages);
router.put("/sessions/:id", optionalAuthenticateToken, updateSessionTitle);
router.delete("/sessions/:id", optionalAuthenticateToken, deleteSession);

// Conversation messages endpoints
router.get("/conversations", optionalAuthenticateToken, getConversations);
router.post("/conversations", optionalAuthenticateToken, createConversationMessage);

export default router;
