import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Minus, Activity, Target, Award, 
  Calendar, BarChart3, Clock, CheckCircle 
} from "lucide-react";

interface TrendData {
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface TrendSummaryCardProps {
  title: string;
  description?: string;
  trends: TrendData[];
  insights?: string[];
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function TrendSummaryCard({ 
  title, 
  description, 
  trends, 
  insights = [],
  actionButton 
}: TrendSummaryCardProps) {
  const getTrendIcon = (trend?: number) => {
    if (trend === undefined) return <Minus className="h-4 w-4" />;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const getTrendColor = (trend?: number) => {
    if (trend === undefined) return "text-gray-600";
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-yellow-600";
  };

  const getTrendBadgeVariant = (trend?: number) => {
    if (trend === undefined) return "secondary";
    if (trend > 0) return "default";
    if (trend < 0) return "destructive";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Items */}
        <div className="space-y-4">
          {trends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {trend.icon || <Activity className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className="font-medium">{trend.label}</p>
                  <p className="text-sm text-muted-foreground">{trend.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(trend.trend)}
                {trend.trend !== undefined && (
                  <Badge variant={getTrendBadgeVariant(trend.trend)}>
                    {trend.trend > 0 ? '+' : ''}{trend.trend.toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium">Key Insights</h4>
            </div>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {actionButton && (
          <div className="pt-4 border-t">
            <button
              onClick={actionButton.onClick}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {actionButton.label}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured trend summary components
export function StrengthTrendSummary({ data }: { data: any[] }) {
  const improvingExercises = data.filter(t => t.trend > 0);
  const decliningExercises = data.filter(t => t.trend < 0);
  const stableExercises = data.filter(t => Math.abs(t.trend || 0) < 0.1);

  const trends = [
    {
      label: "Improving Exercises",
      value: improvingExercises.length,
      trend: improvingExercises.length > 0 ? 15.5 : 0,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      label: "Stable Exercises",
      value: stableExercises.length,
      trend: 0,
      icon: <Minus className="h-5 w-5 text-yellow-600" />
    },
    {
      label: "Declining Exercises",
      value: decliningExercises.length,
      trend: decliningExercises.length > 0 ? -5.2 : 0,
      icon: <TrendingDown className="h-5 w-5 text-red-600" />
    }
  ];

  const insights = [
    improvingExercises.length > 0 && `${improvingExercises.length} exercises showing strength gains`,
    decliningExercises.length > 0 && `${decliningExercises.length} exercises need attention`,
    "Focus on progressive overload for continued improvement"
  ].filter(Boolean) as string[];

  return (
    <TrendSummaryCard
      title="Strength Performance Summary"
      description="Overview of your strength training progress"
      trends={trends}
      insights={insights}
      actionButton={{
        label: "View Detailed Analysis",
        onClick: () => window.location.href = '/progress-dashboard'
      }}
    />
  );
}

export function ConsistencyTrendSummary({ 
  consistencyScore, 
  weeklyWorkoutCount, 
  totalWorkouts 
}: {
  consistencyScore: number;
  weeklyWorkoutCount: number;
  totalWorkouts: number;
}) {
  const trends = [
    {
      label: "Weekly Average",
      value: `${weeklyWorkoutCount} workouts`,
      trend: weeklyWorkoutCount >= 3 ? 12.5 : -8.3,
      icon: <Calendar className="h-5 w-5 text-blue-600" />
    },
    {
      label: "Completion Rate",
      value: `${consistencyScore}%`,
      trend: consistencyScore >= 80 ? 5.2 : -3.1,
      icon: <Target className="h-5 w-5 text-green-600" />
    },
    {
      label: "Total Sessions",
      value: totalWorkouts.toString(),
      trend: 18.7,
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />
    }
  ];

  const insights = [
    consistencyScore >= 80 && "Excellent consistency - you're building strong habits",
    consistencyScore >= 60 && consistencyScore < 80 && "Good progress, aim for slight improvement",
    consistencyScore < 60 && "Focus on increasing workout frequency for better results",
    `${weeklyWorkoutCount} workouts per week is ${weeklyWorkoutCount >= 3 ? 'great' : 'below optimal'}`
  ].filter(Boolean) as string[];

  return (
    <TrendSummaryCard
      title="Consistency & Frequency Summary"
      description="Your workout regularity and adherence patterns"
      trends={trends}
      insights={insights}
      actionButton={{
        label: "Improve Consistency Plan",
        onClick: () => window.location.href = '/ask-kevin'
      }}
    />
  );
}
