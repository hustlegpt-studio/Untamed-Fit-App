import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Info, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Chest", "Back", "Arms", "Shoulders", "Legs", "Core", "Full Body"];

const WORKOUTS_DATA: Record<string, any[]> = {
  "Chest": [
    { id: 1, name: "Incline Push-Up", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop", instructions: "Place hands on an elevated surface. Keep core tight and lower chest to the edge." },
    { id: 2, name: "Diamond Push-Up", image: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070&auto=format&fit=crop", instructions: "Form a diamond shape with your hands. Lower chest towards your hands." }
  ],
  "Legs": [
    { id: 3, name: "Bodyweight Squat", image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop", instructions: "Feet shoulder-width apart. Sit back like into a chair, keeping chest up." }
  ]
};

export default function Workouts() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const currentWorkouts = WORKOUTS_DATA[selectedCategory] || [];
  const currentWorkout = currentWorkouts[currentIndex];

  const nextWorkout = () => {
    if (currentIndex < currentWorkouts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevWorkout = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          TRAIN BY <span className="text-primary text-glow">BODY PART</span>
        </h1>
        <div className="flex gap-2 overflow-x-auto pb-4 mt-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-6 py-2 rounded-full font-display text-sm whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(0,255,122,0.3)]" 
                : "bg-white/5 text-silver border-white/10 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="relative max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {currentWorkout ? (
            <motion.div
              key={currentWorkout.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="glass-panel rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-[4/5] relative">
                <img 
                  src={currentWorkout.image} 
                  alt={currentWorkout.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="rounded-full bg-black/50 backdrop-blur-md border-white/10"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase">{currentWorkout.name}</h2>
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Instructions</span>
                  </div>
                  <p className="text-silver text-sm leading-relaxed glass-panel p-4 rounded-xl border-white/5">
                    {currentWorkout.instructions}
                  </p>
                </div>
              </div>

              <div className="flex justify-between p-4 bg-[#0D0D0D]">
                <Button 
                  variant="ghost" 
                  disabled={currentIndex === 0}
                  onClick={prevWorkout}
                  className="text-silver hover:text-white"
                >
                  <ChevronLeft className="mr-2" /> PREVIOUS
                </Button>
                <div className="flex items-center gap-1">
                  {currentWorkouts.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all ${i === currentIndex ? "w-4 bg-primary" : "w-1 bg-white/20"}`} 
                    />
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  disabled={currentIndex === currentWorkouts.length - 1}
                  onClick={nextWorkout}
                  className="text-primary hover:text-primary/80"
                >
                  NEXT <ChevronRight className="ml-2" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel rounded-3xl aspect-[4/5] flex flex-col items-center justify-center p-8 text-center">
              <Dumbbell className="w-16 h-16 text-white/10 mb-4" />
              <p className="text-muted-foreground">Workouts for {selectedCategory} coming soon!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
