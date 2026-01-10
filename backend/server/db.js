import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  throw new Error("Please add your MongoDB URI to .env.local or environment variables");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "habitflow";

// MongoDB client options (workaround for Node v18)
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

let db;

export async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    
    // Test the connection
    await client.db("admin").command({ ping: 1 });
    
    db = client.db(dbName);
    console.log(`✅ Connected to MongoDB database: ${dbName}`);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    process.exit(1); // Exit process if can't connect to DB
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}

export async function closeDB() {
  await client.close();
}
