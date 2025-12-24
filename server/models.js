import bcrypt from "bcryptjs";
import { getDB } from "./db.js";

// User model functions
export async function createUser(email, password, name) {
  const db = getDB();
  const usersCollection = db.collection("users_auth");

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = {
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(user);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: result.insertedId };
}

export async function findUserByEmail(email) {
  const db = getDB();
  const usersCollection = db.collection("users_auth");
  return await usersCollection.findOne({ email });
}

export async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function findUserById(userId) {
  const db = getDB();
  const usersCollection = db.collection("users_auth");
  const { ObjectId } = await import("mongodb");
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}
