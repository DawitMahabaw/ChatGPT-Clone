import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/userModel.js";
import { generateToken } from "../middleware/authMiddleware.js";

/**
 * Handle user registration (Sign Up)
 */
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "Username is required." });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the user in MySQL
    const userId = await createUser({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    const user = {
      id: userId,
      username: username.trim(),
      email: email.trim().toLowerCase(),
    };

    // Issue JWT token
    const token = generateToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      user,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      error: "Failed to create account. Please try again.",
    });
  }
};

/**
 * Handle user authentication (Log In)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // Issue JWT token
    const token = generateToken(userData);

    return res.status(200).json({
      message: "Logged in successfully.",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      error: "Failed to log in. Please try again.",
    });
  }
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error.message);
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
};
