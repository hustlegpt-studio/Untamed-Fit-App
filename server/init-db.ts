import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../shared/schema";

// Create database client
const client = createClient({
  url: "file:.data/db.sqlite",
});

const db = drizzle(client, { schema });

// Create tables manually since drizzle-kit might not be available
export function initializeDatabase() {
  // Create users table
  client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      subscription_tier TEXT DEFAULT 'free' NOT NULL,
      blind_mode INTEGER DEFAULT 0 NOT NULL,
      voice_cues INTEGER DEFAULT 1 NOT NULL,
      theme TEXT DEFAULT 'dark' NOT NULL
    )
  `);

  // Create workouts table
  client.execute(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER,
      is_premium INTEGER DEFAULT 0 NOT NULL,
      thumbnail_url TEXT,
      video_url TEXT
    )
  `);

  // Create progress_logs table
  client.execute(`
    CREATE TABLE IF NOT EXISTS progress_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight TEXT,
      workout_id INTEGER,
      photo_url TEXT,
      date INTEGER NOT NULL
    )
  `);

  // Create challenges table
  client.execute(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      goal INTEGER NOT NULL,
      reward TEXT
    )
  `);

  // Create conversations table
  client.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // Create messages table
  client.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  console.log("Database tables initialized successfully");
}

// Initialize database if needed
initializeDatabase();
