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

export const PROGRESS_TRIGGERS = [
  "progress", "improvement", "improve", "improving", "improved",
  "trend", "trends", "tracking", "track", "tracked",
  "history", "historical", "past", "previous", "before",
  "performance", "perform", "performed", "performing",
  "consistency", "consistent", "consistently", "regular",
  "weekly", "month", "monthly", "year", "yearly", "annual",
  "show me", "how am i", "how have i", "am i getting", "getting stronger",
  "getting better", "improvement", "progress review", "check my progress"
];

export const EXERCISE_HISTORY_TRIGGERS = [
  "bench press", "squat", "deadlift", "overhead press", "pull up", "push up",
  "exercise history", "workout history", "training history", "lift history",
  "personal record", "pr", "max", "maximum", "best lift"
];

export const CONSISTENCY_TRIGGERS = [
  "consistency", "consistent", "regular", "routine", "habit", "frequency",
  "how often", "how many times", "workout frequency", "training frequency",
  "missed", "skipped", "attendance", "show up", "commitment"
];

export const TREND_ANALYSIS_TRIGGERS = [
  "trend", "trends", "analysis", "analyze", "pattern", "patterns",
  "increasing", "decreasing", "improving", "declining", "progressing",
  "volume", "strength", "difficulty", "adaptation", "plateau", "stuck"
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

export function detectProgressIntent(userInput: string): string | null {
  const normalized = userInput.toLowerCase();
  for (const trigger of PROGRESS_TRIGGERS) {
    if (normalized.includes(trigger)) {
      return "progress_review";
    }
  }
  return null;
}

export function detectExerciseHistoryIntent(userInput: string): string | null {
  const normalized = userInput.toLowerCase();
  for (const trigger of EXERCISE_HISTORY_TRIGGERS) {
    if (normalized.includes(trigger)) {
      return "exercise_history";
    }
  }
  return null;
}

export function detectConsistencyIntent(userInput: string): string | null {
  const normalized = userInput.toLowerCase();
  for (const trigger of CONSISTENCY_TRIGGERS) {
    if (normalized.includes(trigger)) {
      return "consistency_check";
    }
  }
  return null;
}

export function detectTrendAnalysisIntent(userInput: string): string | null {
  const normalized = userInput.toLowerCase();
  for (const trigger of TREND_ANALYSIS_TRIGGERS) {
    if (normalized.includes(trigger)) {
      return "trend_analysis";
    }
  }
  return null;
}

export function extractExerciseName(userInput: string): string | null {
  const exercises = ["bench press", "squat", "deadlift", "overhead press", "pull up", "push up", 
                     "bicep curl", "tricep extension", "shoulder press", "lunges", "plank"];
  const normalized = userInput.toLowerCase();
  
  for (const exercise of exercises) {
    if (normalized.includes(exercise)) {
      return exercise;
    }
  }
  return null;
}

export function analyzeUserGoal(userInput: string) {
  const bodyPart = detectBodyPart(userInput);
  const goal = detectGoal(userInput);
  const progressIntent = detectProgressIntent(userInput);
  const exerciseHistoryIntent = detectExerciseHistoryIntent(userInput);
  const consistencyIntent = detectConsistencyIntent(userInput);
  const trendAnalysisIntent = detectTrendAnalysisIntent(userInput);
  const exerciseName = extractExerciseName(userInput);
  
  const intent = progressIntent || exerciseHistoryIntent || consistencyIntent || trendAnalysisIntent;
  
  return {
    userInput,
    bodyPart,
    goal,
    intent,
    exerciseName,
    detected: bodyPart !== null || goal !== null || intent !== null,
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

// Progress API functions
export async function fetchProgressSummary(userEmail: string) {
  try {
    const response = await fetch(`/api/progress/summary?userEmail=${encodeURIComponent(userEmail)}`);
    if (!response.ok) throw new Error('Failed to fetch progress summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    return null;
  }
}

export async function fetchExerciseHistory(userEmail: string, exerciseName: string) {
  try {
    const response = await fetch(`/api/progress/exercise-history?userEmail=${encodeURIComponent(userEmail)}&exerciseName=${encodeURIComponent(exerciseName)}`);
    if (!response.ok) throw new Error('Failed to fetch exercise history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    return null;
  }
}

export function generateProgressInsights(progressData: any, intent: string, exerciseName?: string): string {
  if (!progressData || !progressData.success) {
    return "I couldn't retrieve your progress data right now. Let's try again later.";
  }

  const data = progressData.data;
  
  switch (intent) {
    case "progress_review":
      return generateProgressReview(data);
    
    case "exercise_history":
      return generateExerciseHistoryReview(data, exerciseName);
    
    case "consistency_check":
      return generateConsistencyReview(data);
    
    case "trend_analysis":
      return generateTrendAnalysis(data);
    
    default:
      return "Here's what I found about your progress.";
  }
}

function generateProgressReview(data: any): string {
  const { weeklyWorkoutCount, consistencyScore, strengthTrends, totalWorkouts } = data;
  
  let insights = `📊 **Your Progress Review:**\n\n`;
  
  if (weeklyWorkoutCount > 0) {
    insights += `• You're averaging **${weeklyWorkoutCount} workouts per week**\n`;
  }
  
  if (consistencyScore >= 80) {
    insights += `• **Excellent consistency!** ${consistencyScore}% completion rate\n`;
  } else if (consistencyScore >= 60) {
    insights += `• **Good consistency** at ${consistencyScore}% completion rate\n`;
  } else {
    insights += `• **Room for improvement** - ${consistencyScore}% completion rate\n`;
  }
  
  if (strengthTrends && strengthTrends.length > 0) {
    const improvingExercises = strengthTrends.filter((t: any) => t.trend > 0);
    if (improvingExercises.length > 0) {
      insights += `• **Strength gains** in ${improvingExercises.length} exercises\n`;
    }
  }
  
  insights += `\nKeep up the great work! Want to see detailed trends or specific exercise history?`;
  
  return insights;
}

function generateExerciseHistoryReview(data: any[], exerciseName?: string): string {
  if (!data || data.length === 0) {
    return `I don't have any recorded history for ${exerciseName || 'that exercise'} yet. Let's get some workouts logged!`;
  }
  
  const recent = data.slice(-5);
  const oldest = data[0];
  const latest = data[data.length - 1];
  
  let insights = `📈 **${exerciseName ? exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1) : 'Exercise'} History:**\n\n`;
  
  if (latest.weight && oldest.weight) {
    const improvement = ((latest.weight - oldest.weight) / oldest.weight * 100).toFixed(1);
    if (parseFloat(improvement) > 0) {
      insights += `• **Weight increased by ${improvement}%** from ${oldest.weight}lbs to ${latest.weight}lbs\n`;
    } else {
      insights += `• Current working weight: ${latest.weight}lbs\n`;
    }
  }
  
  if (latest.volume) {
    insights += `• **Recent volume:** ${latest.volume} total lbs\n`;
  }
  
  insights += `• **Total sessions:** ${data.length}\n`;
  insights += `• **Recent performance:** ${latest.sets} sets × ${latest.reps} reps\n`;
  
  return insights;
}

function generateConsistencyReview(data: any): string {
  const { weeklyWorkoutCount, consistencyScore, totalWorkouts, missedWorkouts } = data;
  
  let insights = `🎯 **Consistency Analysis:**\n\n`;
  
  insights += `• **Completion Rate:** ${consistencyScore}%\n`;
  insights += `• **Weekly Average:** ${weeklyWorkoutCount} workouts\n`;
  insights += `• **Total Completed:** ${totalWorkouts} workouts\n`;
  
  if (missedWorkouts > 0) {
    insights += `• **Missed Sessions:** ${missedWorkouts}\n`;
  }
  
  if (consistencyScore >= 80) {
    insights += `\n🔥 **Outstanding consistency!** You're building a strong habit.`;
  } else if (consistencyScore >= 60) {
    insights += `\n💪 **Good progress!** Try to increase frequency slightly for better results.`;
  } else {
    insights += `\n📅 **Let's improve consistency!** Aim for 3-4 workouts per week.`;
  }
  
  return insights;
}

function generateTrendAnalysis(data: any): string {
  const { strengthTrends, volumeTrend, difficultyTrends } = data;
  
  let insights = `📊 **Trend Analysis:**\n\n`;
  
  if (strengthTrends && strengthTrends.length > 0) {
    const improving = strengthTrends.filter((t: any) => t.trend > 0);
    const declining = strengthTrends.filter((t: any) => t.trend < 0);
    
    if (improving.length > 0) {
      insights += `• **Strength gains** in ${improving.length} exercises\n`;
    }
    if (declining.length > 0) {
      insights += `• **Strength maintenance** in ${declining.length} exercises\n`;
    }
  }
  
  if (volumeTrend && volumeTrend.length > 1) {
    const recent = volumeTrend[volumeTrend.length - 1].volume;
    const previous = volumeTrend[volumeTrend.length - 2].volume;
    const change = ((recent - previous) / previous * 100).toFixed(1);
    
    if (parseFloat(change) > 0) {
      insights += `• **Volume increased** by ${change}% this week\n`;
    } else {
      insights += `• **Volume:** ${recent} total lbs this week\n`;
    }
  }
  
  if (difficultyTrends && difficultyTrends.length > 0) {
    const avgDifficulty = difficultyTrends.reduce((sum: number, t: any) => sum + t.recentAverage, 0) / difficultyTrends.length;
    insights += `• **Average difficulty rating:** ${avgDifficulty.toFixed(1)}/10\n`;
  }
  
  return insights;
}

export async function getTrainerResponse(analysisResult: any, userEmail?: string): Promise<string> {
  const { bodyPart, goal, intent, exerciseName, detected } = analysisResult;
  
  if (!detected) {
    return "I didn't quite catch that. Could you tell me more? Are you looking to work on a specific body part like legs, back, or chest? Or a goal like building muscle or losing weight? You can also ask about your progress, exercise history, or consistency.";
  }

  // Handle progress-related intents
  if (intent && userEmail) {
    if (intent === "exercise_history" && exerciseName) {
      const historyData = await fetchExerciseHistory(userEmail, exerciseName);
      return generateProgressInsights(historyData, intent, exerciseName);
    } else {
      const progressData = await fetchProgressSummary(userEmail);
      return generateProgressInsights(progressData, intent, exerciseName);
    }
  }

  // Handle traditional workout/goal requests
  if (bodyPart || goal) {
    return `Got it. Before I recommend a workout, let me check your body type and goals.`;
  }

  return "Alright, let me find the perfect workout for you.";
}
