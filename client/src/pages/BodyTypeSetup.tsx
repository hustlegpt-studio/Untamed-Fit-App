import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getActiveUser, logoutUser, getCurrentUserProfile, updateUserProfile, isAuthenticated } from "@/utils/auth";
import { ArrowRight, LogOut, Check, User } from "lucide-react";

const BODY_TYPES = [
  { id: "ectomorph", label: "Ectomorph", description: "Lean and long, with difficulty building muscle" },
  { id: "mesomorph", label: "Mesomorph", description: "Muscular and well-built, with high metabolism" },
  { id: "endomorph", label: "Endomorph", description: "Big, high body fat, often pear-shaped" },
];

export default function BodyTypeSetup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const user = getCurrentUserProfile();

  React.useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/auth";
    }
  }, []);

  if (!user) return null;

  const handleContinue = async () => {
    if (!selectedType) {
      setError("Please select your body type.");
      return;
    }

    setIsLoading(true);
    try {
      updateUserProfile({ bodyType: selectedType });
      setLocation("/dashboard");
    } catch (err: any) {
      setError("Failed to save body type.");
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
          <h1 className="text-4xl font-display font-bold text-white mb-2 uppercase">BODY TYPE</h1>
          <p className="text-muted-foreground text-sm">Select the type that best describes you.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {BODY_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  isSelected 
                    ? "bg-primary/20 border-primary" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className={`p-3 rounded-xl ${isSelected ? "bg-primary text-black" : "bg-white/10 text-white"}`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display font-bold uppercase">{type.label}</h3>
                  <p className="text-silver text-xs">{type.description}</p>
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

        {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}

        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-primary text-black hover:opacity-90 rounded-full font-bold uppercase tracking-wider h-12 mb-4"
        >
          {isLoading ? "Saving..." : "Complete Setup"}
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
