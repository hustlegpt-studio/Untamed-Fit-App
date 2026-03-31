import { users, workouts, progressLogs, challenges, conversations, messages } from "@shared/schema";
import type { InsertUser, User, InsertWorkout, Workout, InsertProgressLog, ProgressLog, Challenge, Conversation, Message } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, settings: Partial<User>): Promise<User>;

  // Workouts
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;

  // Progress
  getProgressLogs(userId: number): Promise<ProgressLog[]>;
  createProgressLog(log: InsertProgressLog): Promise<ProgressLog>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: Omit<Challenge, "id">): Promise<Challenge>;

  // Chat
  getConversations(userId: number): Promise<Conversation[]>;
  createConversation(userId: number, title: string): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, settings: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users).set(settings).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  // Workouts
  async getWorkouts(): Promise<Workout[]> {
    return await db.select().from(workouts);
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  // Progress
  async getProgressLogs(userId: number): Promise<ProgressLog[]> {
    return await db.select().from(progressLogs).where(eq(progressLogs.userId, userId));
  }

  async createProgressLog(log: InsertProgressLog): Promise<ProgressLog> {
    const [newLog] = await db.insert(progressLogs).values(log).returning();
    return newLog;
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async createChallenge(challenge: Omit<Challenge, "id">): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  // Chat
  async getConversations(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async createConversation(userId: number, title: string): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values({ userId, title }).returning();
    return newConversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const [newMessage] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
