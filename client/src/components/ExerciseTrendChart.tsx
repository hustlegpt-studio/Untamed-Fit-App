import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ExerciseTrend {
  exercise: string;
  trend: number;
  recentAverage: number;
  previousAverage?: number;
}

interface ExerciseTrendChartProps {
  data: ExerciseTrend[];
  title?: string;
  description?: string;
  height?: number;
}

export function ExerciseTrendChart({ 
  data, 
  title = "Exercise Performance Trends",
  description = "Strength changes across different exercises",
  height = 300
}: ExerciseTrendChartProps) {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return '#00C49F'; // Green
    if (trend < 0) return '#FF8042'; // Red
    return '#FFBB28'; // Yellow
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(data.trend)}
            <span className="font-medium">{data.exercise}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Trend: </span>
              <span className={data.trend > 0 ? "text-green-600" : data.trend < 0 ? "text-red-600" : "text-yellow-600"}>
                {data.trend > 0 ? '+' : ''}{data.trend.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Current Average: </span>
              <span>{data.recentAverage.toFixed(1)} lbs</span>
            </div>
            {data.previousAverage && (
              <div>
                <span className="text-muted-foreground">Previous Average: </span>
                <span>{data.previousAverage.toFixed(1)} lbs</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <Minus className="h-8 w-8 mb-2" />
        <p>No exercise data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="exercise" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="trend" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getTrendColor(entry.trend)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Improving</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Stable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Declining</span>
        </div>
      </div>
    </div>
  );
}
