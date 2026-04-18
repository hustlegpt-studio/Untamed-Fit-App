import React, { useState, useEffect } from "react";
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
import { X, Plus, Clock, Target, Flame } from "lucide-react";
import { useCreateUserWorkoutSession, useUpdateUserWorkoutSession } from "@/hooks/use-user-workout-sessions";
import { useAuth } from "@/hooks/use-auth";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  editingSession?: any;
}

const BODY_PARTS = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio"
];

const WORKOUT_TYPES = [
  "Strength Training", "HIIT", "Cardio", "Mobility", "CrossFit", "Yoga", "Pilates", "Other"
];

const COMMON_EXERCISES = {
  "Chest": ["Push-ups", "Bench Press", "Dumbbell Fly", "Incline Press"],
  "Back": ["Pull-ups", "Deadlifts", "Rows", "Lat Pulldowns"],
  "Shoulders": ["Overhead Press", "Lateral Raises", "Front Raises", "Shrugs"],
  "Arms": ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Skull Crushers"],
  "Legs": ["Squats", "Lunges", "Leg Press", "Calf Raises"],
  "Core": ["Planks", "Crunches", "Russian Twists", "Leg Raises"],
  "Full Body": ["Burpees", "Kettlebell Swings", "Thrusters", "Clean & Press"],
  "Cardio": ["Running", "Jump Rope", "Rowing", "Cycling"]
};

