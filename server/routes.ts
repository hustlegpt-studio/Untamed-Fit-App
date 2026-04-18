import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerKevinRoutes } from "./api/kevin";
import { registerKevinFreeRoutes } from "./api/kevin-free";
import { registerSpeechToTextRoutes } from "./api/speech-to-text";
import { registerTextToSpeechRoutes } from "./api/text-to-speech";
import { registerGenerateExerciseImageRoutes } from "./api/generate-exercise-image";
import { registerBatchImageGenerationRoutes } from "./api/batch-image-generation";
import { registerExerciseImageUploadRoutes } from "./api/exercise-image-upload";
import { registerImageAnalyticsRoutes } from "./api/image-analytics";
import spotifyRoutes from "./spotify";
import { handleWorkoutAgentRequest, resetConversationState } from "./ai-workout-agent";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(401).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    // Get the active user from the request (simplified for now)
    // In a real app, this would use session/JWT to get the logged-in user
    const activeUserEmail = req.headers['x-user-email'] as string;
    
    if (!activeUserEmail) {
      // Fallback to admin user for development
      const user = await storage.getUserByUsername("admin");
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure owner/VIP status is set correctly
      const userWithEmail = {
        ...user,
        email: user.email || "untamedfitapp@gmail.com", // Default to owner email for admin
        isOwner: user.email === "untamedfitapp@gmail.com" || user.isOwner,
        isVIP: user.email === "untamedfitapp@gmail.com" || user.isVIP
      };
      
      res.json(userWithEmail);
      return;
    }
    
    // Try to find user by email
    let user = await storage.getUserByEmail(activeUserEmail);
    
    // If user doesn't exist in server storage, create them from client data
    if (!user) {
      // This is a simplified sync - in production, you'd want proper session management
      const defaultUser = {
        username: activeUserEmail.split('@')[0], // Use email prefix as username
        email: activeUserEmail,
        password: "stored-on-client", // Password is handled client-side
        subscriptionTier: "free",
        blindMode: false,
        voiceCues: true,
        theme: "dark"
      };
      
      user = await storage.createUser(defaultUser);
    }
    
    // Check if user is VIP from server storage
    const isVipUser = await storage.isVipUser(user.email || "");
    
    res.json({
      ...user,
      isVIP: user.isVIP || isVipUser
    });
  });

  // VIP User Management API Routes
  app.get('/api/vip-users', async (req, res) => {
    try {
      const activeUserEmail = req.headers['x-user-email'] as string;
      
      // Only allow owner to access VIP users list
      if (activeUserEmail !== "untamedfitapp@gmail.com") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const vipUsers = await storage.getVipUsers();
      res.json(vipUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get VIP users" });
    }
  });

  app.post('/api/vip-users', async (req, res) => {
    try {
      const activeUserEmail = req.headers['x-user-email'] as string;
      
      // Only allow owner to add VIP users
      if (activeUserEmail !== "untamedfitapp@gmail.com") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      await storage.addVipUser(email);
      const vipUsers = await storage.getVipUsers();
      res.json(vipUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to add VIP user" });
    }
  });

  app.delete('/api/vip-users/:email', async (req, res) => {
    try {
      const activeUserEmail = req.headers['x-user-email'] as string;
      
      // Only allow owner to remove VIP users
      if (activeUserEmail !== "untamedfitapp@gmail.com") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { email } = req.params;
      await storage.removeVipUser(email);
      const vipUsers = await storage.getVipUsers();
      res.json(vipUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove VIP user" });
    }
  });

  app.get(api.workouts.list.path, async (req, res) => {
    const workouts = await storage.getWorkouts();
    res.json(workouts);
  });

  app.get(api.workouts.get.path, async (req, res) => {
    const workout = await storage.getWorkout(Number(req.params.id));
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(workout);
  });

  app.post(api.workouts.create.path, async (req, res) => {
    try {
      const input = api.workouts.create.input.parse(req.body);
      const workout = await storage.createWorkout(input);
      res.status(201).json(workout);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // User Workout Sessions
  app.get(api.userWorkoutSessions.list.path, async (req, res) => {
    try {
      const { userId, date } = api.userWorkoutSessions.list.input.parse(req.query);
      const sessions = date
        ? await storage.getUserWorkoutSessionsByDate(Number(userId), date)
        : await storage.getUserWorkoutSessions(Number(userId));
      res.json(sessions);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.userWorkoutSessions.create.path, async (req, res) => {
    try {
      const input = api.userWorkoutSessions.create.input.parse(req.body);
      const session = await storage.createUserWorkoutSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.userWorkoutSessions.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = api.userWorkoutSessions.update.input.parse(req.body);
      const session = await storage.updateUserWorkoutSession(id, updates);
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.userWorkoutSessions.delete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteUserWorkoutSession(id);
      if (!success) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      res.json({ success: true });
    } catch (err) {
      throw err;
    }
  });

  // Booking Sessions
  app.get(api.bookingSessions.list.path, async (req, res) => {
    try {
      const { date, traineeEmail } = api.bookingSessions.list.input.parse(req.query);
      let sessions;
      if (date) {
        sessions = await storage.getBookingSessionsByDate(date);
      } else if (traineeEmail) {
        sessions = await storage.getBookingSessionsByTrainee(traineeEmail);
      } else {
        sessions = await storage.getBookingSessions();
      }
      res.json(sessions);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.bookingSessions.create.path, async (req, res) => {
    try {
      const input = api.bookingSessions.create.input.parse(req.body);
      const session = await storage.createBookingSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.bookingSessions.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = api.bookingSessions.update.input.parse(req.body);
      const session = await storage.updateBookingSession(id, updates);
      if (!session) {
        return res.status(404).json({ message: "Booking session not found" });
      }
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.bookingSessions.delete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteBookingSession(id);
      if (!success) {
        return res.status(404).json({ message: "Booking session not found" });
      }
      res.json({ success: true });
    } catch (err) {
      throw err;
    }
  });

  app.get(api.progress.list.path, async (req, res) => {
    // Mock user 1
    const logs = await storage.getProgressLogs(1);
    res.json(logs);
  });

  app.post(api.progress.create.path, async (req, res) => {
    try {
      const input = api.progress.create.input.parse(req.body);
      const log = await storage.createProgressLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.challenges.list.path, async (req, res) => {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  });

  app.put(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      // Mock user 1
      const user = await storage.updateUser(1, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Register integrations
  registerChatRoutes(app);
  registerAudioRoutes(app);
  registerKevinRoutes(app);
  registerKevinFreeRoutes(app);
  registerSpeechToTextRoutes(app);
  registerTextToSpeechRoutes(app);
  registerGenerateExerciseImageRoutes(app);
  registerBatchImageGenerationRoutes(app);
  registerExerciseImageUploadRoutes(app);
  registerImageAnalyticsRoutes(app);
  
  // Register Spotify routes
  app.use('/api/spotify', spotifyRoutes);

  // AI Workout Agent Route
  app.post('/api/ai/workout-agent', handleWorkoutAgentRequest);

  // Reset conversation state route
  app.post('/api/ai/reset-conversation', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required!" });
      }
      
      resetConversationState(userId);
      res.json({ message: "Conversation state reset successfully!" });
    } catch (error) {
      console.error("Error resetting conversation state:", error);
      res.status(500).json({ message: "Failed to reset conversation state" });
    }
  });

  // Seed DB with some mocked content
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUserByUsername("admin");
  if (!users) {
    await storage.createUser({
      username: "admin",
      password: "password",
      subscriptionTier: "pro",
      blindMode: false,
      voiceCues: true,
      theme: "dark",
      email: "untamedfitapp@gmail.com", // Owner email
      name: "Admin User",
      age: 30,
      city: "Virtual City",
      experienceLevel: "expert",
      fitnessGoal: "general-fitness",
      height: "5'10\"",
      weight: "180 lbs",
      bodyType: "athletic",
      limitations: ""
    });
  }

  const workouts = await storage.getWorkouts();
  if (workouts.length === 0) {
    await storage.createWorkout({
      title: "GET UP & GRIND",
      description: "Full Body Wake-Up (Beginner Friendly)",
      category: "Full Body",
      type: "video_premium",
      duration: 20,
      isPremium: true
    });
    
    await storage.createWorkout({
      title: "MILITARY MODE: BOOTCAMP GRIT",
      description: "Lower Body + Core",
      category: "Lower Body",
      type: "video_premium",
      duration: 30,
      isPremium: true
    });
    
    await storage.createWorkout({
      title: "Incline Push-Up",
      description: "Chest exercise using bodyweight",
      category: "Chest",
      type: "body_part",
      isPremium: false
    });
  }

  const challenges = await storage.getChallenges();
  if (challenges.length === 0) {
    await storage.createChallenge({
      title: "100 Push-ups a day",
      description: "Complete 100 push-ups every day for a week",
      goal: 700,
      reward: "Pro Badge"
    });
  }
}
