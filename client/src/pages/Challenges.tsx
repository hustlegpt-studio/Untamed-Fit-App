import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress as ProgressUI } from "@/components/ui/progress";
import { Target, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Challenges() {
  return (
    <Layout>
      <header className="mb-10 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          WEEKLY <span className="text-primary text-glow">CHALLENGES</span>
        </h1>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">Push your limits • Earn rewards</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-primary/20 bg-primary/5 overflow-hidden rounded-3xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase mb-2 inline-block">
                    Active Challenge
                  </div>
                  <CardTitle className="text-3xl font-display text-white uppercase">100 Push-ups a day</CardTitle>
                </div>
                <Flame className="text-primary w-8 h-8" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-silver mb-6">Complete 100 push-ups every day for a week. Stay consistent, stay untamed.</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold tracking-widest text-white uppercase">
                  <span>Progress</span>
                  <span>45%</span>
                </div>
                <ProgressUI value={45} className="h-3 bg-white/10" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Trophy className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Reward</p>
                  <p className="text-white font-bold uppercase">Untamed Pro Badge + 50 XP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ChallengeSmallCard title="Plank Master" goal="5 Min Plank" xp="30 XP" />
             <ChallengeSmallCard title="Squat King" goal="500 Squats" xp="40 XP" />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-white/5 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white flex items-center gap-2">
                <Target className="text-primary" /> LEADERBOARD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Kevin G.", score: "2,450 XP", rank: 1 },
                  { name: "TMG Rambo", score: "2,100 XP", rank: 2 },
                  { name: "You", score: "1,850 XP", rank: 3 },
                  { name: "BeastMode", score: "1,600 XP", rank: 4 },
                ].map((user) => (
                  <div key={user.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-bold font-display ${user.rank === 1 ? 'text-primary' : 'text-silver'}`}>
                        {user.rank}
                      </span>
                      <span className="text-white font-bold">{user.name}</span>
                    </div>
                    <span className="text-primary font-display font-bold">{user.score}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-xl font-bold tracking-widest text-xs h-12">
                VIEW FULL RANKINGS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function ChallengeSmallCard({ title, goal, xp }: any) {
  return (
    <Card className="glass-panel border-white/5 rounded-2xl hover:border-primary/30 transition-all cursor-pointer">
      <CardContent className="pt-6">
        <h4 className="text-lg font-display text-white mb-1 uppercase font-bold">{title}</h4>
        <p className="text-primary text-xs font-bold tracking-widest mb-4 uppercase">{goal}</p>
        <div className="flex items-center justify-between">
           <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{xp}</span>
           <Button size="sm" variant="ghost" className="text-primary text-[10px] font-bold uppercase tracking-widest p-0 h-auto">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