export function WorkoutModal({ isOpen, onClose, selectedDate, editingSession }: WorkoutModalProps) {
  const { data: user } = useAuth();
  const userId = user?.id || 1;
  
  const createMutation = useCreateUserWorkoutSession();
  const updateMutation = useUpdateUserWorkoutSession();
  
  const [workoutName, setWorkoutName] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [duration, setDuration] = useState("");
  const [userWeight, setUserWeight] = useState(user?.weight || "");
  const [notes, setNotes] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [exerciseImage, setExerciseImage] = useState<string | null>(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (editingSession) {
      setWorkoutName(editingSession.workoutName || "");
      setBodyPart(editingSession.bodyPart || "");
      setReps(editingSession.reps?.toString() || "");
      setSets(editingSession.sets?.toString() || "");
      setDuration(editingSession.duration?.toString() || "");
      setUserWeight(editingSession.userWeight?.toString() || "");
      setNotes(editingSession.notes || "");
      setWorkoutType(editingSession.workoutType || "");
      setExerciseImage(editingSession.imageUrl || null);
    } else {
      // Reset form for new workout
      setWorkoutName("");
      setBodyPart("");
      setReps("");
      setSets("");
      setDuration("");
      setUserWeight(user?.weight || "");
      setNotes("");
      setWorkoutType("");
      setExerciseImage(null);
    }
  }, [editingSession, user]);

  // Fetch exercise image when workout name changes
  useEffect(() => {
    if (workoutName.trim()) {
      fetchExerciseImage(workoutName.trim());
    } else {
      setExerciseImage(null);
    }
  }, [workoutName]);

  // Fetch exercise image from library
  const fetchExerciseImage = async (exerciseName: string) => {
    try {
      console.log(`\ud83c\udfa8 Fetching image for exercise: ${exerciseName}`);
      
      const response = await fetch('/api/ai/generate-exercise-image/library');
      if (!response.ok) {
        console.error('Failed to fetch exercise library');
        return;
      }

      const data = await response.json();
      
      if (data.success && data.exerciseLibrary) {
        const normalizedName = exerciseName.toLowerCase().trim();
        const exerciseData = data.exerciseLibrary[normalizedName];
        
        if (exerciseData?.imageUrl) {
          console.log(`\u2705 Found existing image for ${exerciseName}: ${exerciseData.imageUrl}`);
          setExerciseImage(exerciseData.imageUrl);
        } else {
          console.log(`\ud83d\udd0d No image found for ${exerciseName}`);
          setExerciseImage(null);
        }
      }
    } catch (error) {
      console.error('Error fetching exercise image:', error);
      setExerciseImage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutName || !bodyPart || !reps || !sets || !duration) {
      return;
    }

    const sessionData = {
      userId,
      workoutName,
      bodyPart,
      reps: parseInt(reps),
      sets: parseInt(sets),
      duration: parseInt(duration),
      date: selectedDate || new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      userWeight: parseFloat(userWeight) || 0,
      calories: Math.round((parseInt(duration) / 60) * 5), // Simple calorie estimate
      isCompleted: false,
    };

    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, updates: sessionData });
    } else {
      createMutation.mutate(sessionData);
    }

    onClose();
  };

  const handleBodyPartChange = (value: string) => {
    setBodyPart(value);
    // Auto-suggest a workout name based on body part
    const exercises = COMMON_EXERCISES[value as keyof typeof COMMON_EXERCISES];
    if (exercises && exercises.length > 0 && !workoutName) {
      setWorkoutName(exercises[0]);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gray-900 rounded-2xl border border-primary/30 p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingSession ? "Edit Workout" : "Add Workout"}
                  </h2>
                  <p className="text-sm text-silver">
                    {selectedDate ? `For ${new Date(selectedDate + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}` : "Today"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-silver" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workout Name */}
              <div>
                <Label className="text-silver text-sm font-medium mb-2 block">
                  Exercise Name
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="e.g., Push-ups, Squats, Running"
                    className="bg-white/5 border-white/20 text-white placeholder:text-silver/40 flex-1"
                    required
                  />
                  {exerciseImage ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/20 flex-shrink-0">
                      <img 
                        src={exerciseImage} 
                        alt={workoutName || "Exercise"}
                        className="w-full h-full object-cover"
                        onError={() => setExerciseImage(null)}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/20 flex-shrink-0 flex items-center justify-center">
                      <Target className="w-6 h-6 text-silver/40" />
                    </div>
                  )}
                </div>
              </div>

              {/* Body Part */}
              <div>
                <Label className="text-silver text-sm font-medium mb-2 block">
                  Body Part
                </Label>
                <Select onValueChange={handleBodyPartChange} value={bodyPart}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_PARTS.map((part) => (
                      <SelectItem key={part} value={part}>
                        {part}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workout Type */}
              <div>
                <Label className="text-silver text-sm font-medium mb-2 block">
                  Workout Type
                </Label>
                <Select onValueChange={setWorkoutType} value={workoutType}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reps and Sets */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-silver text-sm font-medium mb-2 block">
                    Reps
                  </Label>
                  <Input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="10"
                    min="1"
                    className="bg-white/5 border-white/20 text-white placeholder:text-silver/40"
                    required
                  />
                </div>
                <div>
                  <Label className="text-silver text-sm font-medium mb-2 block">
                    Sets
                  </Label>
                  <Input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder="3"
                    min="1"
                    className="bg-white/5 border-white/20 text-white placeholder:text-silver/40"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="text-silver text-sm font-medium mb-2 block">
                  Duration (seconds)
                </Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="300"
                  min="1"
                  className="bg-white/5 border-white/20 text-white placeholder:text-silver/40"
                  required
                />
              </div>

              {/* Body Weight */}
              <div>
                <Label className="text-silver text-sm font-medium mb-2 block">
                  Body Weight (lbs) - optional
                </Label>
                <Input
                  type="number"
                  value={userWeight}
                  onChange={(e) => setUserWeight(e.target.value)}
                  placeholder="150"
                  min="1"
                  className="bg-white/5 border-white/20 text-white placeholder:text-silver/40"
                />
              </div>

              {/* Notes */}
              <div>
                <Label className="text-silver text-sm font-medium mb-2 block">
                  Notes - optional
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it feel? Any modifications?"
                  className="bg-white/5 border-white/20 text-white placeholder:text-silver/40 resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/20 text-silver hover:text-white"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-black hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {editingSession ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Update
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Workout
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
