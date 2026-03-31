import { memoryStorage } from "./memory-storage";
import type { InsertUser, User, InsertWorkout, Workout, InsertProgressLog, ProgressLog, Challenge, Conversation, Message } from "../shared/schema";

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
    return memoryStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return memoryStorage.getUserByUsername(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return memoryStorage.createUser(insertUser);
  }

  async updateUser(id: number, settings: Partial<User>): Promise<User> {
    return memoryStorage.updateUser(id, settings);
  }

  // Workouts
  async getWorkouts(): Promise<Workout[]> {
    return memoryStorage.getWorkouts();
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return memoryStorage.getWorkout(id);
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    return memoryStorage.createWorkout(workout);
  }

  // Progress
  async getProgressLogs(userId: number): Promise<ProgressLog[]> {
    return memoryStorage.getProgressLogs(userId);
  }

  async createProgressLog(log: InsertProgressLog): Promise<ProgressLog> {
    return memoryStorage.createProgressLog(log);
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return memoryStorage.getChallenges();
  }

  async createChallenge(challenge: Omit<Challenge, "id">): Promise<Challenge> {
    return memoryStorage.createChallenge(challenge);
  }

  // Chat
  async getConversations(userId: number): Promise<Conversation[]> {
    return memoryStorage.getConversations(userId);
  }

  async createConversation(userId: number, title: string): Promise<Conversation> {
    return memoryStorage.createConversation(userId, title);
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return memoryStorage.getMessages(conversationId);
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    return memoryStorage.createMessage(conversationId, role, content);
  }
}

export const storage = new DatabaseStorage();
