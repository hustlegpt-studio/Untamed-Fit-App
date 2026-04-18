import React, { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/utils/workoutLogger";
import { useUserWorkoutSessions, useDeleteUserWorkoutSession, useUpdateUserWorkoutSession } from "@/hooks/use-user-workout-sessions";
import { WorkoutModal } from "@/components/WorkoutModal";
import { AIWorkoutGenerator } from "@/components/AIWorkoutGenerator";
import { AIVoiceTrainer } from "@/components/AIVoiceTrainer";
import { Calendar, Dumbbell, Activity, Zap, Clock, Plus, Edit, Trash2, Check, Sparkles, Mic } from "lucide-react";

interface WorkoutsByDate {
  [date: string]: Array<{
    id: number;
    workoutName: string;
    bodyPart: string;
    reps: number;
    sets: number;
    duration: number;
    date: string;
    time: string;
    userWeight: number;
    calories: number;
    isCompleted: boolean;
    createdAt: number;
    updatedAt: number;
  }>;
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
  const { data: sessions = [], isLoading } = useUserWorkoutSessions();
  const deleteMutation = useDeleteUserWorkoutSession();
  const updateMutation = useUpdateUserWorkoutSession();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayString = today.toISOString().split("T")[0];

  // Group workouts by date
  const workoutsByDate: WorkoutsByDate = useMemo(() => {
    const grouped: WorkoutsByDate = {};
    sessions.forEach((session: any) => {
      const date = session.date;
      if (date && !grouped[date]) {
        grouped[date] = [];
      }
      if (date) {
        grouped[date].push(session);
      }
    });
    return grouped;
  }, [sessions]);

  // Calendar generation
  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth));
  const firstDay = getFirstDayOfMonth(new Date(currentYear, currentMonth));
  const calendarDays = [...Array.from({ length: firstDay }, () => null), 
                   ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // Handler functions
  const handleEditWorkout = (session: any) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleDeleteWorkout = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setShowDeleteConfirm(null);
      }
    });
  };

  const handleToggleComplete = (session: any) => {
    updateMutation.mutate({
      id: session.id,
      updates: { isCompleted: !session.isCompleted }
    });
  };

  // Selected date workouts with filter
  const selectedDateWorkouts = useMemo(() => {
    const workouts = selectedDate ? workoutsByDate[selectedDate] || [] : [];
    if (completionFilter === "completed") {
      return workouts.filter((w: any) => w.isCompleted);
    } else if (completionFilter === "incomplete") {
      return workouts.filter((w: any) => !w.isCompleted);
    }
    return workouts;
  }, [selectedDate, workoutsByDate, completionFilter]);
  
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", { month: "long" });

  // Color map for workout types
  const colorClasses = {
    green: "bg-primary text-primary",
    blue: "bg-blue-500 text-blue-500",
    yellow: "bg-yellow-500 text-yellow-500"
  };

  return (
    <Layout>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-display text-white">
            WORKOUT <span className="text-primary text-glow">CALENDAR</span>
          </h1>
          <p className="text-silver mt-2 uppercase tracking-widest text-sm">
            {monthName} {currentYear} · {sessions.length} workouts logged
          </p>
        </div>
        <Button
          onClick={() => setIsAIModalOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate My Week
        </Button>
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
              {calendarDays.map((day: number | null, index: number) => {
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
                        {hasWorkouts && dateString && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                            {workoutsByDate[dateString]?.slice(0, 3).map((session: any, i: number) => {
                              const color = getWorkoutTypeColor(session.workoutName);
                              return (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full relative ${
                                    session.isCompleted
                                      ? "bg-green-500 ring-1 ring-green-400/50"
                                      : color === "green"
                                      ? "bg-primary"
                                      : color === "blue"
                                      ? "bg-blue-500"
                                      : "bg-yellow-500"
                                  }`}
                                >
                                  {session.isCompleted && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-0.5 h-0.5 bg-white rounded-full" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {workoutsByDate[dateString] && workoutsByDate[dateString]!.length > 3 && (
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
                <div className="flex items-center justify-between">
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
                  
                  {/* Completion Filter */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={completionFilter === "all" ? "default" : "ghost"}
                      onClick={() => setCompletionFilter("all")}
                      className={`text-xs px-2 py-1 ${
                        completionFilter === "all" 
                          ? "bg-primary text-black" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={completionFilter === "completed" ? "default" : "ghost"}
                      onClick={() => setCompletionFilter("completed")}
                      className={`text-xs px-2 py-1 ${
                        completionFilter === "completed" 
                          ? "bg-green-500 text-white" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Completed
                    </Button>
                    <Button
                      size="sm"
                      variant={completionFilter === "incomplete" ? "default" : "ghost"}
                      onClick={() => setCompletionFilter("incomplete")}
                      className={`text-xs px-2 py-1 ${
                        completionFilter === "incomplete" 
                          ? "bg-orange-500 text-white" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      Incomplete
                    </Button>
                  </div>
                </div>

                {selectedDateWorkouts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-silver text-sm mb-4">No workouts logged for this day.</p>
                    <Button
                      onClick={() => {
                        setEditingSession(null);
                        setIsModalOpen(true);
                      }}
                      className="bg-primary text-black hover:bg-primary/90 rounded-xl font-bold uppercase tracking-widest text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Workout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateWorkouts.map((session: any, idx: number) => {
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
                                className="w-4 h-4"
                                style={{
                                  color:
                                    color === "green"
                                      ? "rgb(var(--primary))"
                                      : color === "blue"
                                      ? "rgb(59 130 246)"
                                      : "rgb(234 179 8)",
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-bold">{session.workoutName}</h4>
                              <p className="text-muted-foreground text-sm">{session.bodyPart}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {session.sets} × {session.reps}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.time}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleComplete(session)}
                              className={`h-7 px-2 text-xs ${
                                session.isCompleted 
                                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                                  : "text-muted-foreground hover:text-white"
                              }`}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {session.isCompleted ? "Completed" : "Complete"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditWorkout(session)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-white"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowDeleteConfirm(session.id)}
                              className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <Button
                        onClick={() => {
                          setEditingSession(null);
                          setIsModalOpen(true);
                        }}
                        className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 rounded-xl font-bold uppercase tracking-widest text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Workout
                      </Button>
                      
                      <Button
                        onClick={() => setIsAIModalOpen(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-primary text-white hover:from-purple-700 hover:to-primary/600 border border-purple-500/30 rounded-xl font-bold uppercase tracking-widest text-sm"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        AI Voice Trainer
                      </Button>
                    </div>
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

      {/* Workout Modal */}
      <WorkoutModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
        }}
        selectedDate={selectedDate}
        editingSession={editingSession}
      />

      {/* AI Voice Trainer Modal */}
      <AIVoiceTrainer
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setGeneratedPlan(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Workout</h3>
                  <p className="text-sm text-silver">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-silver text-sm mb-6">
                Are you sure you want to delete this workout session?
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 border-white/20 text-silver hover:text-white"
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteWorkout(showDeleteConfirm)}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Workout Generator */}
      <AIWorkoutGenerator
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </Layout>
  );
}
