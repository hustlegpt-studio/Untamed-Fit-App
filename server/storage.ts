import { memoryStorage } from "./memory-storage";
import type { InsertUser, User, InsertWorkout, Workout, InsertProgressLog, ProgressLog, Challenge, Conversation, Message, InsertUserWorkoutSession, UserWorkoutSession, InsertBookingSession, BookingSession } from "../shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, settings: Partial<User>): Promise<User>;

  // VIP User Management
  getVipUsers(): Promise<string[]>;
  addVipUser(email: string): Promise<void>;
  removeVipUser(email: string): Promise<void>;
  isVipUser(email: string): Promise<boolean>;

  // Workouts
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;

  // Progress
  getProgressLogs(userId: number): Promise<ProgressLog[]>;
  createProgressLog(log: InsertProgressLog): Promise<ProgressLog>;

  // User Workout Sessions
  getUserWorkoutSessions(userId: number): Promise<UserWorkoutSession[]>;
  getUserWorkoutSessionsByDate(userId: number, date: string): Promise<UserWorkoutSession[]>;
  createUserWorkoutSession(session: InsertUserWorkoutSession): Promise<UserWorkoutSession>;
  updateUserWorkoutSession(id: number, updates: Partial<UserWorkoutSession>): Promise<UserWorkoutSession | undefined>;
  deleteUserWorkoutSession(id: number): Promise<boolean>;

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return memoryStorage.getUserByEmail(email);
  }

  // VIP User Management
  async getVipUsers(): Promise<string[]> {
    return memoryStorage.getVipUsers();
  }

  async addVipUser(email: string): Promise<void> {
    return memoryStorage.addVipUser(email);
  }

  async removeVipUser(email: string): Promise<void> {
    return memoryStorage.removeVipUser(email);
  }

  async isVipUser(email: string): Promise<boolean> {
    return memoryStorage.isVipUser(email);
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

  // User Workout Sessions
  async getUserWorkoutSessions(userId: number): Promise<UserWorkoutSession[]> {
    return memoryStorage.getUserWorkoutSessions(userId);
  }

  async getUserWorkoutSessionsByDate(userId: number, date: string): Promise<UserWorkoutSession[]> {
    return memoryStorage.getUserWorkoutSessionsByDate(userId, date);
  }

  async createUserWorkoutSession(session: InsertUserWorkoutSession): Promise<UserWorkoutSession> {
    return memoryStorage.createUserWorkoutSession(session);
  }

  async updateUserWorkoutSession(id: number, updates: Partial<UserWorkoutSession>): Promise<UserWorkoutSession | undefined> {
    return memoryStorage.updateUserWorkoutSession(id, updates);
  }

  async deleteUserWorkoutSession(id: number): Promise<boolean> {
    return memoryStorage.deleteUserWorkoutSession(id);
  }

  // Booking Sessions
  async getBookingSessions(): Promise<BookingSession[]> {
    return memoryStorage.getBookingSessions();
  }

  async getBookingSessionsByDate(date: string): Promise<BookingSession[]> {
    return memoryStorage.getBookingSessionsByDate(date);
  }

  async getBookingSessionsByTrainee(traineeEmail: string): Promise<BookingSession[]> {
    return memoryStorage.getBookingSessionsByTrainee(traineeEmail);
  }

  async getBookingSessionsByDateAndTime(date: string, time: string): Promise<BookingSession[]> {
    return memoryStorage.getBookingSessionsByDateAndTime(date, time);
  }

  async createBookingSession(session: InsertBookingSession): Promise<BookingSession> {
    return memoryStorage.createBookingSession(session);
  }

  async updateBookingSession(id: number, updates: Partial<BookingSession>): Promise<BookingSession | undefined> {
    return memoryStorage.updateBookingSession(id, updates);
  }

  async deleteBookingSession(id: number): Promise<boolean> {
    return memoryStorage.deleteBookingSession(id);
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
