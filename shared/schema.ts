import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").default("free").notNull(), // free, pro, elite
  blindMode: boolean("blind_mode").default(false).notNull(),
  voiceCues: boolean("voice_cues").default(true).notNull(),
  theme: text("theme").default("dark").notNull(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Chest, Back, Full Body, etc.
  type: text("type").notNull(), // 'body_part', 'video_premium'
  duration: integer("duration"), // in minutes
  isPremium: boolean("is_premium").default(false).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
});

export const progressLogs = pgTable("progress_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  weight: text("weight"), 
  workoutId: integer("workout_id"),
  photoUrl: text("photo_url"),
  date: timestamp("date").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goal: integer("goal").notNull(), 
  reward: text("reward"),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
