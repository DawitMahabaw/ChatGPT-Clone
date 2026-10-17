import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new user
router.post("/signup", signup);

// Log in an existing user
router.post("/login", login);

// Retrieve the current user profile
router.get("/me", authenticateToken, getMe);

export default router;
