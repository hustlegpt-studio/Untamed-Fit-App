// Workout Logger - Stores all workout sessions locally

export interface WorkoutSession {
  id: string;
  workoutName: string;
  bodyPart: string;
  reps: number;
  sets: number;
  duration: number; // seconds from stopwatch
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  userWeight: number;
  calories: number; // placeholder
}

let workoutHistory: WorkoutSession[] = [];

export function logWorkoutSession(session: WorkoutSession): void {
  workoutHistory.push(session);
  console.log(`[Workout Logged] ${session.workoutName} - ${session.duration}s`);
}

export function getWorkoutHistory(): WorkoutSession[] {
  return [...workoutHistory]; // Return copy to prevent external mutations
}

export function clearWorkoutHistory(): void {
  workoutHistory = [];
  console.log("[Workout History Cleared]");
}

export function createWorkoutSession(
  workoutName: string,
  bodyPart: string,
  reps: number,
  sets: number,
  duration: number,
  userWeight: number = 0
): WorkoutSession {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); // HH:MM

  // Simple calorie estimate: (duration in minutes) * 5 calories per minute (placeholder)
  const calories = Math.round((duration / 60) * 5);

  return {
    id: crypto.randomUUID(),
    workoutName,
    bodyPart,
    reps,
    sets,
    duration,
    date,
    time,
    userWeight,
    calories
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
