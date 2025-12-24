import express from "express";
import cors from "cors";
import { connectDB, getDB } from "./db.js";
import {
  createUser,
  findUserByEmail,
  validatePassword,
  findUserById,
} from "./models.js";
import { authenticateToken, generateToken } from "./middleware.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
await connectDB();

// ============ AUTH ROUTES ============

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await createUser(email, password, name);
    const token = generateToken(user._id.toString(), user.email);

    res.json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await validatePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ============ USER DATA ROUTES (PROTECTED) ============

// Get user's habit data
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.userId;

    console.log(`📊 Fetching data for user: ${userId}`);

    let userData = await db.collection("user_data").findOne({ userId });

    if (!userData) {
      // Initialize user data
      userData = {
        userId,
        habits: [],
        logs: {},
        stats: { streakFreezes: 0, totalXp: 0 },
        updatedAt: new Date(),
      };
      await db.collection("user_data").insertOne(userData);
      console.log(`✨ Created new data for user: ${userId}`);
    } else {
      console.log(
        `✅ Loaded existing data for user: ${userId}, habits: ${userData.habits.length}`
      );
    }

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Update user's habit data
app.post("/api/user", authenticateToken, async (req, res) => {
  try {
    const { habits, logs, stats } = req.body;
    const db = getDB();
    const userId = req.user.userId;

    console.log(`💾 Saving data for user: ${userId}, habits: ${habits.length}`);

    await db.collection("user_data").updateOne(
      { userId },
      {
        $set: {
          habits,
          logs,
          stats,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`✅ Data saved successfully for user: ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Failed to update user data" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
