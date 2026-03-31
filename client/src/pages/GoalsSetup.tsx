import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getActiveUser, logoutUser, getCurrentUserProfile, updateUserProfile, isAuthenticated } from "@/utils/auth";
import { ArrowRight, LogOut, Check, Target, Zap, Dumbbell, Activity, Heart } from "lucide-react";

const GOALS = [
  { id: "weight-loss", label: "Weight Loss", icon: Zap, description: "Burn fat and get leaner" },
  { id: "muscle-gain", label: "Muscle Gain", icon: Dumbbell, description: "Build strength and size" },
  { id: "endurance", label: "Endurance", icon: Activity, description: "Improve stamina and cardio" },
  { id: "flexibility", label: "Flexibility", icon: Heart, description: "Better range of motion" },
  { id: "athleticism", label: "Athleticism", icon: Target, description: "Overall sports performance" },
];

export default function GoalsSetup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [error, setError] = useState("");
  const user = getCurrentUserProfile();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/auth";
    }
  }, []);

  if (!user) {
    return null;
  }

  const toggleGoal = (id: string) => {
    setError("");
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      setError("Please select at least one goal.");
      return;
    }

    setIsLoading(true);
    try {
      updateUserProfile({ goals: selectedGoals });
      setLocation("/body-type-setup");
    } catch (err: any) {
      setError("Failed to save goals. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-3xl w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Untamed Fit" className="h-16 w-16 mx-auto object-contain mb-4" />
          <h1 className="text-4xl font-display font-bold text-white mb-2 uppercase">SET YOUR GOALS</h1>
          <p className="text-muted-foreground text-sm">
            What are you looking to achieve, <span className="text-primary font-semibold">{user.email}</span>?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const Icon = goal.icon;
            return (
              <motion.button
                key={goal.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  isSelected 
                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,255,122,0.2)]" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className={`p-3 rounded-xl ${isSelected ? "bg-primary text-black" : "bg-white/10 text-white"}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display font-bold uppercase">{goal.label}</h3>
                  <p className="text-silver text-xs">{goal.description}</p>
                </div>
                {isSelected && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {error && (
          <p className="text-destructive text-center text-sm font-semibold mb-4 bg-destructive/10 p-2 rounded-lg border border-destructive/20">
            {error}
          </p>
        )}

        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-primary text-black hover:opacity-90 rounded-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-4 h-12"
        >
          {isLoading ? "Saving..." : (
            <>
              Next: Select Body Type
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-white transition-colors font-semibold text-xs uppercase tracking-widest"
        >
          <LogOut className="w-3 h-3" />
          Switch Account
        </button>
      </motion.div>
    </div>
  );
}
