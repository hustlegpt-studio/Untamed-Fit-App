// Workout Engine - Body Type Based Recommendations

interface Workout {
  id: string;
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string;
  reps: { beginner: number; intermediate: number; advanced: number };
  sets: number;
  image: string;
  gif: string;
  safeFor: string[];
  description: string;
  bodyPart: string;
}

interface UserProfile {
  bodyType: string;
  goals: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  weight?: number;
  age?: number;
}

export const WORKOUT_LIBRARY: Record<string, Workout[]> = {
  legs: [
    {
      id: "bodyweight_squat",
      name: "Bodyweight Squat",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 12, intermediate: 15, advanced: 20 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/3ohzdKdb7FiK6JnLF6/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Full body compound movement for leg strength",
      bodyPart: "legs"
    },
    {
      id: "goblet_squat",
      name: "Goblet Squat",
      difficulty: "intermediate",
      equipment: "dumbbell",
      reps: { beginner: 10, intermediate: 12, advanced: 15 },
      sets: 4,
      image: "https://images.unsplash.com/photo-1616002541538-7ee32b63c769?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/3ohzdKdb7FiK6JnLF6/giphy.gif",
      safeFor: ["athletic", "muscular", "slim"],
      description: "Dumbbell squat variation for controlled leg work",
      bodyPart: "legs"
    },
    {
      id: "lunges",
      name: "Lunges",
      difficulty: "intermediate",
      equipment: "none",
      reps: { beginner: 10, intermediate: 12, advanced: 15 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1518611505868-d7f1be3f47d5?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HlMJi7m2PqnzBqo/giphy.gif",
      safeFor: ["athletic", "slim", "muscular"],
      description: "Single leg stability and quad strength",
      bodyPart: "legs"
    },
    {
      id: "leg_press",
      name: "Leg Press",
      difficulty: "beginner",
      equipment: "machine",
      reps: { beginner: 12, intermediate: 15, advanced: 20 },
      sets: 4,
      image: "https://images.unsplash.com/photo-1576678927484-cc907957a753?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/3ohzdKdb7FiK6JnLF6/giphy.gif",
      safeFor: ["heavyset", "plus-size", "curvy", "athletic", "slim"],
      description: "Machine-based leg strength with lower back safety",
      bodyPart: "legs"
    }
  ],
  back: [
    {
      id: "barbell_row",
      name: "Barbell Row",
      difficulty: "intermediate",
      equipment: "barbell",
      reps: { beginner: 8, intermediate: 10, advanced: 12 },
      sets: 5,
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif",
      safeFor: ["athletic", "muscular"],
      description: "Back thickness and strength builder",
      bodyPart: "back"
    },
    {
      id: "lat_pulldown",
      name: "Lat Pulldown",
      difficulty: "beginner",
      equipment: "machine",
      reps: { beginner: 10, intermediate: 12, advanced: 15 },
      sets: 4,
      image: "https://images.unsplash.com/photo-1576678927484-cc907957a753?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Machine-based lat strength and size",
      bodyPart: "back"
    },
    {
      id: "resistance_band_row",
      name: "Resistance Band Row",
      difficulty: "beginner",
      equipment: "resistance band",
      reps: { beginner: 12, intermediate: 15, advanced: 20 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1518611505868-d7f1be3f47d5?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Joint-friendly back activation",
      bodyPart: "back"
    }
  ],
  chest: [
    {
      id: "bench_press",
      name: "Bench Press",
      difficulty: "intermediate",
      equipment: "barbell",
      reps: { beginner: 8, intermediate: 10, advanced: 12 },
      sets: 4,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l3q2K6IPLlLAqsqIc/giphy.gif",
      safeFor: ["athletic", "muscular"],
      description: "Classic upper body strength builder",
      bodyPart: "chest"
    },
    {
      id: "pushups",
      name: "Push-ups",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 8, intermediate: 12, advanced: 20 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l3q2K6IPLlLAqsqIc/giphy.gif",
      safeFor: ["slim", "athletic", "muscular"],
      description: "Bodyweight chest and tricep work",
      bodyPart: "chest"
    },
    {
      id: "chest_fly",
      name: "Machine Chest Fly",
      difficulty: "beginner",
      equipment: "machine",
      reps: { beginner: 12, intermediate: 15, advanced: 20 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1576678927484-cc907957a753?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l3q2K6IPLlLAqsqIc/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Isolation exercise for chest shape and size",
      bodyPart: "chest"
    }
  ],
  arms: [
    {
      id: "bicep_curl",
      name: "Bicep Curl",
      difficulty: "beginner",
      equipment: "dumbbell",
      reps: { beginner: 12, intermediate: 15, advanced: 18 },
      sets: 4,
      image: "https://images.unsplash.com/photo-1516169445734-6ca8b3796b9f?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HloMLqKT8lUl4gM/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Arm strength and definition",
      bodyPart: "arms"
    },
    {
      id: "tricep_dips",
      name: "Tricep Dips",
      difficulty: "intermediate",
      equipment: "bench",
      reps: { beginner: 8, intermediate: 10, advanced: 15 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1516169445734-6ca8b3796b9f?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0IypeKl9NJhFXp0c/giphy.gif",
      safeFor: ["athletic", "slim", "muscular"],
      description: "Tricep power and tone",
      bodyPart: "arms"
    },
    {
      id: "tricep_pushdown",
      name: "Tricep Pushdown",
      difficulty: "beginner",
      equipment: "cable",
      reps: { beginner: 12, intermediate: 15, advanced: 18 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1516169445734-6ca8b3796b9f?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0IypeKl9NJhFXp0c/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Isolated tricep extension",
      bodyPart: "arms"
    }
  ],
  shoulders: [
    {
      id: "shoulder_press",
      name: "Shoulder Press",
      difficulty: "intermediate",
      equipment: "dumbbell",
      reps: { beginner: 10, intermediate: 12, advanced: 15 },
      sets: 4,
      image: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0MYKxHxrp1H4a5Fe/giphy.gif",
      safeFor: ["athletic", "muscular", "slim"],
      description: "Shoulder and core power",
      bodyPart: "shoulders"
    },
    {
      id: "lateral_raise",
      name: "Lateral Raise",
      difficulty: "beginner",
      equipment: "dumbbell",
      reps: { beginner: 12, intermediate: 15, advanced: 18 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0MYKxHxrp1H4a5Fe/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Shoulder width and definition",
      bodyPart: "shoulders"
    }
  ],
  core: [
    {
      id: "plank",
      name: "Plank",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 30, intermediate: 45, advanced: 60 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0MYi7H8oEPFLfFWo/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Core endurance and stability",
      bodyPart: "core"
    },
    {
      id: "core_twist",
      name: "Core Twist",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 15, intermediate: 20, advanced: 25 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0IypeP00PA8SfhJS/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Oblique strength and rotation",
      bodyPart: "core"
    },
    {
      id: "crunch",
      name: "Crunch",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 12, intermediate: 15, advanced: 20 },
      sets: 3,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0IypeP00PA8SfhJS/giphy.gif",
      safeFor: ["slim", "athletic", "muscular"],
      description: "Isolated ab flexion",
      bodyPart: "core"
    }
  ],
  mobility: [
    {
      id: "neck_mobility",
      name: "Neck Mobility",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 10, intermediate: 12, advanced: 15 },
      sets: 2,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HlF01QjXbmvEWta/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Neck flexibility and relief",
      bodyPart: "mobility"
    },
    {
      id: "hip_mobility",
      name: "Hip Mobility Flow",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 10, intermediate: 12, advanced: 15 },
      sets: 2,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l0HlF01QjXbmvEWta/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Hip joint health and flexibility",
      bodyPart: "mobility"
    }
  ],
  stretching: [
    {
      id: "full_body_stretch",
      name: "Full Body Stretch",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 60, intermediate: 60, advanced: 60 },
      sets: 1,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l4FatJHzMN27dYtDO/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Recovery and flexibility",
      bodyPart: "stretching"
    },
    {
      id: "hamstring_stretch",
      name: "Hamstring Stretch",
      difficulty: "beginner",
      equipment: "none",
      reps: { beginner: 30, intermediate: 30, advanced: 30 },
      sets: 2,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop",
      gif: "https://media.giphy.com/media/l4FatJHzMN27dYtDO/giphy.gif",
      safeFor: ["slim", "athletic", "muscular", "heavyset", "curvy", "plus-size"],
      description: "Posterior chain flexibility",
      bodyPart: "stretching"
    }
  ]
};

export function recommendWorkout(bodyPart: string, userProfile: UserProfile): Workout | null {
  const normalizedBodyPart = bodyPart.toLowerCase().trim();
  
  // Map common body part variations
  const bodyPartMap: Record<string, string> = {
    leg: "legs",
    legs: "legs",
    back: "back",
    chest: "chest",
    arm: "arms",
    arms: "arms",
    shoulder: "shoulders",
    shoulders: "shoulders",
    core: "core",
    full: "legs",
    "full body": "legs",
    mobility: "mobility",
    stretch: "stretching",
    stretching: "stretching"
  };
  
  const mappedBodyPart = bodyPartMap[normalizedBodyPart] || normalizedBodyPart;
  const workouts = WORKOUT_LIBRARY[mappedBodyPart] || [];
  
  if (workouts.length === 0) {
    return null;
  }
  
  // Filter by body type safety
  let filteredWorkouts = workouts.filter(w => w.safeFor.includes(userProfile.bodyType));
  
  // Fallback: if no safe workouts found, use beginner workouts
  if (filteredWorkouts.length === 0) {
    filteredWorkouts = workouts.filter(w => w.difficulty === "beginner");
  }
  
  // If still nothing, use all workouts
  if (filteredWorkouts.length === 0) {
    filteredWorkouts = workouts;
  }
  
  // Prefer workouts matching user goals
  const goalsLower = userProfile.goals.map(g => g.toLowerCase());
  let bestWorkout = filteredWorkouts[0];
  
  for (const workout of filteredWorkouts) {
    const workoutName = workout.name.toLowerCase();
    const isGoalMatch = goalsLower.some(goal => 
      workoutName.includes(goal) || 
      workout.description.toLowerCase().includes(goal)
    );
    if (isGoalMatch) {
      bestWorkout = workout;
      break;
    }
  }
  
  // Create a copy with experience-level appropriate reps
  const experience = userProfile.experienceLevel || "intermediate";
  return {
    ...bestWorkout,
    reps: bestWorkout.reps[experience]
  };
}
