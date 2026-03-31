import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWorkoutImage, FALLBACK_PLACEHOLDER } from "@/utils/imageGenerator";

interface WorkoutPreviewProps {
  workout?: {
    name: string;
    bodyPart: string;
    reps: number;
    sets: number;
    difficulty: string;
    image: string;
    description: string;
  };
}

export function WorkoutPreview({ workout }: WorkoutPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const imageUrl = await generateWorkoutImage(workout?.name || "Workout");
      setDisplayImage(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
      setDisplayImage(FALLBACK_PLACEHOLDER);
    } finally {
      setIsGenerating(false);
    }
  };

  const imageUrl = displayImage || workout?.image || FALLBACK_PLACEHOLDER;
  const hasCustomImage = !!displayImage;

  if (!workout) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 border border-primary/20 flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="p-4 bg-primary/20 rounded-full mb-4">
          <Dumbbell className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">Workout Preview</h3>
        <p className="text-silver text-sm text-center">Ask Trainer Kevin for a workout recommendation to get started!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl overflow-hidden border border-primary/20"
    >
      <div className="aspect-video relative overflow-hidden bg-black/50">
        <motion.img
          key={imageUrl}
          src={imageUrl}
          alt={workout.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-display font-bold text-white mb-1 uppercase">{workout.name}</h3>
          <p className="text-silver text-sm">{workout.description}</p>
          {!hasCustomImage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="mt-3 text-[10px] px-3 py-1.5 bg-primary/20 hover:bg-primary/30 disabled:opacity-50 rounded-full text-primary font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {isGenerating ? "Generating..." : "Generate Image"}
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Body Part</p>
            <p className="text-white font-bold">{workout.bodyPart}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Reps</p>
            <p className="text-white font-bold">{workout.reps}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Sets</p>
            <p className="text-white font-bold">{workout.sets}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Difficulty</p>
            <p className="text-accent font-bold">{workout.difficulty}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
