import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Activity, Calendar, Clock, Dumbbell, Zap } from "lucide-react";
import { getWorkoutHistory, formatDuration } from "@/utils/workoutLogger";

export default function WorkoutHistory() {
  const history = getWorkoutHistory();

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          WORKOUT <span className="text-primary text-glow">HISTORY</span>
        </h1>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">Every rep counts. Track your progress.</p>
      </header>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-12 border border-primary/20 flex flex-col items-center justify-center text-center"
        >
          <div className="p-4 bg-primary/20 rounded-full mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">No Workouts Yet</h2>
          <p className="text-silver max-w-md">
            Start training with Trainer Kevin and your workout sessions will be logged here automatically.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-silver uppercase tracking-wider text-sm font-bold">
              {history.length} {history.length === 1 ? "Workout" : "Workouts"} Logged
            </p>
          </div>

          <div className="space-y-3">
            {history.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Workout Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-white uppercase mb-2">
                      {session.workoutName}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-[10px]">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Dumbbell className="w-3 h-3 text-primary" />
                        {session.bodyPart}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-primary">•</span>
                        {session.reps} reps × {session.sets} sets
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="w-3 h-3 text-accent" />
                        {session.calories} cal
                      </div>
                    </div>
                  </div>

                  {/* Right: Date/Time/Duration */}
                  <div className="flex flex-col md:items-end gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-silver">
                      <Calendar className="w-3 h-3 text-primary" />
                      {new Date(session.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-silver">
                      <Clock className="w-3 h-3 text-primary" />
                      {session.time}
                    </div>
                    <div className="px-2 py-1 bg-primary/20 rounded-full text-primary font-bold uppercase tracking-wider">
                      {formatDuration(session.duration)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
