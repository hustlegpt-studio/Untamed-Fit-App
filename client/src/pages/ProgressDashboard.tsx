import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Activity, Target, Calendar, Award, 
  Dumbbell, ChevronUp, ChevronDown, BarChart3, Clock, CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserProfile } from "@/utils/auth";

interface ProgressData {
  weeklyWorkoutCount: number;
  consistencyScore: number;
  strengthTrends: Array<{
    exercise: string;
    trend: number;
    recentAverage: number;
  }>;
  volumeTrend: Array<{
    week: string;
    volume: number;
  }>;
  difficultyTrends: Array<{
    exercise: string;
    trend: number;
    recentAverage: number;
  }>;
  weightTrend: Array<{
    date: string;
    weight: number;
  }>;
  totalWorkouts: number;
  missedWorkouts: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProgressDashboard() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchProgressData();
  }, [timeRange]);

  const fetchUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/progress/summary?userEmail=${userProfile?.email || 'user@example.com'}`);
      if (!response.ok) throw new Error('Failed to fetch progress data');
      const data = await response.json();
      setProgressData(data.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  const formatVolumeData = () => {
    if (!progressData?.volumeTrend) return [];
    return progressData.volumeTrend.map(item => ({
      ...item,
      volume: Math.round(item.volume / 1000) // Convert to kg for better readability
    }));
  };

  const formatWeightData = () => {
    if (!progressData?.weightTrend) return [];
    return progressData.weightTrend.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: item.weight
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!progressData) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No progress data available yet.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/workouts'}>
            Start Working Out
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Progress Dashboard</h1>
            <p className="text-muted-foreground">Track your fitness journey and performance trends</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.weeklyWorkoutCount}</div>
              <p className="text-xs text-muted-foreground">per week average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistency Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getConsistencyColor(progressData.consistencyScore)}`}>
                {progressData.consistencyScore}%
              </div>
              <Progress value={progressData.consistencyScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strength Gains</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {progressData.strengthTrends?.filter(t => t.trend > 0).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">exercises improving</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Volume Trend</CardTitle>
              <CardDescription>Weekly training volume (in kg)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formatVolumeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weight Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Body Weight Progress</CardTitle>
              <CardDescription>Weight tracking over time</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.weightTrend && progressData.weightTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formatWeightData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No weight data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Strength Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Strength Trends by Exercise</CardTitle>
            <CardDescription>Performance changes across different exercises</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.strengthTrends && progressData.strengthTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData.strengthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exercise" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trend" fill="#8884d8">
                    {progressData.strengthTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.trend > 0 ? '#00C49F' : '#FF8042'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No strength data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Performance Details</CardTitle>
            <CardDescription>Detailed breakdown of your exercise performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.strengthTrends?.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exercise.exercise}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: {exercise.recentAverage.toFixed(1)} lbs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(exercise.trend)}
                    <Badge variant={exercise.trend > 0 ? "default" : "secondary"}>
                      {exercise.trend > 0 ? '+' : ''}{exercise.trend.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              AI Progress Summary
            </CardTitle>
            <CardDescription>Personalized insights from your AI trainer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Great consistency!</p>
                  <p className="text-sm text-muted-foreground">
                    You've maintained a {progressData.consistencyScore}% workout completion rate
                  </p>
                </div>
              </div>
              
              {progressData.strengthTrends?.filter(t => t.trend > 0).length > 0 && (
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Strength gains detected</p>
                    <p className="text-sm text-muted-foreground">
                      {progressData.strengthTrends.filter(t => t.trend > 0).length} exercises showing improvement
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Training frequency</p>
                  <p className="text-sm text-muted-foreground">
                    {progressData.weeklyWorkoutCount} workouts per week on average
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/ask-kevin'}
              >
                Ask AI for Detailed Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
