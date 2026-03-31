export const WORKOUTS = [
  {
    id: 1,
    name: "Bodyweight Squats",
    bodyPart: "Legs",
    reps: 15,
    sets: 3,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/3ohzdKdb7FiK6JnLF6/giphy.gif",
    description: "Full body compound movement"
  },
  {
    id: 2,
    name: "Deadlifts",
    bodyPart: "Full Body",
    reps: 8,
    sets: 5,
    difficulty: "Advanced",
    image: "https://media.giphy.com/media/l0HlR7OVMMDGN6Yjo/giphy.gif",
    description: "Ultimate posterior chain builder"
  },
  {
    id: 3,
    name: "Bench Press",
    bodyPart: "Chest",
    reps: 10,
    sets: 4,
    difficulty: "Intermediate",
    image: "https://media.giphy.com/media/l3q2K6IPLlLAqsqIc/giphy.gif",
    description: "Classic upper body strength"
  },
  {
    id: 4,
    name: "Shoulder Press",
    bodyPart: "Shoulders",
    reps: 10,
    sets: 4,
    difficulty: "Intermediate",
    image: "https://media.giphy.com/media/l0MYGb1LuNrPDMSmA/giphy.gif",
    description: "Shoulder and core power"
  },
  {
    id: 5,
    name: "Barbell Rows",
    bodyPart: "Back",
    reps: 8,
    sets: 5,
    difficulty: "Intermediate",
    image: "https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif",
    description: "Back thickness and strength"
  },
  {
    id: 6,
    name: "Lunges",
    bodyPart: "Legs",
    reps: 12,
    sets: 3,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/l0HlMJi7m2PqnzBqo/giphy.gif",
    description: "Single leg stability"
  },
  {
    id: 7,
    name: "Planks",
    bodyPart: "Core",
    reps: 30,
    sets: 3,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/l0MYKxHxrp1H4a5Fe/giphy.gif",
    description: "Core endurance and stability"
  },
  {
    id: 8,
    name: "Bicep Curls",
    bodyPart: "Arms",
    reps: 12,
    sets: 4,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/l0HloMLqKT8lUl4gM/giphy.gif",
    description: "Arm strength and definition"
  },
  {
    id: 9,
    name: "Tricep Dips",
    bodyPart: "Arms",
    reps: 10,
    sets: 3,
    difficulty: "Intermediate",
    image: "https://media.giphy.com/media/l0IypeKl9NJhFXp0c/giphy.gif",
    description: "Tricep power and tone"
  },
  {
    id: 10,
    name: "Neck Mobility",
    bodyPart: "Neck",
    reps: 10,
    sets: 2,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/l0HlF01QjXbmvEWta/giphy.gif",
    description: "Neck flexibility and relief"
  },
  {
    id: 11,
    name: "Core Twists",
    bodyPart: "Core",
    reps: 15,
    sets: 3,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/l0IypeP00PA8SfhJS/giphy.gif",
    description: "Oblique strength and rotation"
  },
  {
    id: 12,
    name: "Full Body Stretch",
    bodyPart: "Full Body",
    reps: 60,
    sets: 1,
    difficulty: "Beginner",
    image: "https://media.giphy.com/media/l4FatJHzMN27dYtDO/giphy.gif",
    description: "Recovery and flexibility"
  }
];

export function getWorkoutById(id: number) {
  return WORKOUTS.find(w => w.id === id);
}

export function getWorkoutsByBodyPart(bodyPart: string) {
  return WORKOUTS.filter(w => w.bodyPart === bodyPart);
}
