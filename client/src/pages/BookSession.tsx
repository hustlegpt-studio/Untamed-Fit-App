import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { getActiveUser } from "@/utils/auth";
import {
  useBookingSessions,
  useBookingSessionsByDate,
  useBookingSessionsByTrainee,
  useCreateBookingSession,
  useUpdateBookingSession,
} from "@/hooks/use-booking-sessions";
import {
  AVAILABLE_TIMES,
  TRAINING_TYPES,
  DURATIONS,
  canCancelSession,
} from "@/utils/schedule";
import { addNotification } from "@/utils/notifications";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

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

export default function BookSession() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"calendar" | "form" | "success">("calendar");
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  const email = getActiveUser() || "guest@untamed.fit";
  
  // React Query hooks
  const { data: sessions = [] } = useBookingSessions();
  const { data: mySessions = [] } = useBookingSessionsByTrainee(email);
  const createMutation = useCreateBookingSession();
  const updateMutation = useUpdateBookingSession();

  const calendarCells = buildCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isPastDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isDateFullyBooked = (date: string) => {
    const dateSessions = sessions.filter((s: any) => s.date === date && s.status !== "cancelled");
    return dateSessions.length >= 8;
  };

  const selectedDate = selectedDay ? formatDate(viewYear, viewMonth, selectedDay) : "";
  const { data: selectedDateSessions = [] } = useBookingSessionsByDate(selectedDate);
  const bookedTimes = selectedDate ? selectedDateSessions.filter((s: any) => s.status !== "cancelled").map((s: any) => s.time) : [];
  const availableTimes = AVAILABLE_TIMES.filter((t: string) => !bookedTimes.includes(t));

  const handleDayClick = (day: number) => {
    if (isPastDay(day)) return;
    setSelectedDay(day);
    setSelectedTime("");
    setStep("calendar");
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !selectedType || !selectedDuration) return;

    const sessionData = {
      traineeEmail: email,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      type: selectedType,
      notes,
    };

    createMutation.mutate(sessionData, {
      onSuccess: () => {
        addNotification({
          type: "booking",
          message: `${email} booked a ${selectedType} session on ${selectedDate} at ${selectedTime}.`,
          read: false,
        });
        setStep("success");
      },
    });
  };

  const handleCancel = (session: any) => {
    if (!canCancelSession(session.date)) {
      setCancelMsg("Sessions can only be canceled with 2 days' notice.");
      setTimeout(() => setCancelMsg(null), 4000);
      return;
    }
    updateMutation.mutate({
      id: session.id,
      updates: { status: "cancelled" }
    }, {
      onSuccess: () => {
        addNotification({
          type: "cancellation",
          message: `${email} cancelled their ${session.type} session on ${session.date} at ${session.time}.`,
          read: false,
        });
      },
    });
  };

  const resetForm = () => {
    setSelectedDay(null);
    setSelectedTime("");
    setSelectedType("");
    setSelectedDuration("");
    setNotes("");
    setStep("calendar");
  };

  return (
    <Layout>
      <header className="mb-10 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          BOOK A <span className="text-primary text-glow">SESSION</span>
        </h1>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">
          Reserve your 1-on-1 training time with Kevin
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Calendar + Booking Flow */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step: Calendar */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            {/* Month Nav */}
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
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-silver/60 uppercase py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day: any, i: number) => {
                if (!day) return <div key={`empty-${i}`} />;
                const date = formatDate(viewYear, viewMonth, day);
                const past = isPastDay(day);
                const fullyBooked = isDateFullyBooked(date);
                const hasBooking = mySessions.some((s: any) => s.date === date && s.status !== "cancelled");
                const isSelected = selectedDay === day;
                const hasSlots = !past && !fullyBooked;

                return (
                  <motion.button
                    key={day}
                    whileHover={hasSlots ? { scale: 1.08 } : {}}
                    whileTap={hasSlots ? { scale: 0.96 } : {}}
                    onClick={() => handleDayClick(day)}
                    disabled={past || fullyBooked}
                    className={cn(
                      "relative aspect-square rounded-xl text-sm font-bold transition-all duration-150 flex flex-col items-center justify-center gap-0.5",
                      isSelected
                        ? "bg-primary text-black shadow-lg shadow-primary/40"
                        : hasBooking
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : past
                        ? "text-white/20 cursor-not-allowed"
                        : fullyBooked
                        ? "bg-destructive/10 text-destructive/50 cursor-not-allowed"
                        : "text-white hover:bg-white/10 cursor-pointer"
                    )}
                  >
                    {day}
                    {hasBooking && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {fullyBooked && !past && (
                      <span className="text-[8px] text-destructive/60 uppercase">Full</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-silver/60">
                <div className="w-3 h-3 rounded-full bg-primary" /> Your booking
              </div>
              <div className="flex items-center gap-2 text-xs text-silver/60">
                <div className="w-3 h-3 rounded-full bg-destructive/50" /> Fully booked
              </div>
              <div className="flex items-center gap-2 text-xs text-silver/60">
                <div className="w-3 h-3 rounded-full bg-white/20" /> Available
              </div>
            </div>
          </div>

          {/* Step: Time Slots / Booking Form / Success */}
          <AnimatePresence mode="wait">
            {step === "calendar" && selectedDay && (
              <motion.div
                key="timeslots"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel rounded-2xl p-6 border border-white/10"
              >
                <h3 className="font-display font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Available Times — {MONTHS[viewMonth]} {selectedDay}
                </h3>

                {availableTimes.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/30">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm text-silver">No available sessions on this day.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6">
                      {availableTimes.map((time: string) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all",
                            selectedTime === time
                              ? "bg-primary text-black border-primary shadow-md shadow-primary/30"
                              : "border-white/20 text-silver hover:border-primary/60 hover:text-white"
                          )}
                        >
                          {time}
                        </motion.button>
                      ))}
                    </div>

                    {selectedTime && (
                      <Button
                        onClick={() => setStep("form")}
                        className="w-full bg-primary text-black hover:bg-primary/90 rounded-xl font-bold uppercase tracking-widest h-12"
                      >
                        Book Session at {selectedTime} →
                      </Button>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel rounded-2xl p-6 border border-primary/30"
              >
                <h3 className="font-display font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Confirm Your Booking
                </h3>

                {/* Summary */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-1 border border-white/10">
                  <p className="text-xs text-silver/70 uppercase font-bold tracking-widest">Session Details</p>
                  <p className="text-white font-bold">
                    {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                  </p>
                  <p className="text-primary font-bold">{selectedTime}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Training Type
                    </Label>
                    <Select onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl h-12">
                        <SelectValue placeholder="Select training type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAINING_TYPES.map((t: string) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Duration
                    </Label>
                    <Select onValueChange={setSelectedDuration}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl h-12">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((d: string) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-silver text-xs uppercase font-bold tracking-widest mb-2 block">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any injuries, goals, or requests for Kevin..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-silver/40 rounded-xl resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep("calendar")}
                    className="flex-1 border-white/20 text-silver hover:text-white rounded-xl font-bold uppercase tracking-widest h-12"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={handleBook}
                    disabled={!selectedType || !selectedDuration}
                    className="flex-1 bg-primary text-black hover:bg-primary/90 rounded-xl font-bold uppercase tracking-widest h-12 disabled:opacity-50"
                  >
                    Confirm Booking
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-2xl p-8 border border-primary/50 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-2">
                  Session Booked!
                </h3>
                <p className="text-silver mb-2">
                  Your session has been booked!
                </p>
                <p className="text-primary font-bold mb-6">
                  {MONTHS[viewMonth]} {selectedDay} at {selectedTime} · {selectedDuration} · {selectedType}
                </p>
                <Button
                  onClick={resetForm}
                  className="bg-primary text-black hover:bg-primary/90 rounded-xl font-bold uppercase tracking-widest h-12 px-10"
                >
                  Book Another Session
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: My Sessions */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="font-display font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              My Sessions
            </h3>

            {cancelMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl mb-4"
              >
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive font-semibold">{cancelMsg}</p>
              </motion.div>
            )}

            {mySessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-silver/30 mx-auto mb-3" />
                <p className="text-silver/60 text-sm">No sessions booked yet.</p>
                <p className="text-silver/40 text-xs mt-1">Pick a day on the calendar to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...mySessions]
                  .filter((session: any) => session.status !== "cancelled")
                  .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session: any) => {
                    const canCancel = canCancelSession(session.date);
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-bold text-sm">{session.type}</p>
                            <p className="text-primary text-xs font-semibold">
                              {session.date} · {session.time}
                            </p>
                            <p className="text-silver/60 text-xs">{session.duration}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-primary/20 text-primary flex-shrink-0">
                            {session.status === "booked" ? "Booked" : session.status}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-silver/50 text-xs italic">"{session.notes}"</p>
                        )}
                        <button
                          onClick={() => handleCancel(session)}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            canCancel
                              ? "text-destructive hover:bg-destructive/10 border border-destructive/30"
                              : "text-silver/30 border border-white/10 cursor-not-allowed"
                          )}
                          disabled={!canCancel}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {canCancel ? "Cancel Session" : "Cannot Cancel"}
                        </button>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="glass-panel rounded-2xl p-6 border border-accent/20 bg-accent/5">
            <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">
              Booking Policy
            </h4>
            <ul className="space-y-2 text-xs text-silver/70">
              <li>• Sessions must be cancelled 2+ days in advance</li>
              <li>• Arrive 10 minutes early for your session</li>
              <li>• Bring water and workout gear</li>
              <li>• Kevin will confirm via notification</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
