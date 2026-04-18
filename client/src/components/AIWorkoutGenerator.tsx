import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Sparkles, Target, Calendar, Dumbbell, Clock } from "lucide-react";
import { useCreateUserWorkoutSession } from "@/hooks/use-user-workout-sessions";
import { useAuth } from "@/hooks/use-auth";

interface AIWorkoutGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const FITNESS_GOALS = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Endurance",
  "Flexibility",
  "General Fitness",
  "Athletic Performance",
  "Recovery"
];

const EQUIPMENT_OPTIONS = [
  "Bodyweight Only",
  "Dumbbells",
  "Barbell",
  "Resistance Bands",
  "Kettlebells",
  "Treadmill",
  "Stationary Bike",
  "Elliptical",
  "Pull-up Bar",
  "Yoga Mat",
  "Full Gym Access"
];

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface WorkoutPlan {
  [day: string]: {
    exercises: Array<{
      name: string;
      bodyPart: string;
      reps: number;
      sets: number;
      duration: number;
      rest: number;
    }>;
    focus: string;
    estimatedDuration: number;
  };
}

export function AIWorkoutGenerator({ isOpen, onClose }: AIWorkoutGeneratorProps) {
  const { data: user } = useAuth();
  const userId = user?.id || 1;
  const createMutation = useCreateUserWorkoutSession();
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  
  // Form state
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const resetForm = () => {
    setStep(1);
    setFitnessGoal("");
    setDaysAvailable([]);
    setEquipment([]);
    setExperienceLevel("");
    setWorkoutDuration("");
    setAdditionalNotes("");
    setGeneratedPlan(null);
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generateWorkoutPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI-generated plan
      const mockPlan: WorkoutPlan = {};
      
      daysAvailable.forEach(day => {
        const exercises = generateExercisesForDay(day, equipment, fitnessGoal, experienceLevel);
        mockPlan[day] = {
          exercises,
          focus: getDayFocus(day, fitnessGoal),
          estimatedDuration: exercises.reduce((total, ex) => total + ex.duration + ex.rest, 0)
        };
      });
      
      setGeneratedPlan(mockPlan);
      setStep(3);
    } catch (error) {
      console.error("Failed to generate workout plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExercisesForDay = (day: string, equipment: string[], goal: string, experience: string) => {
    const exerciseDatabase = [
      { name: "Push-ups", bodyPart: "Chest", reps: 15, sets: 3, duration: 180, rest: 60 },
      { name: "Squats", bodyPart: "Legs", reps: 20, sets: 3, duration: 240, rest: 90 },
      { name: "Plank", bodyPart: "Core", reps: 1, sets: 3, duration: 60, rest: 30 },
      { name: "Lunges", bodyPart: "Legs", reps: 12, sets: 3, duration: 180, rest: 60 },
      { name: "Burpees", bodyPart: "Full Body", reps: 10, sets: 3, duration: 240, rest: 90 },
      { name: "Mountain Climbers", bodyPart: "Core", reps: 20, sets: 3, duration: 180, rest: 45 },
      { name: "Jumping Jacks", bodyPart: "Cardio", reps: 50, sets: 3, duration: 120, rest: 30 },
      { name: "Dumbbell Rows", bodyPart: "Back", reps: 12, sets: 3, duration: 180, rest: 60 },
      { name: "Overhead Press", bodyPart: "Shoulders", reps: 12, sets: 3, duration: 180, rest: 60 },
      { name: "Bicep Curls", bodyPart: "Arms", reps: 15, sets: 3, duration: 120, rest: 45 }
    ];

    // Select 3-5 exercises based on equipment and goal
    const availableExercises = exerciseDatabase.filter(ex => {
      if (equipment.includes("Bodyweight Only")) {
        return ["Push-ups", "Squats", "Plank", "Lunges", "Burpees", "Mountain Climbers", "Jumping Jacks"].includes(ex.name);
      }
      return true;
    });

    const selectedExercises = availableExercises
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);

    return selectedExercises;
  };

  const getDayFocus = (day: string, goal: string) => {
    const focuses = ["Upper Body", "Lower Body", "Core", "Full Body", "Cardio", "Strength", "Endurance"];
    return focuses[Math.floor(Math.random() * focuses.length)];
  };

  const saveWorkoutPlan = async () => {
    if (!generatedPlan) return;

    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    for (const [day, plan] of Object.entries(generatedPlan)) {
      const dayIndex = DAYS_OF_WEEK.indexOf(day);
      const workoutDate = new Date(currentWeekStart);
      workoutDate.setDate(currentWeekStart.getDate() + dayIndex);
      
      const dateString = workoutDate.toISOString().split("T")[0];
      const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

      for (const exercise of plan.exercises) {
        await createMutation.mutateAsync({
          userId,
          workoutName: exercise.name,
          bodyPart: exercise.bodyPart,
          reps: exercise.reps,
          sets: exercise.sets,
          duration: exercise.duration,
          date: dateString,
          time,
          userWeight: parseFloat(user?.weight || "0"),
          calories: Math.round((exercise.duration / 60) * 5),
          isCompleted: false,
        });
      }
    }

    handleClose();
  };

  const isStep1Valid = fitnessGoal && daysAvailable.length > 0 && equipment.length > 0 && experienceLevel && workoutDuration;
  const isStep2Valid = true; // Review step doesn't need validation

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gray-900 rounded-2xl border border-purple-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Workout Generator</h2>
                  <p className="text-sm text-silver">Create your personalized weekly workout plan</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-silver" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8 gap-2">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= stepNumber
                        ? "bg-purple-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-8 h-0.5 transition-colors ${
                        step > stepNumber ? "bg-purple-500" : "bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Input Form */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-silver text-sm font-medium mb-2 block">
                    <Target className="w-4 h-4 inline mr-2" />
                    Fitness Goal
                  </Label>
                  <Select onValueChange={setFitnessGoal} value={fitnessGoal}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select your primary fitness goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {FITNESS_GOALS.map((goal) => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-silver text-sm font-medium mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Days Available
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={daysAvailable.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDaysAvailable([...daysAvailable, day]);
                            } else {
                              setDaysAvailable(daysAvailable.filter(d => d !== day));
                            }
                          }}
                        />
                        <Label htmlFor={day} className="text-sm text-white">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-silver text-sm font-medium mb-2 block">
                    <Dumbbell className="w-4 h-4 inline mr-2" />
                    Equipment Available
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EQUIPMENT_OPTIONS.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={equipment.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEquipment([...equipment, item]);
                            } else {
                              setEquipment(equipment.filter(e => e !== item));
                            }
                          }}
                        />
                        <Label htmlFor={item} className="text-sm text-white">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-silver text-sm font-medium mb-2 block">
                      Experience Level
                    </Label>
                    <Select onValueChange={setExperienceLevel} value={experienceLevel}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-silver text-sm font-medium mb-2 block">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Workout Duration
                    </Label>
                    <Select onValueChange={setWorkoutDuration} value={workoutDuration}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-30">15-30 min</SelectItem>
                        <SelectItem value="30-45">30-45 min</SelectItem>
                        <SelectItem value="45-60">45-60 min</SelectItem>
                        <SelectItem value="60+">60+ min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-silver text-sm font-medium mb-2 block">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any injuries, preferences, or specific areas to focus on..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-silver/40 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-white/20 text-silver hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="flex-1 bg-purple-500 text-white hover:bg-purple-600"
                  >
                    Generate Plan
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Generating */}
            {step === 2 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Generating Your Workout Plan</h3>
                <p className="text-silver">Our AI is creating a personalized plan based on your goals...</p>
              </div>
            )}

            {/* Step 3: Review Plan */}
            {step === 3 && generatedPlan && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Your Weekly Workout Plan</h3>
                  <div className="space-y-4">
                    {Object.entries(generatedPlan).map(([day, plan]) => (
                      <div key={day} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white">{day}</h4>
                          <div className="flex items-center gap-2 text-sm text-silver">
                            <Clock className="w-3 h-3" />
                            {Math.round(plan.estimatedDuration / 60)} min
                          </div>
                        </div>
                        <div className="text-sm text-purple-400 mb-3">Focus: {plan.focus}</div>
                        <div className="space-y-2">
                          {plan.exercises.map((exercise, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="text-white font-medium">{exercise.name}</span>
                                <span className="text-silver ml-2">({exercise.bodyPart})</span>
                              </div>
                              <div className="text-silver">
                                {exercise.sets} × {exercise.reps} reps
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-white/20 text-silver hover:text-white"
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={saveWorkoutPlan}
                    className="flex-1 bg-purple-500 text-white hover:bg-purple-600"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Save Plan to Calendar"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
