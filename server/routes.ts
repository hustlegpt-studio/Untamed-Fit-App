import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerAudioRoutes } from "./replit_integrations/audio";

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
    // Mock user for now since no session management
    const user = await storage.getUserByUsername("admin");
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(user);
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
      theme: "dark"
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
      duration: null,
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
