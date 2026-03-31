import React, { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { getWorkoutHistory, formatDuration } from "@/utils/workoutLogger";
import { Calendar, Dumbbell, Activity, Zap, Clock } from "lucide-react";

interface WorkoutsByDate {
  [date: string]: Array<any>;
}

function getWorkoutTypeColor(workoutName: string): "green" | "blue" | "yellow" {
  const nameLower = workoutName.toLowerCase();
  
  // Strength training workouts
  if (nameLower.includes("squat") || nameLower.includes("press") || 
      nameLower.includes("deadlift") || nameLower.includes("curl") || 
      nameLower.includes("row") || nameLower.includes("dip") ||
      nameLower.includes("bench") || nameLower.includes("lift")) {
    return "green";
  }
  
  // Cardio workouts
  if (nameLower.includes("cardio") || nameLower.includes("sprint") || 
      nameLower.includes("run") || nameLower.includes("jump")) {
    return "blue";
  }
  
  // Mobility/stretching
  if (nameLower.includes("stretch") || nameLower.includes("mobility") || 
      nameLower.includes("yoga") || nameLower.includes("flexibility")) {
    return "yellow";
  }
  
  // Default to strength
  return "green";
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

export default function WorkoutCalendar() {
  const history = getWorkoutHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayString = today.toISOString().split("T")[0];

  // Group workouts by date
  const workoutsByDate: WorkoutsByDate = useMemo(() => {
    const grouped: WorkoutsByDate = {};
    history.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });
    return grouped;
  }, [history]);

  // Calendar generation
  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth));
  const firstDay = getFirstDayOfMonth(new Date(currentYear, currentMonth));
  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // Selected date workouts
  const selectedDateWorkouts = selectedDate ? workoutsByDate[selectedDate] : [];
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", { month: "long" });

  // Color map for workout types
  const colorClasses = {
    green: "bg-primary text-primary",
    blue: "bg-blue-500 text-blue-500",
    yellow: "bg-yellow-500 text-yellow-500"
  };

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          WORKOUT <span className="text-primary text-glow">CALENDAR</span>
        </h1>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">
          {monthName} {currentYear} • {history.length} workouts logged
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-6 border border-primary/20"
          >
            {/* Month/Year Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase">
                {monthName} {currentYear}
              </h2>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dateString = day
                  ? new Date(currentYear, currentMonth, day).toISOString().split("T")[0]
                  : null;
                const hasWorkouts = dateString ? !!workoutsByDate[dateString] : false;
                const isToday = dateString === todayString;
                const isSelected = dateString === selectedDate;

                return (
                  <motion.button
                    key={index}
                    whileHover={day ? { scale: 1.05 } : undefined}
                    whileTap={day ? { scale: 0.95 } : undefined}
                    onClick={() => day && dateString && setSelectedDate(dateString)}
                    className={`aspect-square rounded-xl transition-all relative group ${
                      !day
                        ? "bg-transparent"
                        : isSelected
                        ? "bg-primary/30 border-primary"
                        : isToday
                        ? "bg-white/10 border border-primary/50"
                        : "bg-white/5 border border-white/10 hover:border-primary/30"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-sm font-bold ${isToday ? "text-primary" : "text-white"}`}>
                            {day}
                          </span>
                        </div>

                        {/* Workout indicator dots */}
                        {hasWorkouts && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                            {workoutsByDate[dateString]!.slice(0, 3).map((session, i) => {
                              const color = getWorkoutTypeColor(session.workoutName);
                              return (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    color === "green"
                                      ? "bg-primary"
                                      : color === "blue"
                                      ? "bg-blue-500"
                                      : "bg-yellow-500"
                                  }`}
                                />
                              );
                            })}
                            {workoutsByDate[dateString]!.length > 3 && (
                              <div className="text-[8px] text-muted-foreground">+</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground uppercase">Strength</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground uppercase">Cardio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground uppercase">Mobility</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Workout Panel */}
        <div>
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-panel rounded-3xl p-6 border border-primary/20 space-y-4 sticky top-20"
              >
                <div>
                  <h3 className="text-lg font-display font-bold text-white uppercase mb-1">
                    {new Date(selectedDate + "T00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric"
                    })}
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {selectedDateWorkouts.length} {selectedDateWorkouts.length === 1 ? "workout" : "workouts"}
                  </p>
                </div>

                {selectedDateWorkouts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-silver text-sm">No workouts logged for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateWorkouts.map((session, idx) => {
                      const color = getWorkoutTypeColor(session.workoutName);
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div
                              className={`p-1.5 rounded-full ${
                                color === "green"
                                  ? "bg-primary/20"
                                  : color === "blue"
                                  ? "bg-blue-500/20"
                                  : "bg-yellow-500/20"
                              }`}
                            >
                              <Dumbbell
                                className={`w-3 h-3 ${
                                  color === "green"
                                    ? "text-primary"
                                    : color === "blue"
                                    ? "text-blue-500"
                                    : "text-yellow-500"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-white uppercase">{session.workoutName}</h4>
                              <p className="text-[9px] text-muted-foreground">{session.bodyPart}</p>
                            </div>
                          </div>

                          <div className="space-y-1 text-[9px] text-silver">
                            <div className="flex justify-between">
                              <span>Reps × Sets</span>
                              <span className="font-bold text-white">{session.reps} × {session.sets}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration</span>
                              <span className="font-bold text-white">{formatDuration(session.duration)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Calories</span>
                              <span className="font-bold text-white">{session.calories} cal</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-white/5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {session.time}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center"
              >
                <Calendar className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                <p className="text-silver text-sm">Click a date to view workouts.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
