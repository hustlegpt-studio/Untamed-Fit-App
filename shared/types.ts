// Type definitions without database dependencies
import { z } from "zod";

export interface User {
  id: number;
  username: string;
  password: string;
  subscriptionTier: string;
  blindMode: boolean;
  voiceCues: boolean;
  theme: string;
}

export interface Workout {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  duration?: number;
  isPremium: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface ProgressLog {
  id: number;
  userId: number;
  weight?: string;
  workoutId?: number;
  photoUrl?: string;
  date: number;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  goal: number;
  reward?: string;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: number;
}

export interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: number;
}

// Zod schemas
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  subscriptionTier: z.string().default("free"),
  blindMode: z.boolean().default(false),
  voiceCues: z.boolean().default(true),
  theme: z.string().default("dark"),
});

export const insertWorkoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  type: z.string(),
  duration: z.number().optional(),
  isPremium: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const insertProgressLogSchema = z.object({
  userId: z.number(),
  weight: z.string().optional(),
  workoutId: z.number().optional(),
  photoUrl: z.string().optional(),
});

export const insertChallengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  goal: z.number(),
  reward: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertProgressLog = z.infer<typeof insertProgressLogSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
