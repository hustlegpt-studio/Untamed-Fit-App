import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Play, Pause, SkipForward } from "lucide-react";
import { useAudioCues } from "@/components/AudioCuesProvider";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const { playCue } = useAudioCues();

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    playCue(isPlaying ? 'stop' : 'start');
  };

  return (
    <Layout>
      <Link href="/workouts" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Video / Player Area */}
          <div className="aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden relative group shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&auto=format&fit=crop" 
              alt="Workout"
              className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-40' : 'opacity-80'}`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <button 
                onClick={handleTogglePlay}
                className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center text-background shadow-[0_0_30px_rgba(0,255,122,0.5)] hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-10 h-10" fill="currentColor" /> : <Play className="w-10 h-10 ml-2" fill="currentColor" />}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-4xl font-display font-bold text-white mb-4">SPARTAN CHEST ROUTINE</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A high-intensity chest focused routine designed to build mass and endurance. Remember to breathe and follow the audio cues. Your own background music will duck gently when instructions are spoken.
            </p>
          </div>
        </div>

        {/* Sidebar Schedule */}
        <div className="glass-panel p-6 rounded-3xl h-fit">
          <h3 className="font-display text-xl font-bold mb-6 text-primary border-b border-white/10 pb-4">EXERCISES</h3>
          <div className="space-y-4">
            {[
              { name: "Warmup: Pushups", reps: "3x15", time: "5:00" },
              { name: "Barbell Bench Press", reps: "4x10", time: "12:00" },
              { name: "Incline DB Press", reps: "3x12", time: "10:00" },
              { name: "Cable Crossovers", reps: "3x15", time: "8:00" },
            ].map((ex, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div>
                  <p className="font-bold text-white group-hover:text-primary transition-colors">{ex.name}</p>
                  <p className="text-sm text-muted-foreground">{ex.reps}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-silver">{ex.time}</span>
                  <SkipForward className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-8" onClick={() => playCue('start')}>
            TEST AUDIO CUE
          </Button>
        </div>
      </div>
    </Layout>
  );
}
