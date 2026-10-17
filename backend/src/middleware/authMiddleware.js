import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set when running in production.");
}

// A local fallback keeps first-time development simple. Production always
// requires a private secret so accounts cannot be impersonated with a known key.
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret";

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
 * Optional authentication for the public, non-persistent chat endpoint. A guest
 * may omit the token, but a supplied invalid token is still rejected instead of
 * silently treating that browser as a different guest.
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
    return res.status(401).json({
      error: "Invalid or expired authentication token.",
    });
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
