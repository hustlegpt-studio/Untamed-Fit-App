import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logWorkoutSession, createWorkoutSession } from "@/utils/workoutLogger";

interface StopWatchBoxProps {
  isActive?: boolean;
  onStart?: () => void;
  currentWorkout?: {
    name: string;
    bodyPart: string;
    reps: number;
    sets: number;
  };
}

export function StopWatchBox({ isActive = false, onStart, currentWorkout }: StopWatchBoxProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [ledColor, setLedColor] = useState("text-primary");
  const [loggedMessage, setLoggedMessage] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isActive && !isRunning) {
      setIsRunning(true);
    }
  }, [isActive, isRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const secsLeft = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${secsLeft.toString().padStart(2, "0")}`;
  };

  const ledColors = {
    green: "text-primary",
    orange: "text-accent",
    white: "text-white"
  };

  const toggleColor = () => {
    const colors = Object.values(ledColors);
    const currentIndex = colors.indexOf(ledColor);
    setLedColor(colors[(currentIndex + 1) % colors.length]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-8 border border-accent/20 flex flex-col items-center justify-center min-h-[400px] gap-6"
    >
      <h3 className="text-xl font-display font-bold text-white">STOP WATCH</h3>

      {/* LED Display */}
      <div className="relative">
        <div className="bg-black/80 border-4 border-white/10 rounded-2xl p-8 shadow-2xl">
          <div 
            className={`font-mono text-7xl font-bold tracking-wider ${ledColor} drop-shadow-lg`}
            style={{
              textShadow: `0 0 20px currentColor`,
              fontFamily: '"Courier New", monospace',
              letterSpacing: "0.1em"
            }}
          >
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* LED Color Selector */}
      <div className="flex gap-2">
        <button
          onClick={toggleColor}
          className="text-[10px] px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold uppercase tracking-wider transition-colors"
        >
          Change Color
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsRunning(!isRunning);
            onStart?.();
          }}
          className={`${isRunning ? "bg-accent" : "bg-primary"} text-white hover:opacity-80 rounded-full w-14 h-14 p-0 flex items-center justify-center`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        <Button
          onClick={() => {
            // Log the workout when reset button is clicked and time was recorded
            if (seconds > 0 && currentWorkout) {
              const session = createWorkoutSession(
                currentWorkout.name,
                currentWorkout.bodyPart,
                currentWorkout.reps,
                currentWorkout.sets,
                seconds
              );
              logWorkoutSession(session);
              setLoggedMessage(true);
              
              // Clear message after 3 seconds
              setTimeout(() => setLoggedMessage(false), 3000);
            }
            
            setSeconds(0);
            setIsRunning(false);
          }}
          className="bg-white/10 text-white hover:bg-white/20 rounded-full w-14 h-14 p-0 flex items-center justify-center"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>

      {/* Status Messages */}
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">
        {isRunning ? "⏱️ Running" : "⏸️ Paused"}
      </p>

      {loggedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-wider"
        >
          <CheckCircle className="w-4 h-4" />
          Workout logged successfully
        </motion.div>
      )}
    </motion.div>
  );
}
