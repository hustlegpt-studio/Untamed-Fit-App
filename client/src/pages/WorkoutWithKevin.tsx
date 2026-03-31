import React from "react";
import { Layout } from "@/components/Layout";
import { Play, Lock, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const VIDEO_WORKOUTS = [
  {
    id: 1,
    title: "GET UP & GRIND",
    description: "Full Body Wake-Up (Beginner Friendly)",
    category: "Full Body",
    duration: 20,
    intensity: "Medium",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "MILITARY MODE: BOOTCAMP GRIT",
    description: "Lower Body + Core focus",
    category: "Lower Body",
    duration: 30,
    intensity: "High",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "SUNDAY STRETCH",
    description: "Recovery & Mental Reset",
    category: "Recovery",
    duration: 15,
    intensity: "Low",
    image: "https://images.unsplash.com/photo-1518611012118-2969c63b17b7?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function WorkoutWithKevin() {
  return (
    <Layout>
      <header className="mb-10 pt-4 relative">
        <div className="absolute -top-4 -left-4 w-64 h-64 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 mb-4 relative">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display text-white relative">
          WORKOUT WITH <span className="text-accent text-glow">KEVIN</span>
        </h1>
        <p className="text-silver mt-4 text-lg max-w-2xl uppercase tracking-widest font-display">
          Premium Coaching • Real Energy • Unleash the Beast
        </p>
      </header>

      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {["Full Body", "Upper Body", "Lower Body", "Cardio", "Recovery", "Motivation"].map(cat => (
          <button key={cat} className="px-6 py-2 rounded-lg glass-panel text-xs font-bold tracking-widest hover:border-accent/50 transition-all">
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {VIDEO_WORKOUTS.map((video) => (
          <motion.div 
            key={video.id}
            whileHover={{ y: -10 }}
            className="glass-panel rounded-3xl overflow-hidden group border border-white/5 premium-glow"
          >
            <div className="aspect-video relative">
              <img src={video.image} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 bg-accent rounded-full text-[10px] font-bold text-white tracking-widest uppercase shadow-lg">
                PREMIUM
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-white mb-2 uppercase">{video.title}</h3>
              <p className="text-silver text-sm mb-6 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 text-accent" /> {video.duration}m
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3 text-accent" /> {video.intensity}
                  </div>
                </div>
                <button className="text-[10px] font-bold text-accent tracking-widest hover:underline uppercase">
                  Unlock Access
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-8 glass-panel rounded-3xl border-dashed border-2 border-accent/30 text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-4 uppercase">New Workouts Every Week</h2>
        <p className="text-silver mb-8 max-w-xl mx-auto uppercase tracking-wider text-sm">
          Join the Elite plan to unlock Kevin's signature training programs and motivation sessions.
        </p>
        <Button size="lg" className="bg-accent text-white hover:bg-accent/80 px-12 rounded-full font-bold tracking-widest uppercase h-14">
          Upgrade to Elite
        </Button>
      </div>
    </Layout>
  );
}
