import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chatgpt_jwt_secret_key_2026";

/**
 * Middleware that requires a valid JWT Bearer token.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access denied. Authentication token is required.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired authentication token.",
    });
  }
};

/**
 * Optional authentication: If a token is provided, verify and attach user.
 * If not provided, continue as guest (req.user = null).
 */
export const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }

  next();
};

/**
 * Generate a JWT token for a user.
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};
