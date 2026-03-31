// Placeholder AI Trainer Logic

export const BODY_PART_TRIGGERS = [
  "legs", "leg", "quads", "hamstrings", "calves",
  "back", "lats", "lower back",
  "chest", "pecs", "bench",
  "arms", "biceps", "triceps", "forearms",
  "shoulders", "delts", "shoulder",
  "core", "abs", "abdominal", "obliques",
  "full body", "full-body", "whole body",
  "mobility", "mobility work",
  "stretching", "stretch", "flexibility", "flexible"
];

export const GOAL_TRIGGERS = [
  "lose weight", "weight loss", "fat loss", "burn fat",
  "build muscle", "muscle gain", "bulking", "bulk",
  "tone up", "toning", "tone",
  "get stronger", "strength", "stronger", "power",
  "endurance", "cardio", "cardiovascular",
  "flexibility", "flexible", "mobility",
  "diet", "nutrition", "eating plan", "meal plan"
];

export function detectBodyPart(userInput: string): string | null {
  const normalized = userInput.toLowerCase();
  for (const part of BODY_PART_TRIGGERS) {
    if (normalized.includes(part)) {
      return part;
    }
  }
  return null;
}

export function detectGoal(userInput: string): string | null {
  const normalized = userInput.toLowerCase();
  for (const goal of GOAL_TRIGGERS) {
    if (normalized.includes(goal)) {
      return goal;
    }
  }
  return null;
}

export function analyzeUserGoal(userInput: string) {
  const bodyPart = detectBodyPart(userInput);
  const goal = detectGoal(userInput);
  
  return {
    userInput,
    bodyPart,
    goal,
    detected: bodyPart !== null || goal !== null,
    timestamp: new Date().toISOString()
  };
}

export function getUserFitnessProfile() {
  // Placeholder function - would fetch from user profile in production
  return {
    userId: 1,
    goals: ["lose weight", "build muscle"],
    bodyType: "athletic",
    height: "5'10\"",
    weight: 185,
    age: 28,
    experience: "intermediate",
    favoriteFood: ["chicken", "rice", "broccoli"],
    allergies: [],
    dietaryPreference: "high protein"
  };
}

export function getTrainerResponse(analysisResult: any): string {
  const { bodyPart, goal, detected } = analysisResult;
  
  if (!detected) {
    return "I didn't quite catch that. Could you tell me more? Are you looking to work on a specific body part like legs, back, or chest? Or a goal like building muscle or losing weight?";
  }

  if (bodyPart || goal) {
    return `Got it. Before I recommend a workout, let me check your body type and goals.`;
  }

  return "Alright, let me find the perfect workout for you.";
}
