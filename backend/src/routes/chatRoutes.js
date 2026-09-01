import express from "express";

import {
  healthCheck,
  getConversations,
} from "../controllers/chatController.js";

const router = express.Router();

// Test that the backend is working.
router.get("/", healthCheck);

// Get recent conversations from the database.
router.get("/conversations", getConversations);

export default router;
