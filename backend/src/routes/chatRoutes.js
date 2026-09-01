import express from "express";
import { healthCheck } from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat
router.get("/", healthCheck);

export default router;
