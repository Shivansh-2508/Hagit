import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === "fallback-secret-key") {
  console.warn("⚠️  WARNING: Using insecure JWT secret! Set JWT_SECRET in environment variables.");
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production environment");
  }
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET || "fallback-secret-key", (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user; // Add user info to request
    next();
  });
}

export function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET || "fallback-secret-key",
    { expiresIn: "7d" } // Token expires in 7 days
  );
}
