import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface ConsistencyMeterProps {
  score: number;
  weeklyWorkoutCount: number;
  totalWorkouts: number;
  missedWorkouts: number;
  targetWeeklyWorkouts?: number;
  title?: string;
}

export function ConsistencyMeter({ 
  score, 
  weeklyWorkoutCount, 
  totalWorkouts, 
  missedWorkouts,
  targetWeeklyWorkouts = 4,
  title = "Workout Consistency"
}: ConsistencyMeterProps) {
  const getConsistencyLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100" };
    if (score >= 75) return { level: "Great", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (score >= 60) return { level: "Good", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (score >= 40) return { level: "Fair", color: "text-orange-600", bgColor: "bg-orange-100" };
    return { level: "Needs Work", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const consistencyLevel = getConsistencyLevel(score);
  const completionRate = totalWorkouts + missedWorkouts > 0 ? 
    (totalWorkouts / (totalWorkouts + missedWorkouts)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Consistency Score */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${consistencyLevel.bgColor} ${consistencyLevel.color}`}>
            {consistencyLevel.level}
          </div>
          <div className="text-3xl font-bold">{score}%</div>
          <p className="text-sm text-muted-foreground">Overall Consistency Score</p>
          <Progress 
            value={score} 
            className="w-full h-3"
            // @ts-ignore
            style={{ 
              "--progress-background": getProgressColor(score) 
            } as React.CSSProperties}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{weeklyWorkoutCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Weekly Average</p>
            <p className="text-xs text-muted-foreground">Target: {targetWeeklyWorkouts}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{totalWorkouts}</span>
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </div>
        </div>

        {/* Missed Workouts Alert */}
        {missedWorkouts > 0 && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                {missedWorkouts} missed {missedWorkouts === 1 ? 'workout' : 'workouts'}
              </p>
              <p className="text-xs text-orange-600">
                Try to maintain a more consistent schedule for better results
              </p>
            </div>
          </div>
        )}

        {/* Achievement Badges */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Achievements</p>
          <div className="flex flex-wrap gap-2">
            {score >= 90 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🏆 Consistency Champion
              </Badge>
            )}
            {weeklyWorkoutCount >= targetWeeklyWorkouts && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                💪 Weekly Goal Met
              </Badge>
            )}
            {totalWorkouts >= 20 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                🎯 20+ Workouts
              </Badge>
            )}
            {completionRate >= 80 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                ⭐ High Completion Rate
              </Badge>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-sm font-medium text-gray-800">
            {score >= 80 && "🔥 Outstanding consistency! You're building strong habits."}
            {score >= 60 && score < 80 && "💪 Good progress! Keep pushing forward."}
            {score >= 40 && score < 60 && "📈 You're on the right track. Let's increase frequency!"}
            {score < 40 && "🚀 Every workout counts! Start with small, consistent steps."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
