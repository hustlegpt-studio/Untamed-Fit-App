import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").default("free").notNull(), // free, pro, elite
  blindMode: integer("blind_mode", { mode: "boolean" }).default(false).notNull(),
  voiceCues: integer("voice_cues", { mode: "boolean" }).default(true).notNull(),
  theme: text("theme").default("dark").notNull(),
});

export const workouts = sqliteTable("workouts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Chest, Back, Full Body, etc.
  type: text("type").notNull(), // 'body_part', 'video_premium'
  duration: integer("duration"), // in minutes
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
