// Simple in-memory storage without SQLite dependencies
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").default("free").notNull(),
  blindMode: integer("blind_mode", { mode: "boolean" }).default(false).notNull(),
  voiceCues: integer("voice_cues", { mode: "boolean" }).default(true).notNull(),
  theme: text("theme").default("dark").notNull(),
});

export const workouts = sqliteTable("workouts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  duration: integer("duration"),
  isPremium: integer("is_premium", { mode: "boolean" }).default(false).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
});

export const progressLogs = sqliteTable("progress_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  weight: text("weight"), 
  workoutId: integer("workout_id", { mode: "number" }),
  photoUrl: text("photo_url"),
  date: integer("date", { mode: "timestamp" }).default(Date.now).notNull(),
});

export const challenges = sqliteTable("challenges", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goal: integer("goal", { mode: "number" }).notNull(), 
  reward: text("reward"),
});

export const conversations = sqliteTable("conversations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(Date.now).notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id", { mode: "number" }).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(Date.now).notNull(),
});

export const userWorkoutSessions = sqliteTable("user_workout_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  workoutName: text("workout_name").notNull(),
  bodyPart: text("body_part").notNull(),
  reps: integer("reps", { mode: "number" }).notNull(),
  sets: integer("sets", { mode: "number" }).notNull(),
  duration: integer("duration", { mode: "number" }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM
  userWeight: integer("user_weight", { mode: "number" }).default(0).notNull(),
  calories: integer("calories", { mode: "number" }).default(0).notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(Date.now).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(Date.now).notNull(),
});

export const bookingSessions = sqliteTable("booking_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  traineeEmail: text("trainee_email").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM format (e.g., "6:00 AM")
  duration: text("duration").notNull(), // "30 min", "45 min", "60 min", "90 min"
  type: text("type").notNull(), // Training type
  notes: text("notes"), // Optional notes
  status: text("status", { enum: ["booked", "cancelled", "completed"] }).default("booked").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(Date.now).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(Date.now).notNull(),
});

// In-memory storage for now
class MemoryStorage {
  private users: any[] = [];
  private workouts: any[] = [];
  private progressLogs: any[] = [];
  private challenges: any[] = [];
  private conversations: any[] = [];
  private messages: any[] = [];
  private nextId = 1;

  // Users
  async getUser(id: number) {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string) {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: any) {
    const newUser = { id: this.nextId++, ...user };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, settings: any) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...settings };
      return this.users[index];
    }
    throw new Error('User not found');
  }

  // Workouts
  async getWorkouts() {
    return this.workouts;
  }

  async getWorkout(id: number) {
    return this.workouts.find(w => w.id === id);
  }

  async createWorkout(workout: any) {
    const newWorkout = { id: this.nextId++, ...workout };
    this.workouts.push(newWorkout);
    return newWorkout;
  }

  // Progress
  async getProgressLogs(userId: number) {
    return this.progressLogs.filter(log => log.userId === userId);
  }

  async createProgressLog(log: any) {
    const newLog = { id: this.nextId++, date: Date.now(), ...log };
    this.progressLogs.push(newLog);
    return newLog;
  }

  // Challenges
  async getChallenges() {
    return this.challenges;
  }

  async createChallenge(challenge: any) {
    const newChallenge = { id: this.nextId++, ...challenge };
    this.challenges.push(newChallenge);
    return newChallenge;
  }

  // Chat
  async getConversations(userId: number) {
    return this.conversations.filter(conv => conv.userId === userId);
  }

  async createConversation(userId: number, title: string) {
    const newConversation = { id: this.nextId++, userId, title, createdAt: Date.now() };
    this.conversations.push(newConversation);
    return newConversation;
  }

  async getMessages(conversationId: number) {
    return this.messages.filter(msg => msg.conversationId === conversationId);
  }

  async createMessage(conversationId: number, role: string, content: string) {
    const newMessage = { id: this.nextId++, conversationId, role, content, createdAt: Date.now() };
    this.messages.push(newMessage);
    return newMessage;
  }
}

export const memoryStorage = new MemoryStorage();

// Add some sample data
async function initSampleData() {
  try {
    // Add sample workouts
    await memoryStorage.createWorkout({
      title: "Push-ups",
      description: "Classic upper body exercise",
      category: "Chest",
      type: "body_part",
      duration: 10,
      isPremium: false
    });

    await memoryStorage.createWorkout({
      title: "Squats",
      description: "Lower body strength exercise",
      category: "Legs",
      type: "body_part",
      duration: 15,
      isPremium: false
    });

    // Add sample challenges
    await memoryStorage.createChallenge({
      title: "30-Day Plank Challenge",
      description: "Hold a plank for increasing duration each day",
      goal: 30,
      reward: "Core strength badge"
    });

    console.log("Sample data initialized");
  } catch (error) {
    console.log("Sample data already exists");
  }
}

initSampleData();

// Base schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true });
export const insertProgressLogSchema = createInsertSchema(progressLogs).omit({ id: true, date: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workout = typeof workouts.$inferSelect;
export type ProgressLog = typeof progressLogs.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
