import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface ExercisePerformance {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  difficulty: number;
  volume?: number;
}

interface WorkoutEntry {
  userEmail: string;
  workoutId: string;
  date: string;
  exercises: ExercisePerformance[];
  completed: boolean;
  missed?: boolean;
}

interface BodyMetricsEntry {
  userEmail: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
  };
}

interface ProgressHistory {
  workouts: WorkoutEntry[];
  bodyMetrics: BodyMetricsEntry[];
}

const PROGRESS_FILE_PATH = path.join(process.cwd(), 'data', 'progressHistory.json');

function ensureProgressFile(): ProgressHistory {
  try {
    if (!fs.existsSync(PROGRESS_FILE_PATH)) {
      const initialData: ProgressHistory = {
        workouts: [],
        bodyMetrics: []
      };
      fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = fs.readFileSync(PROGRESS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error ensuring progress file:', error);
    return { workouts: [], bodyMetrics: [] };
  }
}

function saveProgressData(data: ProgressHistory): void {
  try {
    fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving progress data:', error);
    throw new Error('Failed to save progress data');
  }
}

function calculateVolume(exercise: ExercisePerformance): number {
  return (exercise.sets * exercise.reps * (exercise.weight || 0));
}

export async function registerProgressRoutes(app: any) {
  // POST /api/progress/record-workout
  app.post('/api/progress/record-workout', async (req: Request, res: Response) => {
    try {
      const { userEmail, workoutId, date, exercises } = req.body;

      if (!userEmail || !workoutId || !date || !exercises) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userEmail, workoutId, date, exercises'
        });
      }

      if (!Array.isArray(exercises)) {
        return res.status(400).json({
          success: false,
          error: 'Exercises must be an array'
        });
      }

      const progressData = ensureProgressFile();

      const workoutEntry: WorkoutEntry = {
        userEmail,
        workoutId,
        date,
        exercises: exercises.map(ex => ({
          ...ex,
          volume: calculateVolume(ex)
        })),
        completed: true
      };

      progressData.workouts.push(workoutEntry);
      saveProgressData(progressData);

      res.json({
        success: true,
        message: 'Workout recorded successfully',
        data: workoutEntry
      });
    } catch (error) {
      console.error('Error recording workout:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record workout'
      });
    }
  });

  // POST /api/progress/record-missed-workout
  app.post('/api/progress/record-missed-workout', async (req: Request, res: Response) => {
    try {
      const { userEmail, workoutId, date } = req.body;

      if (!userEmail || !workoutId || !date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userEmail, workoutId, date'
        });
      }

      const progressData = ensureProgressFile();

      const missedWorkout: WorkoutEntry = {
        userEmail,
        workoutId,
        date,
        exercises: [],
        completed: false,
        missed: true
      };

      progressData.workouts.push(missedWorkout);
      saveProgressData(progressData);

      res.json({
        success: true,
        message: 'Missed workout recorded successfully',
        data: missedWorkout
      });
    } catch (error) {
      console.error('Error recording missed workout:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record missed workout'
      });
    }
  });

  // POST /api/progress/record-body-metrics
  app.post('/api/progress/record-body-metrics', async (req: Request, res: Response) => {
    try {
      const { userEmail, date, weight, bodyFat, measurements } = req.body;

      if (!userEmail || !date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userEmail, date'
        });
      }

      const progressData = ensureProgressFile();

      const metricsEntry: BodyMetricsEntry = {
        userEmail,
        date,
        weight,
        bodyFat,
        measurements
      };

      progressData.bodyMetrics.push(metricsEntry);
      saveProgressData(progressData);

      res.json({
        success: true,
        message: 'Body metrics recorded successfully',
        data: metricsEntry
      });
    } catch (error) {
      console.error('Error recording body metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record body metrics'
      });
    }
  });

  // GET /api/progress/summary
  app.get('/api/progress/summary', async (req: Request, res: Response) => {
    try {
      const { userEmail } = req.query;

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: userEmail'
        });
      }

      const progressData = ensureProgressFile();
      const userWorkouts = progressData.workouts.filter(w => w.userEmail === userEmail);
      const userMetrics = progressData.bodyMetrics.filter(m => m.userEmail === userEmail);

      // Calculate weekly workout count (last 4 weeks)
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      const recentWorkouts = userWorkouts.filter(w => 
        new Date(w.date) >= fourWeeksAgo && w.completed
      );

      const weeklyWorkoutCount = recentWorkouts.length / 4;

      // Calculate consistency score
      const totalWorkouts = userWorkouts.filter(w => w.completed).length;
      const missedWorkouts = userWorkouts.filter(w => w.missed).length;
      const scheduledWorkouts = totalWorkouts + missedWorkouts;
      const consistencyScore = scheduledWorkouts > 0 ? (totalWorkouts / scheduledWorkouts) * 100 : 0;

      // Calculate strength trends (average weight per exercise over time)
      const exerciseStrength: { [key: string]: number[] } = {};
      userWorkouts.forEach(workout => {
        if (workout.completed) {
          workout.exercises.forEach(exercise => {
            if (exercise.weight) {
              if (!exerciseStrength[exercise.name]) {
                exerciseStrength[exercise.name] = [];
              }
              exerciseStrength[exercise.name].push(exercise.weight);
            }
          });
        }
      });

      const strengthTrends = Object.keys(exerciseStrength).map(exercise => {
        const weights = exerciseStrength[exercise];
        const recent = weights.slice(-4);
        const older = weights.slice(-8, -4);
        const trend = older.length > 0 ? 
          ((recent.reduce((a, b) => a + b, 0) / recent.length) - 
           (older.reduce((a, b) => a + b, 0) / older.length)) / 
          (older.reduce((a, b) => a + b, 0) / older.length) * 100 : 0;
        
        return {
          exercise,
          trend: Math.round(trend * 100) / 100,
          recentAverage: recent.reduce((a, b) => a + b, 0) / recent.length
        };
      });

      // Calculate volume trends
      const weeklyVolume: { [key: string]: number } = {};
      userWorkouts.forEach(workout => {
        if (workout.completed) {
          const week = new Date(workout.date).toISOString().split('T')[0].substring(0, 7);
          const workoutVolume = workout.exercises.reduce((sum, ex) => sum + (ex.volume || 0), 0);
          weeklyVolume[week] = (weeklyVolume[week] || 0) + workoutVolume;
        }
      });

      const volumeTrend = Object.keys(weeklyVolume)
        .sort()
        .slice(-4)
        .map(week => ({ week, volume: weeklyVolume[week] }));

      // Calculate difficulty trends
      const exerciseDifficulty: { [key: string]: number[] } = {};
      userWorkouts.forEach(workout => {
        if (workout.completed) {
          workout.exercises.forEach(exercise => {
            if (!exerciseDifficulty[exercise.name]) {
              exerciseDifficulty[exercise.name] = [];
            }
            exerciseDifficulty[exercise.name].push(exercise.difficulty);
          });
        }
      });

      const difficultyTrends = Object.keys(exerciseDifficulty).map(exercise => {
        const difficulties = exerciseDifficulty[exercise];
        const recent = difficulties.slice(-4);
        const older = difficulties.slice(-8, -4);
        const trend = older.length > 0 ? 
          ((recent.reduce((a, b) => a + b, 0) / recent.length) - 
           (older.reduce((a, b) => a + b, 0) / older.length)) : 0;
        
        return {
          exercise,
          trend: Math.round(trend * 100) / 100,
          recentAverage: recent.reduce((a, b) => a + b, 0) / recent.length
        };
      });

      // Body metric trends
      const weightTrend = userMetrics
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-10)
        .map(metric => ({
          date: metric.date,
          weight: metric.weight
        }));

      res.json({
        success: true,
        data: {
          weeklyWorkoutCount: Math.round(weeklyWorkoutCount * 100) / 100,
          consistencyScore: Math.round(consistencyScore * 100) / 100,
          strengthTrends,
          volumeTrend,
          difficultyTrends,
          weightTrend,
          totalWorkouts,
          missedWorkouts
        }
      });
    } catch (error) {
      console.error('Error getting progress summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get progress summary'
      });
    }
  });

  // GET /api/progress/exercise-history
  app.get('/api/progress/exercise-history', async (req: Request, res: Response) => {
    try {
      const { userEmail, exerciseName } = req.query;

      if (!userEmail || !exerciseName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: userEmail, exerciseName'
        });
      }

      const progressData = ensureProgressFile();
      const userWorkouts = progressData.workouts.filter(w => w.userEmail === userEmail);

      const exerciseHistory: any[] = [];
      
      userWorkouts.forEach(workout => {
        if (workout.completed) {
          const exercise = workout.exercises.find(ex => 
            ex.name.toLowerCase() === (exerciseName as string).toLowerCase()
          );
          
          if (exercise) {
            exerciseHistory.push({
              date: workout.date,
              workoutId: workout.workoutId,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              difficulty: exercise.difficulty,
              volume: exercise.volume
            });
          }
        }
      });

      // Sort by date
      exerciseHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json({
        success: true,
        data: exerciseHistory
      });
    } catch (error) {
      console.error('Error getting exercise history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get exercise history'
      });
    }
  });
}
