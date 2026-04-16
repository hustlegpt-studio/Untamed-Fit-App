import React, { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useBookingSessions,
  useCreateBookingSession,
  useUpdateBookingSession,
  useDeleteBookingSession,
} from "@/hooks/use-booking-sessions";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Search,
  CalendarDays,
  Dumbbell,
  User,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  Crown,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Star,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const AVAILABLE_TIMES = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM",
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM",
];

const TRAINING_TYPES = [
  "Strength Training",
  "HIIT Cardio",
  "Military Bootcamp",
  "Mobility & Recovery",
  "Body Composition",
  "Endurance Training",
  "1-on-1 Coaching",
];

const DURATIONS = ["30 min", "45 min", "60 min", "90 min"];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function OwnerDashboard() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTrainee, setFilterTrainee] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAvailability, setShowAvailability] = useState(true);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "analytics" | "settings">("overview");

  // Form state for manual booking
  const [manualBooking, setManualBooking] = useState({
    traineeEmail: "",
    traineeName: "",
    traineePhone: "",
    date: "",
    time: "",
    duration: "",
    type: "",
    notes: "",
    priority: "normal",
  });

  // React Query hooks
  const { data: allSessions = [], isLoading } = useBookingSessions();
  const createMutation = useCreateBookingSession();
  const updateMutation = useUpdateBookingSession();
  const deleteMutation = useDeleteBookingSession();

  // Calendar helpers
  const calendarCells = buildCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = allSessions;

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((session: any) => session.status === filterStatus);
    }

    // Trainee filter
    if (filterTrainee !== "all") {
      filtered = filtered.filter((session: any) => session.traineeEmail === filterTrainee);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((session: any) => 
        session.traineeEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allSessions, filterStatus, filterTrainee, searchQuery]);

  // Get unique trainees
  const uniqueTrainees = useMemo(() => {
    const trainees = new Set(allSessions.map((session: any) => session.traineeEmail).filter(Boolean));
    return Array.from(trainees).sort();
  }, [allSessions]);

  // Get sessions for a specific date
  const getSessionsForDate = (date: string) => {
    return allSessions.filter((session: any) => session.date === date);
  };

  // Get available times for a date
  const getAvailableTimes = (date: string) => {
    const bookedTimes = getSessionsForDate(date)
      .filter((session: any) => session.status !== "cancelled")
      .map((session: any) => session.time);
    return AVAILABLE_TIMES.filter((time: string) => !bookedTimes.includes(time));
  };

  // Calendar day click handler
  const handleDayClick = (day: number) => {
    const date = formatDate(viewYear, viewMonth, day);
    setSelectedDate(date);
    setManualBooking(prev => ({ ...prev, date }));
  };

  // Manual booking handlers
  const handleCreateBooking = () => {
    if (!manualBooking.traineeEmail || !manualBooking.date || !manualBooking.time || !manualBooking.duration || !manualBooking.type) {
      return;
    }

    createMutation.mutate(manualBooking, {
      onSuccess: () => {
        setIsManualBookingOpen(false);
        setManualBooking({
          traineeEmail: "",
          traineeName: "",
          traineePhone: "",
          date: "",
          time: "",
          duration: "",
          type: "",
          notes: "",
          priority: "normal",
        });
      },
    });
  };

  const handleUpdateSession = (id: number, updates: any) => {
    updateMutation.mutate({ id, updates });
  };

  const handleDeleteSession = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setShowDeleteConfirm(null);
      },
    });
  };

  // Advanced analytics
  const analytics = useMemo(() => {
    const todayStr = today.toISOString().split("T")[0];
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const todaySessions = allSessions.filter((session: any) => session.date === todayStr);
    const thisMonthSessions = allSessions.filter((session: any) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= thisMonth && sessionDate < nextMonth;
    });

    const revenue = thisMonthSessions.reduce((total: number, session: any) => {
      const duration = parseInt(session.duration);
      const rate = duration <= 30 ? 50 : duration <= 45 ? 75 : duration <= 60 ? 100 : 150;
      return total + rate;
    }, 0);

    const completionRate = thisMonthSessions.length > 0 
      ? (thisMonthSessions.filter((s: any) => s.status === "completed").length / thisMonthSessions.length) * 100 
      : 0;

    const topTrainees = Object.entries(
      allSessions.reduce((acc: any, session: any) => {
        if (session.status === "completed") {
          acc[session.traineeEmail] = (acc[session.traineeEmail] || 0) + 1;
        }
        return acc;
      }, {})
    )
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([email, count]) => ({ email, count }));

    return {
      totalSessions: allSessions.length,
      todaySessions: todaySessions.length,
      thisMonthSessions: thisMonthSessions.length,
      revenue,
      completionRate,
      topTrainees,
      bookedSessions: allSessions.filter((session: any) => session.status === "booked").length,
      completedSessions: allSessions.filter((session: any) => session.status === "completed").length,
      cancelledSessions: allSessions.filter((session: any) => session.status === "cancelled").length,
    };
  }, [allSessions]);

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-white">
                OWNER <span className="text-gradient text-glow">DASHBOARD</span>
              </h1>
              <p className="text-silver mt-2 uppercase tracking-widest text-sm">
                Untamed Fit Admin Control
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsManualBookingOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold uppercase tracking-widest text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Admin Booking
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-silver hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "bookings", label: "Bookings", icon: CalendarDays },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
            { id: "settings", label: "Settings", icon: Shield },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-primary text-black" 
                  : "text-silver hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatsCard title="Total Sessions" value={analytics.totalSessions} icon={CalendarDays} color="text-primary" />
            <StatsCard title="Today" value={analytics.todaySessions} icon={Clock} color="text-green-400" />
            <StatsCard title="This Month" value={analytics.thisMonthSessions} icon={BarChart3} color="text-blue-400" />
            <StatsCard title="Revenue" value={`$${analytics.revenue}`} icon={DollarSign} color="text-green-500" />
            <StatsCard title="Completion Rate" value={`${Math.round(analytics.completionRate)}%`} icon={TrendingUp} color="text-purple-400" />
            <StatsCard title="Active Clients" value={uniqueTrainees.length} icon={Users} color="text-orange-400" />
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatsCard title="Booked" value={analytics.bookedSessions} icon={Users} color="text-orange-400" />
            <StatsCard title="Completed" value={analytics.completedSessions} icon={CheckCircle2} color="text-green-500" />
            <StatsCard title="Cancelled" value={analytics.cancelledSessions} icon={XCircle} color="text-red-500" />
            <StatsCard title="Revenue" value={`$${analytics.revenue}`} icon={DollarSign} color="text-green-500" />
            <StatsCard title="Completion Rate" value={`${Math.round(analytics.completionRate)}%`} icon={TrendingUp} color="text-purple-400" />
            <StatsCard title="Active Clients" value={uniqueTrainees.length} icon={Users} color="text-orange-400" />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Top Clients This Month
              </h3>
              <div className="space-y-3">
                {analytics.topTrainees.length === 0 ? (
                  <p className="text-silver text-center py-4">No completed sessions this month</p>
                ) : (
                  analytics.topTrainees.map((client: any, idx: number) => (
                    <div key={client.email} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{client.email}</div>
                          <div className="text-silver text-sm">{client.count} sessions</div>
                        </div>
                      </div>
                      <div className="text-primary font-bold">{client.count}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-silver">Monthly Revenue</span>
                  <span className="text-green-400 font-bold">${analytics.revenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-silver">Completion Rate</span>
                  <span className="text-purple-400 font-bold">{Math.round(analytics.completionRate)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-silver">Total Clients</span>
                  <span className="text-blue-400 font-bold">{uniqueTrainees.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-silver">Avg. Sessions/Client</span>
                  <span className="text-orange-400 font-bold">
                    {uniqueTrainees.length > 0 ? Math.round(analytics.completedSessions / uniqueTrainees.length) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-white/10 text-silver transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-white/10 text-silver transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-silver/60 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day: any, i: number) => {
                if (!day) return <div key={`empty-${i}`} />;
                const date = formatDate(viewYear, viewMonth, day);
                const sessions = getSessionsForDate(date);
                const activeSessions = sessions.filter((s: any) => s.status !== "cancelled");
                const isSelected = selectedDate === date;
                const isToday = date === today.toISOString().split("T")[0];

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative aspect-square rounded-xl text-sm font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1",
                      isSelected
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : isToday
                        ? "bg-accent/20 text-accent border border-accent/50"
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    {day}
                    {activeSessions.length > 0 && (
                      <div className="flex gap-0.5">
                        {activeSessions.slice(0, 3).map((session: any, idx: number) => (
                          <div
                            key={idx}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              session.status === "booked" ? "bg-primary" :
                              session.status === "completed" ? "bg-green-500" : "bg-red-500"
                            )}
                          />
                        ))}
                        {activeSessions.length > 3 && (
                          <div className="text-[6px] text-silver">+</div>
                        )}
                      </div>
                    )}
                    <div className="text-[8px] text-silver/60">
                      {activeSessions.length}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Date Sessions */}
            {selectedDate && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">
                  Sessions for {selectedDate}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getSessionsForDate(selectedDate).length === 0 ? (
                    <p className="text-silver text-center py-4">No sessions scheduled</p>
                  ) : (
                    getSessionsForDate(selectedDate).map((session: any) => (
                      <div
                        key={session.id}
                        className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{session.traineeEmail}</span>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              session.status === "booked" ? "bg-primary/20 text-primary" :
                              session.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {session.status}
                            </span>
                          </div>
                          <div className="text-sm text-silver">
                            {session.time} · {session.duration} · {session.type}
                          </div>
                          {session.notes && (
                            <div className="text-xs text-silver/60 italic mt-1">"{session.notes}"</div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateSession(session.id, { status: "completed" })}
                            className="h-7 px-2 text-xs text-green-400 hover:text-green-300"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSession(session)}
                            className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(session.id)}
                            className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {/* Advanced Filters */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Advanced Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                  Status
                </Label>
                <Select onValueChange={setFilterStatus} value={filterStatus}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                  Trainee
                </Label>
                <Select onValueChange={setFilterTrainee} value={filterTrainee}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trainees</SelectItem>
                    {uniqueTrainees.map((trainee: string) => (
                      <SelectItem key={trainee} value={trainee}>{trainee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email, type..."
                    className="bg-white/5 border-white/20 text-white pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              All Sessions
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <p className="text-silver text-center py-4">No sessions found</p>
              ) : (
                filteredSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{session.traineeEmail}</span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            session.status === "booked" ? "bg-primary/20 text-primary" :
                            session.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          )}>
                            {session.status}
                          </span>
                        </div>
                        <div className="text-xs text-silver">
                          {session.date} · {session.time}
                        </div>
                        <div className="text-xs text-silver">
                          {session.duration} · {session.type}
                        </div>
                        {session.notes && (
                          <div className="text-xs text-silver/60 italic mt-1">"{session.notes}"</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Booking Modal */}
      <AnimatePresence>
        {isManualBookingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsManualBookingOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-purple-500/30 p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Crown className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Admin Booking</h3>
                    <p className="text-sm text-silver">Full override capabilities</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManualBookingOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-silver" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Trainee Email
                    </Label>
                    <Input
                      value={manualBooking.traineeEmail}
                      onChange={(e) => setManualBooking(prev => ({ ...prev, traineeEmail: e.target.value }))}
                      placeholder="client@example.com"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Trainee Name
                    </Label>
                    <Input
                      value={manualBooking.traineeName}
                      onChange={(e) => setManualBooking(prev => ({ ...prev, traineeName: e.target.value }))}
                      placeholder="John Doe"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                    Phone (Optional)
                  </Label>
                  <Input
                    value={manualBooking.traineePhone}
                    onChange={(e) => setManualBooking(prev => ({ ...prev, traineePhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={manualBooking.date}
                      onChange={(e) => setManualBooking(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Time
                    </Label>
                    <Select onValueChange={(value) => setManualBooking(prev => ({ ...prev, time: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_TIMES.map((time: string) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Duration
                    </Label>
                    <Select onValueChange={(value) => setManualBooking(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((duration: string) => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Training Type
                    </Label>
                    <Select onValueChange={(value) => setManualBooking(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAINING_TYPES.map((type: string) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                    Priority
                  </Label>
                  <Select onValueChange={(value) => setManualBooking(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="vip">VIP Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    value={manualBooking.notes}
                    onChange={(e) => setManualBooking(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Special requests, VIP notes, etc..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-silver/40 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsManualBookingOpen(false)}
                  className="flex-1 border-white/20 text-silver hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  {createMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Booking"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Session</h3>
                  <p className="text-sm text-silver">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-silver text-sm mb-6">
                Are you sure you want to delete this session?
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 border-white/20 text-silver hover:text-white"
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteSession(showDeleteConfirm)}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl flex flex-col items-center gap-2 border border-white/5">
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-xs text-silver uppercase tracking-widest">{title}</div>
    </motion.div>
  );
}
