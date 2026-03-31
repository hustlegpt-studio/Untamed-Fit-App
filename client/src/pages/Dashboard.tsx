import React from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { Play, Flame, Trophy, Activity, MessageSquare, Dumbbell, Target, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user } = useAuth();
  const { data: progress } = useProgress();

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="glass-panel p-4 rounded-xl mb-6 border-l-4 border-l-[#00FF7A]">
          <p className="italic text-silver">"The only bad workout is the one that didn't happen."</p>
        </div>
        <div className="flex items-center gap-6 mb-6">
          <img src="/logo.png" alt="Untamed Fit" className="h-32 w-32 object-contain" />
          <h1 className="text-5xl md:text-6xl font-display text-white">
            UNTAMED <span className="text-primary text-glow">FIT</span>
          </h1>
        </div>
      </header>

      {/* Hero Section with Kevin */}
      <div className="relative rounded-3xl overflow-hidden mb-10 group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <img 
          src="/assets/placeholders/KG_HOME_01.jpg" 
          alt="Kevin"
          className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
          <h2 className="text-3xl font-display font-bold text-white mb-4 uppercase text-glow">READY TO WORK?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <HomeButton href="/ask-kevin" icon={MessageSquare} label="ASK KEVIN" />
            <HomeButton href="/workouts" icon={Dumbbell} label="TRAIN BY BODY" />
            <HomeButton href="/workout-with-kevin" icon={Play} label="WORKOUT W/ KEVIN" />
            <HomeButton href="/challenges" icon={Target} label="CHALLENGES" />
            <HomeButton href="/merch" icon={ShoppingBag} label="MERCH SHOP" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatsCard icon={Activity} title="Workouts" value="24" suffix="this month" color="text-primary" bg="bg-primary/10" />
        <StatsCard icon={Trophy} title="Current Streak" value="5" suffix="days" color="text-accent" bg="bg-accent/10" />
        <StatsCard icon={Flame} title="Calories" value="12k" suffix="burned" color="text-red-500" bg="bg-red-500/10" />
      </div>

      <div className="glass-panel rounded-2xl p-6 mb-10">
        <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <Activity className="text-primary" /> RECENT PROGRESS
        </h3>
        {progress && progress.length > 0 ? (
          <div className="space-y-4">
            {progress.slice(0, 3).map((log: any) => (
              <div key={log.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <p className="font-bold text-white">{new Date(log.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Weight: {log.weight || 'N/A'}</p>
                </div>
                <div className="text-primary font-display font-bold uppercase tracking-widest">Logged</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No progress logged yet. Time to get to work!</p>
          </div>
        )}
      </div>
      
      <div className="w-full py-6 flex justify-center border-t border-white/5">
        <img src="/assets/placeholders/UNTAMED_LOGO.png" alt="UNTAMED" className="h-12 opacity-50 grayscale hover:grayscale-0 transition-all" />
      </div>
    </Layout>
  );
}

function HomeButton({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href}>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full flex flex-col items-center justify-center gap-2 p-4 glass-panel hover:bg-primary/20 hover:border-primary/50 transition-all rounded-2xl group"
      >
        <Icon className="w-6 h-6 text-primary group-hover:text-white" />
        <span className="text-[10px] font-display font-bold text-white tracking-widest">{label}</span>
      </motion.button>
    </Link>
  );
}

function StatsCard({ icon: Icon, title, value, suffix, color, bg }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5">
      <div className={`p-4 rounded-2xl ${bg} ${color} shadow-inner`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display font-bold text-white">{value}</span>
          <span className="text-xs text-muted-foreground lowercase">{suffix}</span>
        </div>
      </div>
    </motion.div>
  );
}
