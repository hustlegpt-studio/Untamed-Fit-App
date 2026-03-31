import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProgress, useLogProgress } from "@/hooks/use-progress";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Scale, TrendingUp } from "lucide-react";

export default function Progress() {
  const { data: progress } = useProgress();
  const logMutation = useLogProgress();
  const [weight, setWeight] = useState("");

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    await logMutation.mutateAsync({ weight, userId: 1 }); // Hardcoded userId for demo
    setWeight("");
  };

  // Format data for chart
  const chartData = (progress || []).map((log: any) => ({
    date: format(new Date(log.date), 'MMM dd'),
    weight: parseFloat(log.weight) || 0
  })).reverse(); // Assuming API returns newest first

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">TRACK RECORD</h1>
            <p className="text-muted-foreground">Numbers don't lie.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Log Form */}
        <div className="glass-panel p-6 rounded-3xl h-fit border border-primary/20 box-glow">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <Scale className="w-6 h-6" />
            <h3 className="font-display text-xl font-bold">LOG WEIGHT</h3>
          </div>
          <form onSubmit={handleLog} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">Today's Weight (lbs)</label>
              <Input 
                type="number" 
                step="0.1"
                placeholder="e.g. 185.5" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={logMutation.isPending || !weight}>
              {logMutation.isPending ? "LOGGING..." : "SAVE PROGRESS"}
            </Button>
          </form>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-accent" />
            <h3 className="font-display text-xl font-bold">WEIGHT TREND</h3>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} axisLine={false} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#888" tick={{ fill: '#888' }} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#00FF7A' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#00FF7A" 
                    strokeWidth={3}
                    dot={{ fill: '#00FF7A', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, fill: '#FF7A00', stroke: '#000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                Log your first weight to see trends
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
