// Simple in-memory storage without SQLite dependencies
import type { InsertUser, User, InsertWorkout, Workout, InsertProgressLog, ProgressLog, Challenge, Conversation, Message } from "../shared/schema";
import { insertUserSchema, insertWorkoutSchema, insertProgressLogSchema, insertChallengeSchema } from "../shared/schema";

// In-memory storage
class MemoryStorage {
  private users: User[] = [];
  private workouts: Workout[] = [];
  private progressLogs: ProgressLog[] = [];
  private challenges: Challenge[] = [];
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private nextId = 1;

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    // Auto-set owner and VIP status for specific email
    const isOwnerEmail = user.email === "untamedfitapp@gmail.com";
    const newUser = { 
      id: this.nextId++, 
      ...user,
      isOwner: isOwnerEmail,
      isVIP: isOwnerEmail // Owner is automatically VIP
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, settings: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...settings };
      return this.users[index];
    }
    throw new Error('User not found');
  }

  // Workouts
  async getWorkouts(): Promise<Workout[]> {
    return this.workouts;
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.find(w => w.id === id);
  }

  async createWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
    const newWorkout = { id: this.nextId++, ...workout };
    this.workouts.push(newWorkout);
    return newWorkout;
  }

  // Progress
  async getProgressLogs(userId: number): Promise<ProgressLog[]> {
    return this.progressLogs.filter(log => log.userId === userId);
  }

  async createProgressLog(log: Omit<ProgressLog, 'id' | 'date'>): Promise<ProgressLog> {
    const newLog = { id: this.nextId++, date: Date.now(), ...log };
    this.progressLogs.push(newLog);
    return newLog;
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return this.challenges;
  }

  async createChallenge(challenge: Omit<Challenge, 'id'>): Promise<Challenge> {
    const newChallenge = { id: this.nextId++, ...challenge };
    this.challenges.push(newChallenge);
    return newChallenge;
  }

  // Chat
  async getConversations(userId: number): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.userId === userId);
  }

  async createConversation(userId: number, title: string): Promise<Conversation> {
    const newConversation = { id: this.nextId++, userId, title, createdAt: Date.now() };
    this.conversations.push(newConversation);
    return newConversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messages.filter(msg => msg.conversationId === conversationId);
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
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

// Type exports
export type { InsertUser, InsertWorkout, InsertProgressLog, InsertChallenge } from "../shared/schema";
